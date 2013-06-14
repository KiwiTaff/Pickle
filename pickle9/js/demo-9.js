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
    ;

    var debug = true;

    var fixtureProperties = {
        density: 0.75
    ,   friction: 0.5
    ,   restitution: 0.3
    //,   angularDamping: 0.1
    }

    //jQuery variables
    var doc=$(document)
    ;


    //mouse
    var mouseX
    ,   mouseY
    ,   mousePVec
    ,   isMouseDown
    ,   selectedBody
    ,   mouseJoint
    ;

    var ovenDoor //These need to be placed in an associative array
    ,   fridgeDoor
    ,   colanderPot
    ;

    // smallPot  = [
    //             [{x: 0.1, y: 0}, {x: 0.1, y: 1.5}, {x: 0, y: 1.5}, {x: 0, y: 0}], // left side
    //             [{x: 0.1, y: 1.3}, {x: 2, y: 1.3}, {x: 2, y: 1.5}, {x: 0.1, y: 1.5}], // base
    //             [{x: 2.1, y: 0}, {x: 2.1, y: 1.5}, {x: 2, y: 1.5}, {x: 2, y: 0}] // right side
    //             ];

    colander  = [
                [{x: 0.1, y: 0}, {x: 0.1, y: 1.8}, {x: 0, y: 1.8}, {x: 0, y: 0}], // left side
                [{x: 0.1, y: 1.5}, {x: 2.2, y: 1.5}, {x: 2.2, y: 1.8}, {x: 0.1, y: 1.8}], // base
                [{x: 2.3, y: 0}, {x: 2.3, y: 1.8}, {x: 2.2, y: 1.8}, {x: 2.2, y: 0}] // right side
                ];

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
        doc.unbind();
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;

    }, true);

    function handleMouseMove(e) {
        mouseX = (e.clientX - canvasPosition.x) / 30;
        mouseY = (e.clientY - canvasPosition.y) / 30;
    };

    function getBodyAtMouse() {
        mousePVec = new b2Vec2(mouseX, mouseY);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
        aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

        // Query the world for overlapping shapes.

        selectedBody = null;
        world.QueryAABB(getBodyCB, aabb);
        return selectedBody;
    }

    function getBodyCB(fixture) {
        //console.log(fixture.GetBody().GetUserData());
        if(fixture.GetBody().GetType()!= b2Body.b2_staticBody) {
           if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                selectedBody = fixture.GetBody();
                if(selectedBody==colanderPot){   //                                                   <<<< rotating the pot
                    doc.on('mousemove',function(e){
                        if(e.pageX>400){
                            selectedBody.angularDamping=0.2;
                            console.log("pow");
                        }else{
                            selectedBody.angularDamping=1;
                        }
                    });
                }
                return false;
           }
        }else if(fixture.GetBody()==ovenDoor){
            world.DestroyBody(ovenDoor);
            //ovenDoor.active=false;       ///does active state effect static bodies
            //console.log(ovenDoor.active);
            return false;   
        }else if(fixture.GetBody()==fridgeDoor){
            world.DestroyBody(fridgeDoor);
            return false;
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
            add.vegetables();
            add.bigPot();
            add.door1();
            add.door2();
            colanderPot = add.colander();
            //console.log(colanderPot);
            //add.pot();
            //box2d.createColander();

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
                add.box({x: 35.13, y: 12.8,height: 25.6, width:2, isStatic: true});// right
                add.box({x: 17.07, y: 26.6,height: 2, width:34.13, isStatic: true});//ground
                add.box({x: -1, y: 12.8, height: 25.6, width:2, isStatic: true});//left
            },
            units: function() {
                box2d.createBoxBody(6.53 , 20.1 , 8.6 , 11  , b2Body.b2_staticBody, false);// , 999988 unit1
                box2d.createBoxBody(13.15, 22.9 , 4.7 , 4.96, b2Body.b2_staticBody, false);// , 999989 cooker
                box2d.createBoxBody(20.3 , 20.1 , 9.4 , 11  , b2Body.b2_staticBody, false);// , 999990 unit2
                box2d.createBoxBody(28.87, 20.47, 7.67, 10.2, b2Body.b2_staticBody, false);// , 999991 freezer
                box2d.createBoxBody(28.87, 12.73, 6   , 0.1 , b2Body.b2_staticBody, false);// , 999992 shelf1
                box2d.createBoxBody(28.87, 10   , 6   , 0.1 , b2Body.b2_staticBody, false);// , 999993 shelf2
                box2d.createBoxBody(32.29, 11.47, 0.7 , 7.8 , b2Body.b2_staticBody, false);// , 999994 fridgeW
                box2d.createBoxBody(28.46, 7.6  , 6.83, 0.1 , b2Body.b2_staticBody, false);// , 999995 fridgeT
                box2d.createBoxBody(5    , 7.75 , 10.1, 1.1 , b2Body.b2_staticBody, false);// , 999996 shelf3
                box2d.createBoxBody(33.4 , 20.1 , 1.47, 11  , b2Body.b2_staticBody, false);// , 999997 unit3
    
                //box2d.createBoxBody(27.1, 9.37, 0.1, 5.8, b2Body.b2_staticBody, false);//fridge shelf bottom
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
        backgnd: function(){
            var shape = new Background();
            shapes[shape.id] = shape;
            box2d.addToWorld(shape); 
        },
        circle: function(options) {
            options.radius = options.radius||0.5 + Math.random()*1;//adds radius to the prototype
            var shape = new Circle(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);
        },

        box: function(options) {
            options.width = options.width || 0.5 + Math.random()*2;//adds width to the prototype
            options.height = options.height || 0.5 + Math.random()*2;//adds height to the prototype
            var shape = new Box(options);
            //shape.id=shapeId;
            shapes[shape.id] = shape;
            body = box2d.addToWorld(shape); //addToWorld deals with boxes and circles
            return body;
        },
        bigPot: function() {
            // pot edges have no fixtures. If the pot was dynamic the sides would move independently
            add.box({x: 17.1, y: 13.4,height: 2.4, width:0.2, isStatic: true});// right
            add.box({x: 19, y: 14.5,height: 0.2, width:3.6, isStatic: true});//bottom
            add.box({x: 20.9, y: 13.4, height: 2.4, width:0.2, isStatic: true});//left
            //pot could be made a kinematic body to stop it falling into the oven.

            //Declare the bouyancy controller
            b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;

            // Set up the buoyancy controller
            buoyancyController = new b2BuoyancyController();
            buoyancyController.normal.Set(0, -1);
            buoyancyController.offset = -230/SCALE;
            buoyancyController.useDensity = true;
            buoyancyController.density = 2.0;
            buoyancyController.linearDrag = 5;
            buoyancyController.angularDrag = 2;
            // Add the controller to the world
            world.AddController(buoyancyController);
            //The water sensor
            waterSensor = box2d.createBoxBody(19, 13.7, 3.6, 1.4, b2Body.b2_staticBody, true);
            //water sensor and pot edges should be fixed to one body not separate bodies and made dynamic and super dense.
        },

        door1: function() {
            ovenDoor = add.box({x: 13.15, y: 14.7,height: 0.2, width:4.7, isStatic: true});
            //maybe more effective to add a shape and fixture to the base of the oven 
        },
        door2: function() {
            fridgeDoor = add.box({x: 25.32, y: 11.47,height: 7.8, width:0.7, isStatic: true});
            //maybe more effective to add shapes to a fridge body and destoy and create the wall by clicking on a jquery area.

        },
        // pot: function(options) {
        //     console.log('pot');
        //     var shape = new Pot(options);
        //     shapes[shape.id] = shape;
        //     box2d.addPotToWorld(shape); //addPotToWorld creates object from verticies
        // },
        vegetables: function(options) {
            //create some falling objects
            //to be replaced by a switch statement
            options = options || {};
            for(var i = 0; i < 25; ++i) {
                options.isStatic = false;
                if(Math.random() > 0.5) {
                    options.width = Math.random()*0.2 + 0.1  //adds width to the prototype
                    options.height = Math.random()*0.2 + 0.1
                    var shape = new Box(options);
                    shapes[shape.id] = shape;
                    box2d.addToWorld(shape);
                } else {
                    options.radius = 7.5/SCALE;//radius
                    var shape = new Circle(options);
                    shapes[shape.id] = shape;
                    box2d.addToWorld(shape);
                }
                options.x = Math.random() * 2+17.5;
                options.y = Math.random() * 5-5;
            }
        },
        colander:function(){
            polys = colander;

            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.Set(5, 6.5);
            bodyDef.angularDamping=5;                                     ///angular damping to reduce rotation
            var body =  world.CreateBody(bodyDef);
 
            for (var j = 0; j < polys.length; j++) {
                var points = polys[j];
                var vecs = [];
                l=points.length;
                for (var i = 0; i < l; i++) {
                    var vec = new b2Vec2();
                    vec.Set(points[i].x, points[i].y);
                    vecs[i] = vec;
                    //console.log(points[i].x);
                }
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsArray(vecs, vecs.length);
                body.CreateFixture(fixDef);
            }
            var options = options || {};
            options.width = 2.4; //adds width to the prototype
            options.height = 3;
            var shape = new Pot(options);
                shapes[shape.id] = shape;
            
            return body;
        }
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
            return body;
        },
        addPotToWorld: function(shape) {
            var bodyDef = this.create.bodyDef(shape);
            var body = world.CreateBody(bodyDef);
            for (var j = 0; j < polys.length; j++) {
                var points = polys[j];
                var vecs = [];
                for (var i = 0; i < points.length; i++) {
                    var vec = new b2Vec2();
                    vec.Set(points[i].x, points[i].y);
                    vecs[i] = vec;
                }
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsArray(vecs, vecs.length);
                body.CreateFixture(fixDef);
            }  
        },
        createBoxBody: function (px, py, width, height, bodyType, isSensor,id){
            var bodyDef = new b2BodyDef();
            bodyDef.type = bodyType;
            bodyDef.position.x = px;
            bodyDef.position.y = py;
            //bodyDef.userData = name;
            //console.log(bodyDef.userData); //this ids the doors to be targeted for distruction
                                        //but causes errors with get UserData and shapes array definition
                                        //need to add a shape variable without drawing a canvas element
            var fixtureDef = new b2FixtureDef();
            fixtureDef.isSensor = isSensor;
            fixtureDef.density = fixtureProperties.density;
            fixtureDef.friction = fixtureProperties.friction;
            fixtureDef.restitution = fixtureProperties.restitution;
           
            fixtureDef.shape = new b2PolygonShape();
            fixtureDef.shape.SetAsBox(width/2, height/2);
            var body = world.CreateBody(bodyDef);
            var fixture = body.CreateFixture(fixtureDef);
            return body;
        },
        // createColander: function(vecs){     ///this code has been copied to add.colander
        //     var bodyDef = new b2BodyDef();
        //     bodyDef.type = b2Body.b2_dynamicBody;
        //     bodyDef.position.Set(5, 6.5);
        //     bodyDef.fixedRotation = true;   ///fixed rotation for the box need to find a way to tip it
        //     var body =  world.CreateBody(bodyDef);

        //     fixDef.shape = new b2PolygonShape;
        //     fixDef.shape.SetAsArray(vecs, vecs.length);
        //     body.CreateFixture(fixDef);
            
        // },
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

            for (var b = world.GetBodyList(); b; b = b.m_next) {
                if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
                        shapes[b.GetUserData()].update(box2d.get.bodySpec(b));
                }
            }
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
    
    var Shape = function(v) { // v passing x and y value
        this.id = this.id||Math.round(Math.random() * 999999);//find type of this and create the oven the same or replace random with a defined id
        this.x = v.x || Math.random()*23 + 1;
        this.y = v.y || 0;
        this.angle = 0;
        this.color = '#999999';
        this.center = { x: null, y: null };
        this.isStatic = v.isStatic || false;
        //console.log(this, "and some");
        
        this.update = function(options) {
            this.angle = options.angle;
            this.center = options.center;
            this.x = options.x;
            this.y = options.y;
        };
    };
    
    var Circle = function(options) {
        Shape.call(this, options);
        this.radius = options.radius || 1;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            food = new Image();
                food.src = 'images/berry.png';
            ctx.drawImage(food,(this.x-(this.radius))* SCALE,(this.y-(this.radius)) * SCALE);
            // ctx.fillStyle = this.color;
            // ctx.beginPath();
            // ctx.arc(this.x * SCALE, this.y * SCALE, this.radius * SCALE, 0, Math.PI * 2, true);
            // ctx.closePath();
            // ctx.fill();

            ctx.restore();
        };
    };
    Circle.prototype = Shape;
    
    var Box = function(options) {
        Shape.call(this, options);
        this.width = options.width || Math.random()*2+0.5;
        this.height = options.height || Math.random()*2+0.5;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            ctx.fillStyle = this.color;
            ctx.fillRect(
                  (this.x-(this.width / 2)) * SCALE
                , (this.y-(this.height / 2)) * SCALE
                , this.width * SCALE
                , this.height * SCALE
            );
            ctx.restore();
        };
    };
    Box.prototype = Shape;

       var Pot = function(options) {
        Shape.call(this, options);
        console.log(this.id);
        this.width = options.width || Math.random()*2+0.5;
        this.height = options.height || Math.random()*2+0.5;
        console.log(this.width, this.height);
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            potPic = new Image();
                potPic.src = 'images/pot_no_lid.png';
            ctx.drawImage(potPic,(this.x-(this.width))* SCALE,(this.y-(this.height)) * SCALE);

            ctx.restore();
        };
    };
    Box.prototype = Shape;

    init.start('canvasId');

})();

