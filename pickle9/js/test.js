(function() {
    
    // Init some useful stuff for easier access (don't need 'em all)
    var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,   b2AABB = Box2D.Collision.b2AABB
    ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,   b2Body = Box2D.Dynamics.b2Body
    ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture = Box2D.Dynamics.b2Fixture
    ,   b2World = Box2D.Dynamics.b2World
    ,   b2MassData = Box2D.Collision.Shapes.b2MassData
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,   world
    ,   SCALE = 30
    ,   canvas
    ,   ctx
    ,   fixDef
    ,   waterSensor 
    ,   buoyancyController
    ,   shapes = {}
    ,   door=2 
    ;

    var debug = true;

    var fixtureProperties = {
        density: 0.75,
        friction: 0.5,
        restitution: 0.3
    }

    //mouse
    var mouseX
    ,   mouseY
    ,   mousePVec
    ,   isMouseDown
    ,   selectedBody
    ,   mouseJoint
    ;


    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame|| 
        window.webkitRequestAnimationFrame  || 
        window.mozRequestAnimationFrame     || 
        window.oRequestAnimationFrame       || 
        window.msRequestAnimationFrame      || 
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
    })();

        document.addEventListener("mousedown", function(e) {
                isMouseDown = true;
                    handleMouseMove(e);
                    document.addEventListener("mousemove", handleMouseMove, true);
        }, true);
         
         document.addEventListener("mouseup", function() {
            document.removeEventListener("mousemove", handleMouseMove, true);
            isMouseDown = false;
            mouseX = undefined;
            mouseY = undefined;
         }, true);
         
         function handleMouseMove(e) {
            mouseX = (e.clientX - canvasPosition.x) / 30;
            mouseY = (e.clientY - canvasPosition.y) / 30;
            console.log(mouseX);
         };
         
         function getBodyAtMouse() {
            mousePVec = new b2Vec2(mouseX, mouseY);
            var aabb = new b2AABB();
            //console.log(aabb);
            aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
            aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
            
            // Query the world for overlapping shapes.
            selectedBody = null;
            world.QueryAABB(getBodyCB, aabb);
            return selectedBody;
         }

         function getBodyCB(fixture) {
            if(fixture.GetBody().GetType()!= b2Body.b2_staticBody) {
               if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                  selectedBody = fixture.GetBody();
                  return false;
               }
            }else if(fixture.GetBody().GetUserData()=="oven"){
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                  selectedBody = fixture.GetBody();
                  //added by me
                  world.DestroyBody(selectedBody);
                  bod=fixture.GetBody().GetUserData();
                  console.log(bod);
                  //end of added
                  return false;
                }
            }
            return false;
         }


    var init = {
        start: function(id) {
            this.canvas(id);

            box2d.create.world();
            box2d.create.defaultFixture();
            
            this.surroundings.walls();
            this.surroundings.units();
            //add.bigPot();
            add.door1();
            add.door2();
            add.pot();

            this.listenForContact();
            
            
            // On my signal: Unleash pickle.
            (function pickle() {
                loop.step();
                loop.update();
                if (debug) {
                    world.DrawDebugData();
                }
                loop.draw();
                requestAnimFrame(pickle);
            })();
        },
        canvas: function(id) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext("2d");
            canvasPosition = helpers.getElementPosition(document.getElementById("canvasId"));
        },
        
        surroundings: {
            walls: function() {
                // add.box({x: 35.13, y: 12.8,height: 25.6, width:2, isStatic: true});// right
                // add.box({x: 17.07, y: 26.6,height: 2, width:34.13, isStatic: true});//ground
                // add.box({x: -1, y: 12.8, height: 25.6, width:2, isStatic: true});//left
            },
            units: function() {
                box2d.createBoxBody(6.53 , 20.1 , 8.6 , 11  , b2Body.b2_staticBody, false, "unit1");
                box2d.createBoxBody(13.15, 22.9 , 4.7 , 4.96, b2Body.b2_staticBody, false, "cooker");
                box2d.createBoxBody(20.3 , 20.1 , 9.4 , 11  , b2Body.b2_staticBody, false, "unit2");
                box2d.createBoxBody(28.87, 20.47, 7.67, 10.2, b2Body.b2_staticBody, false, "freezer");
                box2d.createBoxBody(28.87, 12.73, 6   , 0.1 , b2Body.b2_staticBody, false, "shelf1");
                box2d.createBoxBody(28.87, 10   , 6   , 0.1 , b2Body.b2_staticBody, false, "shelf2");
                box2d.createBoxBody(32.29, 11.47, 0.7 , 7.8 , b2Body.b2_staticBody, false, "fridgeW");
                box2d.createBoxBody(28.46, 7.6  , 6.83, 0.1 , b2Body.b2_staticBody, false, "fridgeT");
                box2d.createBoxBody(5    , 7.75 , 10.1, 1.1 , b2Body.b2_staticBody, false, "shelf3");
                box2d.createBoxBody(33.4 , 20.1 , 1.47, 11  , b2Body.b2_staticBody, false, "unit3");
            },
        },
        listenForContact:function(){
            var listener = new Box2D.Dynamics.b2ContactListener;
            listener.BeginContact = function(contact){
                
                var fixtureA = contact.GetFixtureA();
                var fixtureB = contact.GetFixtureB();
                if(fixtureA.IsSensor()){
                  //alert("we have contact2");
                  var bodyB = fixtureB.GetBody();
                  if(!bodyB.GetControllerList()) buoyancyController.AddBody(bodyB);
                }else if(fixtureB.IsSensor()){
                  var bodyA = fixtureA.GetBody();
                  if(!bodyA.GetControllerList()) buoyancyController.AddBody(bodyA);
                }
            }
            listener.EndContact = function(contact){
                var fixtureA = contact.GetFixtureA();
                var fixtureB = contact.GetFixtureB();
                if(fixtureA.IsSensor()){
                  var bodyB = fixtureB.GetBody();
                  //console.log(bodyB);
                  if(bodyB.GetControllerList()) buoyancyController.RemoveBody(bodyB);
                }else if(fixtureB.IsSensor()){
                  var bodyA = fixtureA.GetBody();
                  if(bodyA.GetControllerList()) buoyancyController.RemoveBody(bodyA);
                }
            }
            world.SetContactListener(listener);
        },
        
    };        
     
     
    var add = {

        door1: function() {
            ovenDoor = box2d.createBoxBody(13.15, 14.7 , 4.7 , 0.2, b2Body.b2_staticBody, false,"oven");
            
        },
        door2: function() {
            fridgeDoor = box2d.createBoxBody(25.32, 11.47, 0.7 , 7.8 , b2Body.b2_staticBody, false,"fridge");
        },
        pot: function(options) {
            console.log('pot');
            var shape = new Pot(options);
            shapes[shape.id] = shape;
            box2d.addPotToWorld(shape); //addPotToWorld creates object from verticies
        },
    };


    var box2d = {

        addToWorld: function(shape) {
            //console.log('add to world');
            var bodyDef = this.create.bodyDef(shape);
            var body = world.CreateBody(bodyDef);
            if (shape.radius) {
                fixDef.shape = new b2CircleShape(shape.radius);
            } else{
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(shape.width / 2, shape.height / 2);
            }
            body.CreateFixture(fixDef);
        },

        createBoxBody: function (px, py, width, height, bodyType, isSensor, name){
            var bodyDef = new b2BodyDef();
            bodyDef.type = bodyType;
            bodyDef.position.x = px;
            bodyDef.position.y = py;
            bodyDef.userData = name;
            //console.log(bodyDef.userData);
            
            var fixtureDef = new b2FixtureDef();
            fixtureDef.isSensor = isSensor;
            fixtureDef.density = fixtureProperties.density;
            fixtureDef.friction = fixtureProperties.friction;
            fixtureDef.restitution = fixtureProperties.restitution;
           
            fixtureDef.shape = new b2PolygonShape();
            fixtureDef.shape.SetAsBox(width/2, height/2);
            var body = world.CreateBody(bodyDef);
            var fixture = body.CreateFixture(fixtureDef);
            
            //console.log(fixtureDef.density, fixtureDef.friction);
            return body;
        },
        create: {
            world: function() {
                world = new b2World(
                    new b2Vec2(0, 20)    //gravity
                    , false              //allow sleep
                );
                
                if (debug) {
                    var debugDraw = new b2DebugDraw();
                    debugDraw.SetSprite(ctx);
                    debugDraw.SetDrawScale(SCALE);
                    debugDraw.SetFillAlpha(0.3);
                    debugDraw.SetLineThickness(1.0);
                    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                    world.SetDebugDraw(debugDraw);
                }
            },
            defaultFixture: function() {
                fixDef = new b2FixtureDef;
                fixDef.density = 1.0;
                fixDef.friction = 0.5;
                fixDef.restitution = 0.2;
            },
            bodyDef: function(shape) {
                var bodyDef = new b2BodyDef;
        
                if (shape.isStatic == true) {
                    bodyDef.type = b2Body.b2_staticBody;
                } else {
                    bodyDef.type = b2Body.b2_dynamicBody;
                }
                bodyDef.position.x = shape.x;
                bodyDef.position.y = shape.y;
                bodyDef.userData = shape.id;
                bodyDef.angle = shape.angle;
            
                return bodyDef;
            },    
        },

        get: {
            bodySpec: function(b) {
                return {
                    x: b.GetPosition().x, 
                    y: b.GetPosition().y, 
                    angle: b.GetAngle(), 
                    center: {
                        x: b.GetWorldCenter().x, 
                        y: b.GetWorldCenter().y
                    }
                };
            }
        }
    };


    var loop = {
        step: function() {
            var stepRate = 1 / 60;
            world.Step(stepRate, 10, 10);
            world.ClearForces();
        },
        update: function () { 

            if(isMouseDown && (!mouseJoint)) {
               body = getBodyAtMouse();
               if(body) {
                  var md = new b2MouseJointDef();
                  md.bodyA = world.GetGroundBody();
                  md.bodyB = body;
                  md.target.Set(mouseX, mouseY);
                  md.dampingRatio=0.5;
                  md.frequency=0.5;
                  md.collideConnected = true;
                  md.maxForce = 300.0 * body.GetMass();
                  mouseJoint = world.CreateJoint(md);
                  body.SetAwake(true);
               }
            }
            
            if(mouseJoint) {
               if(isMouseDown) {
                  mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
               } else {
                  world.DestroyJoint(mouseJoint);
                  mouseJoint = null;
               }
            }

            // for (var b = world.GetBodyList(); b; b = b.m_next) {
            //     if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
            //         shapes[b.GetUserData()].update(box2d.get.bodySpec(b));
            //     }
            // }
        },
        draw: function() {            
            if (!debug){
                base_image = new Image();
                base_image.src = 'images/KitchenBg.png';
                ctx.drawImage(base_image, 0, 0); 
            }
              
            for (var i in shapes) {
                shapes[i].draw();
            }
        }
    };    
    
    var helpers = {
        randomColor: function() {
            color='#999999';
            return color;
        },
        getElementPosition:function(element) {
            var elem=element, tagname="", x=0, y=0;
           
            while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
               y += elem.offsetTop;
               x += elem.offsetLeft;
               tagname = elem.tagName.toUpperCase();

               if(tagname == "BODY")
                  elem=0;

               if(typeof(elem) == "object") {
                  if(typeof(elem.offsetParent) == "object")
                     elem = elem.offsetParent;
               }
            }

            return {x: x, y: y};
         }
    };
    
    /* Shapes down here */
 

    init.start('canvasId');

})();

