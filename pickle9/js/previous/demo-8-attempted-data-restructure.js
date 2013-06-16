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

    var debug = false;

    var fixtureProperties = {
        density: 0.75
    ,   friction: 0.5
    ,   restitution: 0.3
    }

    //mouse
    var mouseX
    ,   mouseY
    ,   mousePVec
    ,   isMouseDown
    ,   selectedBody
    ,   mouseJoint
    ;

    var initialState = {
                        "0"  : {id:  0, x: 35.13,  y: 12.8, halfHeight: 25.6, halfWidth:2, isStatic: true, isSensor: false},//"rightWall"
                        "1"  : {id:  1, x: 17.07,  y: 26.6, halfHeight: 2  ,  halfWidth:34.13,isStatic: true, isSensor: false},//"ground"    
                        "2"  : {id:  2, x: -1,     y: 12.8, halfHeight: 25.6, halfWidth:2   , isStatic: true, isSensor: false},//"leftWall"  
                        "3"  : {id:  3, x: 6.53 ,  y:20.1 , halfHeight: 8.6 , halfWidth:11  , isStatic: true, isSensor: false},//"unit1"     
                        "4"  : {id:  4, x: 13.15,  y:22.9 , halfHeight: 4.7 , halfWidth:4.96, isStatic: true, isSensor: false},//"cooker"    
                        "5"  : {id:  5, x: 20.3 ,  y:20.1 , halfHeight: 9.4 , halfWidth:11  , isStatic: true, isSensor: false},//"unit2"     
                        "6"  : {id:  6, x: 28.87,  y:20.47, halfHeight: 7.67, halfWidth:10.2, isStatic: true, isSensor: false},//"freezer"   
                        "7"  : {id:  7, x: 28.87,  y:12.73, halfHeight: 6   , halfWidth: 0.1, isStatic: true, isSensor: false},//"shelf1"    
                        "8"  : {id:  8, x: 28.87,  y:10   , halfHeight: 6   , halfWidth: 0.1, isStatic: true, isSensor: false},//"shelf2"    
                        "9"  : {id:  9, x: 32.29,  y:11.47, halfHeight: 0.7 , halfWidth: 7.8, isStatic: true, isSensor: false},//"fridgeW"   
                        "10" : {id: 10, x: 28.46,  y:7.6  , halfHeight: 6.83, halfWidth: 0.1, isStatic: true, isSensor: false},//"fridgeT"   
                        "11" : {id: 11, x: 5    ,  y:7.75 , halfHeight: 10.1, halfWidth: 1.1, isStatic: true, isSensor: false},//"shelf3"    
                        "12" : {id: 12, x: 33.4 ,  y:20.1 , halfHeight: 1.47, halfWidth: 11 , isStatic: true, isSensor: false},//"unit3"     
                        "13" : {id: 13, x: 19,     y: 13.7, halfHeight: 1.4,  halfWidth: 2.4, isStatic:false, isSensor: true},//"waterSensr"
                        "14" : {id: 14, x: 13.15,  y: 14.7, halfHeight: 0.2,  halfWidth: 4.7, isStatic: true, isSensor: false},//"ovenDoor"  
                        "15" : {id: 15, x: 25.32,  y: 11.47,halfHeight: 7.8,  halfWidth: 0.7, isStatic: true, isSensor: false},//"fridgeDoor"
                        "16" : {id: 16, x: 17.1,   y: 13.4, polys:[//"bigPot" 
                                [{x: 0.1, y: 0}, {x: 0.1, y: 1.5}, {x: 0, y: 1.5}, {x: 0, y: 0}], // left side
                                [{x: 0.1, y: 1.3}, {x: 2, y: 1.3}, {x: 2, y: 1.5}, {x: 0.1, y: 1.5}], // base
                                [{x: 2.1, y: 0}, {x: 2.1, y: 1.5}, {x: 2, y: 1.5}, {x: 2, y: 0}]], isStatic: false, isSensor:false}, // right side
                        "17" : {id: 17, x: 15, y:13.5, poly:[//"colander"  
                                [{x: 0.1, y: 0}, {x: 0.1, y: 1.8}, {x: 0, y: 1.8}, {x: 0, y: 0}], // left side
                                [{x: 0.1, y: 1.5}, {x: 2.2, y: 1.5}, {x: 2.2, y: 1.8}, {x: 0.1, y: 1.8}], // base
                                [{x: 2.3, y: 0}, {x: 2.3, y: 1.8}, {x: 2.2, y: 1.8}, {x: 2.2, y: 0}]], isStatic: false, isSensor:false},// right side
                        "18" : {id: 18, x:0, y:0, radius: 2, isStatic: false, isSensor:false},//"blueBerry" 
                        };

