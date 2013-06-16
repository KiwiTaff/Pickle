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
    ;

    var desiredAngle = 0
    ,   timeStepLengthInSeconds = 1 / 60
    ,   timeStepsPerSecond = 60
    ,   maximumPossibleTorque=1000
    ;

    var debug = true;

    var fixtureProperties = {
        density: 0.75
    ,   friction: 0.5
    ,   restitution: 0.3
    //,   angularDamping: 0.1
    }

    //jQuery variables
    var doc=$(document);

    //mouse
    var mouseX
    ,   mouseY
    ,   mousePVec
    ,   isMouseDown
    ,   selectedBody
    ,   mouseJoint
    ;

    //game play elements
    var pickleShapes = {} 
    ,   ovenDoor
    ,   fridgeDoor
    ,   colanderPot
    ,   bigPot2

    ,   ovenDoorOpen = false    //flag for triggering door open animation
    ,   fridgeDoorOpen = false  //flag for triggering door open animation       
    ,   nextId = 0
    ,   frameNum = 0            // initital frame counter value for sprite animation
    ;
           
    //Poly shapes
    bigPot2   = [
                [{x: -1.5, y: -1.2}, {x: -1.5, y: 1.2}, {x: -1.9, y: 1.2}, {x: -1.9, y: -1.2}], // left side
                [{x: -1.5, y: 0.8}, {x: 1.5, y: 0.8}, {x: 1.5, y: 1.2}, {x: -1.5, y: 1.2}], // base
                [{x: 1.9, y: -1.2}, {x: 1.9, y: 1.2}, {x: 1.5, y: 1.2}, {x: 1.5, y: -1.2}] // right side
                ];    

    colander  = [
                [{x: 0.2, y:-0.9}, {x: 0.2, y: 0.9}, {x: 0.0, y: 0.9}, {x: 0.0, y:-0.9}], // left side
                [{x: 0.2, y: 0.6}, {x: 2.8, y: 0.6}, {x: 2.8, y: 0.9}, {x: 0.2, y: 0.9}], // base
                [{x: 3.0, y:-0.9}, {x: 3.0, y: 0.9}, {x: 2.8, y: 0.9}, {x: 2.8, y:-0.9}] // right side
                ];

    bowl      = [
                [{x:-1.0, y: 1.5}, {x:-0.8, y:1.5}, {x:-0.8, y: 0.5}, {x:-1.0, y: 0.5}],
                [{x:-1.0, y: 0.5}, {x:-0.8, y:0.5}, {x:-0.5, y: 0.2}, {x:-0.5, y: 0.0}],
                [{x:-0.5, y: 0.0}, {x:-0.5, y:0.2}, {x: 0.5, y: 0.2}, {x: 0.5, y: 0.0}],
                [{x: 0.8, y: 0.5}, {x: 1.0, y:0.5}, {x: 0.5, y: 0.0}, {x: 0.5, y: 0.2}],
                [{x: 1.0, y: 1.5}, {x: 0.8, y:1.5}, {x: 0.8, y: 0.5}, {x: 1.0, y: 0.5}],
                ]

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
        mouseX = (e.clientX - canvasPosition.x) / SCALE;
        mouseY = (e.clientY - canvasPosition.y) / SCALE;
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
        torqueAdjustment=2;
        if(fixture.GetBody().GetType()!= b2Body.b2_staticBody) {
           if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                selectedBody = fixture.GetBody();
                if(selectedBody==colanderPot){   //                                                   <<<< rotating the pot
                    doc.on('mousemove',function(e){
                        angleNow                 = body.GetAngle();
                        changeExpected           = body.GetAngularVelocity() * timeStepLengthInSeconds; //expected angle change in next timestep
                        angleNextStep            = angleNow + changeExpected;
                        changeNeededInNextStep   = desiredAngle - angleNextStep;
                        rotationalAcceleration   = timeStepsPerSecond * changeNeededInNextStep;
                        torque                   = rotationalAcceleration * torqueAdjustment;
                                     if ( torque > maximumPossibleTorque ){
                                          torque = maximumPossibleTorque;
                                       }
                        selectedBody.ApplyTorque(torque);
                    });
                }
                return false;
           }
        }else if(fixture.GetBody()==ovenDoor){//                                            <<<<trigger for opening oven door
            world.DestroyBody(ovenDoor);
            ovenDoorOpen=true;  
        }else if(fixture.GetBody()==fridgeDoor){//                                        <<<<trigger for opening fridge door
            world.DestroyBody(fridgeDoor);
            fridgeDoorOpen=true;
        }

    }

    var init = {
        start: function(id) {
            this.canvas(id);

            box2d.create.world();
            box2d.create.defaultFixture();

            //surroundings
            rightWall   = add.box({x: 35.13, y: 12.8,height: 25.6, width:2, isStatic: true});// right
            ground      = add.box({x: 17.07, y: 26.6,height: 2, width:34.13, isStatic: true});//ground
            leftWall    = add.box({x: -1, y: 12.8, height: 25.6, width:2, isStatic: true});//left
            
            //kitchen units
            unit1       = box2d.createBoxBody(6.53 , 20.1 , 8.6 , 11.0, b2Body.b2_staticBody, false);
            cooker      = box2d.createBoxBody(13.15, 22.9 , 4.7 , 4.96, b2Body.b2_staticBody, false);
            unit2       = box2d.createBoxBody(20.3 , 20.1 , 9.4 , 11.0, b2Body.b2_staticBody, false);
            freezer     = box2d.createBoxBody(28.87, 20.47, 7.67, 10.2, b2Body.b2_staticBody, false);
            shelf1      = box2d.createBoxBody(28.87, 12.73, 6   ,  0.1, b2Body.b2_staticBody, false);
            shelf2      = box2d.createBoxBody(28.87, 10   , 6   ,  0.1, b2Body.b2_staticBody, false);
            fridgeW     = box2d.createBoxBody(32.29, 11.47, 0.7 ,  7.8, b2Body.b2_staticBody, false);
            fridgeT     = box2d.createBoxBody(28.46, 7.6  , 6.83,  0.1, b2Body.b2_staticBody, false);
            shelf3      = box2d.createBoxBody(5    , 7.75 , 10.1,  1.1, b2Body.b2_staticBody, false);
            shelf3      = box2d.createBoxBody(33.4 , 20.1 , 1.47, 11.0, b2Body.b2_staticBody, false);

            //ingredients
            step1       = add.ingredients({"0": {x:7.5, y: 9.4, height:0.4, width:0.3,isStatic:false, imgSrc:'images/beef.png'}});
            step2       = add.ingredients({"0": {x:9  , y:13.4, height:0.1, width:0.3,isStatic:false, imgSrc:'images/onion.png'}});
            // step3       = add.ingredients({"0": {x:5  , y:13.4, radius:0.3,           isStatic:false, imgSrc:'images/carrot.png'}},
            //                               {"1": {x:5  , y:13.4, height:0.3, width:0.3,isStatic:false, imgSrc:'images/capsicum.png'}},
            //                               {"2": {x:5  , y:13.4, height:0.4, width:0.4,isStatic:false, imgSrc:'images/potato.png'}
            //                               });
            
            //doors
            ovenDoor    = add.box({x: 13.15, y: 14.7,height: 0.2, width:4.7, isStatic: true});
            fridgeDoor  = add.box({x: 25.32, y: 11.47,height: 7.8, width:0.7, isStatic: true});

            //pots 
            colanderPot = add.colander({x:  5, y: 13.8, height: 1.4, width:2.4, isStatic: true, imgSrc:'images/pot_no_lid.png' }); //allows colander to be targeted by name
            bigPot      = add.bigPot  ({x: 16, y: 13.4, height: 2  , width:5.2, isStatic: true, imgSrc:'images/bigPot_no_lid.png'});
            glassBowl   = add.meatBowl({x:  8, y: 13.8, height: 1.4, width:0.1, isStatic: true, imgSrc:'images/bowl.png' });

            // colanderPot = add.colander({"0":{x:  5, y: 13.8, height: 1.4, width:2.4, isStatic: true, imgSrc:'images/pot_no_lid.png' }}); //allows colander to be targeted by name
            // bigPot      = add.bigPot  ({"1":{x: 16, y: 13.4, height: 2  , width:5.2, isStatic: true, imgSrc:'images/bigPot_no_lid.png'}});
            // glassBowl   = add.meatBowl({"2":{x:  8, y: 13.8, height: 1.4, width:0.1, isStatic: true, imgSrc:'images/bowl.png' }});
            
            this.listenForContact();
            
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< the loop >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

            //loop that call the request animFrame and all the loop functions
            (function pickle() {
                looping.step();
                looping.update();
                if (ovenDoorOpen){
                    looping.ovenDoorAnim();
                };
                if (fridgeDoorOpen){
                    looping.fridgeDoorAnim();
                };
                if (debug) {
                    world.DrawDebugData();
                };
                looping.drawShapes();
                requestAnimFrame(pickle);       //<<<<<recursive - calls itself
            })();                               //<<<<<self initialising loop
        },

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<             >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end of loop >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<             >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//

        canvas: function(id) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext("2d");
            canvasPosition = helpers.getElementPosition(document.getElementById("canvasId"));
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
        
    };   //end of init object     
     
     
    var add = {
        box: function(options) {
            var shape = new Box(options);
            pickleShapes[shape.id] = shape;
            body = box2d.addToWorld(shape); //addToWorld deals with boxes and circles
            return body;
        },
        //plan: merge big pot and colander and add poly:colander key:variable in the colander object so we can add the call the poly 
        //don't need the bouyancy controller for this type of pot.
        colander:function(options){
            polys = colander;
            var shape = new Pot(options,polys);
            pickleShapes[shape.id] = shape;
            body = box2d.addPotToWorld(shape); //adds the shape to the box2d world
            return body;
        },
        meatBowl:function(options){
            polys = bowl;
            var shape = new Pot(options,polys);
            pickleShapes[shape.id] = shape;
            body = box2d.addPotToWorld(shape); //adds the shape to the box2d world
            return body;
        },
        bigPot:function(options){
            polys = bigPot2;
            var shape = new Pot(options,polys);
            pickleShapes[shape.id] = shape;
            body = box2d.addPotToWorld(shape,polys); //adds the shape to the box2d world
            return body;
            // sensors can only be static. A dynamic pot will be affected.
            // //Declare the bouyancy controller
            // b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;

            // //Set up the buoyancy controller
            // buoyancyController = new b2BuoyancyController();
            // buoyancyController.normal.Set(0, -1);
            // buoyancyController.offset = -230/SCALE;
            // buoyancyController.useDensity = true;
            // buoyancyController.density = 2.0;
            // buoyancyController.linearDrag = 5;
            // buoyancyController.angularDrag = 2;
            // //Add the controller to the world
            // world.AddController(buoyancyController);
            // //The water sensor
            // waterSensor = box2d.createBoxBody(19, 12.7, 3.6, 1.4, b2Body.b2_dynamicBody, true);
            // //water sensor and pot edges should be fixed to one body not separate bodies and made dynamic and super dense.
            
        },
        ingredients:function(options) {  
            var numIngredients = 0;
            var ingredient=[];

            //loops through the object and for every instance of id adds one to the number of ingredients
            for(var id in options) {
                numIngredients++;
            };

            //this loop will produced 12 lumps of ingredients for each step in the recipe                    
            for(var i = 0; i < 12; ++i) {       
                
                n=Math.round(Math.random()+0.5)*numIngredients;
                //console.log(n);
                switch(n){

                    case 1:
                    ingredient = options[0];
                    console.log(options[0].x);
                    ingredient.x = options[0].x + Math.random()*1.2;
                    console.log(options[0].x);
                    break;
                    case 2:
                    ingredient=options[1];
                    //ingredient.x=options[1].x+(Math.random()*1.2);
                    break;
                    case 3:
                    ingredient=options[2];
                    //ingredient.x=options[2].x+(Math.random()*1.2);
                    break;
                    case 4:
                    ingredient=options[3];
                    //ingredient.x=options[3].x+(Math.random()*1.2);
                    break;                
                }
                
                //supposed to give a random spread for the initial position
                //ingredient.x=options.x+(Math.random()*1.2);
                //console.log(ingredient.x);
                // ingredient.y=ingredient.y+(Math.random()*2);

                if(ingredient.radius){
                    //console.log("circle");
                    var shape = new Circle(ingredient); 
                    pickleShapes[shape.id] = shape;
                    box2d.addToWorld(shape);
                } else {
                    //console.log('box');
                    var shape = new Box(ingredient);
                    pickleShapes[shape.id] = shape;
                    box2d.addToWorld(shape);
                }
                    
            }
        }
    };//end of add object

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
            bodyDef.type = b2Body.b2_dynamicBody;
            //bodyDef.position.Set(shape.x, shape.y);                    //set x= 5 and y=6.5
            bodyDef.angularDamping=5;                        ///angular damping to reduce rotation
            var body = world.CreateBody(bodyDef);
            var polyLength = polys.length
            for (var j = 0; j < polyLength; j++) {
                var points = polys[j];
                var vecs = [];
                var l = points.length;
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
            return body; 
        },
        createBoxBody: function (px, py, width, height, bodyType, isSensor,id){
            var bodyDef = new b2BodyDef();
            bodyDef.type = bodyType;
            bodyDef.position.x = px;
            bodyDef.position.y = py;
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
    };//end of box2d object


    var looping = {
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
                  md.dampingRatio=0.7;
                  md.frequency=0.5;
                  md.collideConnected = true;
                  md.maxForce = 50.0 * body.GetMass();
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
                        pickleShapes[b.GetUserData()].update(box2d.get.bodySpec(b));
                }
            }
        },
        ovenDoorAnim: function(){
                //ovenDoor Anim here;
                //alert("triggered ovenDoorOpen animation");
                frameNum++;
                if(frameNum==4){
                    frameNum==0;
                    alert("end of ovenDoorOpen animation");
                }
        },
        fridgeDoorAnim: function(){
                //fridgeDoor Anim here;
                //alert("triggered fridgeDoorOpen animation");
                frameNum++;
                if(frameNum==4){
                    fridgeDoorOpen=false;
                    frameNum==0;
                    alert("end of fridgeDoorOpen animation");
                }
        },
        drawShapes: function() {            
             if (!debug){
                base_image = new Image();
                base_image.src = 'images/KitchenBg.png';
                ctx.drawImage(base_image, 0, 0); 
            }

            for (var i in pickleShapes) {
                pickleShapes[i].draw();
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
    
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  shapes  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>//
    
    var Shape = function(v) { // v passing x and y value
        this.id=this.id||null
            if(this.id===null){
            this.id=nextId;
            nextId++;
            //console.log(this.id);
        }
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
        Shape.call(this, options);//using call method to indicate which object to reference as this in Shape object
                                  //and options are passed as parameters 
        this.radius = options.radius || 1;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            food = new Image();
                food.src = 'images/berry.png';
            ctx.drawImage(food,(this.x-(this.radius))* SCALE,(this.y-(this.radius)) * SCALE);
            ctx.restore();
        };
    };
    Circle.prototype = Shape;
    
    var Box = function(options) {
        Shape.call(this, options);
        this.width = options.width;
        this.height = options.height;
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            if(options.imgSrc){
                foodPic = new Image();
                foodPic.src = options.imgSrc;
                ctx.drawImage(foodPic,(this.x-(this.width/2))* SCALE,((this.y)-(this.height/2)) * SCALE);//this height and width is not being passed to the pot
            }else{
                ctx.fillStyle = this.color;
                ctx.fillRect(
                  (this.x-(this.width / 2)) * SCALE
                , (this.y-(this.height / 2)) * SCALE
                , this.width * SCALE
                , this.height * SCALE
            );
            }
            ctx.restore();
        };
    };
    Box.prototype = Shape;

       var Pot = function(options) {
        Shape.call(this, options);
        this.width = options.width;
        this.height = options.height;
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            potPic = new Image();
                potPic.src = options.imgSrc;
            ctx.drawImage(potPic,(this.x-(this.width))* SCALE,((this.y)-(this.height/2)) * SCALE);//this height and width is not being passed to the pot
            ctx.restore();
        };
    };
    Box.prototype = Shape;

    init.start('canvasId');

})();