var colander  = [
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
            isMouseDown = false;
            mouseX = undefined;
            mouseY = undefined;
         }, true);
         
         function handleMouseMove(e) {
            mouseX = (e.clientX - canvasPosition.x) / 30;
            mouseY = (e.clientY - canvasPosition.y) / 30;
            //console.log(mouseX);
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
                  return false;
               }
            }else if(fixture.GetBody()==ovenDoor){
                //alert("it has been triggered");
                world.DestroyBody(ovenDoor);
                //ovenDoor.active=false;       ///does active state effect static bodies
                //console.log(ovenDoor.active);
                return false;   
            }else if(fixture.GetBody()==fridgeDoor){
                //alert("it has been triggered");
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

            this.surroundings.kitchen(initialState);
            // add.vegetables();
            // add.bigPot();
            // add.door1();
            // add.door2();
            // add.colander();
            //add.pot();
            //box2d.createColander();

            //this.listenForContact();
            
            for (var i in initialState) {
                world[i] = add.build(initialState[i]);
            }

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
            kitchen: function(def){
                
                for(i=0;i<16;i++){
                    var x=def[i].x,y=def[i].y,halfHeight=def[i].halfHeight,halfWidth=def[i].halfWidth,isStatic=def[i].isStatic,isSensor=def[i].isSensor;
                    console.log(x+", " + y+", " +halfHeight+", " +halfWidth+", " +isStatic+", " +isSensor)
                    //box2d.createBoxBody(x, y, halfHeight, halfWidth, isStatic, isSensor);                           
                }
            }
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
        build: function(options) {
            if (options.radius) {
                var shape = new Circle(options);
                shapes[shape.id] = shape;
                box2d.addToWorld(shape); //return new Circle(options.id, options.x, options.y, NULL_CENTER, options.radius);
            } else if (options.polys) {
                box2d.createBoxBody(options);
            } else {
                box2d.createBoxBody(options);
                //return body; //return new Box(options.id, options.x, options.y, NULL_CENTER, options.halfWidth, options.halfHeight);
            }
         }//,
        // backgnd: function(){
        //     var shape = new Background();
        //     shapes[shape.id] = shape;
        //     box2d.addToWorld(shape); 
        // },
        // circle: function(options) {
        //     options.radius = options.radius||0.5 + Math.random()*1;//adds radius to the prototype
        //     var shape = new Circle(options);
        //     shapes[shape.id] = shape;
        //     box2d.addToWorld(shape);
        // },

        // box: function(options) {
        //     options.width = options.width || 0.5 + Math.random()*2;//adds width to the prototype
        //     options.height = options.height || 0.5 + Math.random()*2;//adds height to the prototype
        //     var shape = new Box(options);
        //     //shape.id=shapeId;
        //     shapes[shape.id] = shape;
        //     body = box2d.addToWorld(shape); //addToWorld deals with boxes and circles
        //     return body;
        // },
        // bigPot: function() {
        //     // pot edges have no fixtures. If the pot was dynamic the sides would move independently
        //     add.box({x: 17.1, y: 13.4,height: 2.4, width:0.2, isStatic: true});// right
        //     add.box({x: 19, y: 14.5,height: 0.2, width:3.6, isStatic: true});//bottom
        //     add.box({x: 20.9, y: 13.4, height: 2.4, width:0.2, isStatic: true});//left
        //     //pot could be made a kinematic body to stop it falling into the oven.

        //     //Declare the bouyancy controller
        //     b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;

        //     // Set up the buoyancy controller
        //     buoyancyController = new b2BuoyancyController();
        //     buoyancyController.normal.Set(0, -1);
        //     buoyancyController.offset = -230/SCALE;
        //     buoyancyController.useDensity = true;
        //     buoyancyController.density = 2.0;
        //     buoyancyController.linearDrag = 5;
        //     buoyancyController.angularDrag = 2;
        //     // Add the controller to the world
        //     world.AddController(buoyancyController);
        //     //The water sensor
        //     waterSensor = box2d.createBoxBody(19, 13.7, 3.6, 1.4, b2Body.b2_staticBody, true);
        //     //water sensor and pot edges should be fixed to one body not separate bodies and made dynamic and super dense.
        // },

        // door1: function() {
        //     //ovenDoor = box2d.createBoxBody(13.15, 14.7 , 4.7 , 0.2, b2Body.b2_staticBody, false,999998);
        //     ovenDoor = add.box({x: 13.15, y: 14.7,height: 0.2, width:4.7, isStatic: true});

        //     //console.log(ovenDoor);

        //     //maybe more effective to add a shape and fixture to the base of the oven 
        //     //need more effective naming convention.  
        //     //activation could be the solution rather than create and destroy bodyDef.active=true.
        // },
        // door2: function() {
        //     fridgeDoor = add.box({x: 25.32, y: 11.47,height: 7.8, width:0.7, isStatic: true});
        //     //maybe more effective to add shapes to a fridge body and destoy and create the wall by clicking on a jquery area.

        // },
        // pot: function(options) {
        //     console.log('pot');
        //     var shape = new Pot(options);
        //     shapes[shape.id] = shape;
        //     box2d.addPotToWorld(shape); //addPotToWorld creates object from verticies
        // },
        // vegetables: function(options) {
        //     //create some falling objects
        //     //to be replaced by a switch statement
        //     options = options || {};
        //     for(var i = 0; i < 25; ++i) {
        //         options.isStatic = false;
        //         if(Math.random() > 0.5) {
        //             options.width = Math.random()*0.2 + 0.1  //adds width to the prototype
        //             options.height = Math.random()*0.2 + 0.1
        //             var shape = new Box(options);
        //             shapes[shape.id] = shape;
        //             box2d.addToWorld(shape);
        //         } else {
        //             options.radius = 7.5/SCALE;//radius
        //             var shape = new Circle(options);
        //             shapes[shape.id] = shape;
        //             box2d.addToWorld(shape);
        //         }
        //         options.x = Math.random() * 2+17.5;
        //         options.y = Math.random() * 5-5;
        //     }
        // },
        // colander:function(){
        //     polys = colander;

        //     for (var j = 0; j < polys.length; j++) {
        //         var points = polys[j];
        //         var vecs = [];
        //         for (var i = 0; i < points.length; i++) {
        //             var vec = new b2Vec2();
        //             vec.Set(points[i].x, points[i].y);
        //             vecs[i] = vec;
        //             //console.log(points[i].x);
        //         }
        //         console.log(vecs);
        //         //createColander(vecs);
        //     }
        // }
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
            //console.log('add to world2');
            var bodyDef = this.create.bodyDef(shape);
            var body = world.CreateBody(bodyDef);
            
            //USE JSON to add pots or

            //switch statement to add the correct array to points
            //each pot pulls data from the array and adds to the variable points and calls the function
            //below to create it
            // switch(device)
            // case(blender){}
            // case(pot){}
            
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
        createBoxBody: function (options){//(px, py, width, height, bodyType, isSensor,id){
            var bodyDef = new b2BodyDef();
            var bodyDef = this.create.bodyDef(options);
            bodyDef.position.x = options.x;
            bodyDef.position.y = options.y;
            //bodyDef.userData = name;
            //console.log(bodyDef.userData); //this ids the doors to be targeted for distruction
                                        //but causes errors with get UserData and shapes array definition
                                        //need to add a shape variable without drawing a canvas element
            var fixtureDef = new b2FixtureDef();
            fixtureDef.isSensor = options.isSensor;
            fixtureDef.density = fixtureProperties.density;
            fixtureDef.friction = fixtureProperties.friction;
            fixtureDef.restitution = fixtureProperties.restitution;
           
            fixtureDef.shape = new b2PolygonShape();
            fixtureDef.shape.SetAsBox(options.halfWidth/2, options.halfHeight/2);
            var body = world.CreateBody(bodyDef);
            var fixture = body.CreateFixture(fixtureDef);
            return body;
        },
        createColander: function(vecs){
            var bodyDef = new b2BodyDef();
            //bodyDef.type = bodyType;
            bodyDef.position.Set(5, 6.5);
            bodyDef.fixedRotation = true;   ///fixed rotation for the box need to find a way to tip it
            var body =  world.CreateBody(bodyDef);

            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsArray(vecs, vecs.length);
            body.CreateFixture(fixDef);
            
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

    init.start('canvasId');

})();

