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



    var init = {
        start: function(id) {
            this.canvas(id);

            box2d.create.world();
            box2d.create.defaultFixture();
            FooTest();

            //this.listenForContact();
            
            
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
        }
        
    };        
 


  
  function FooTest() {
    //body definition
    bodyDef=new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    
    //hexagonal shape definition
    polygonShape= new b2PolygonShape ;
    vertices = [];
    for (i = 0; i < 6; i++) {
      angle = -i/6.0 * 360 * DEGTORAD;
      vertices[i].Set(sinf(angle), cosf(angle));
    }
    vertices[0]=( 0, 4 ); //change one vertex to be pointy
    polygonShape.Set(vertices, 6);
  
    //fixture definition
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.density = 1;
    
    //create dynamic body
    bodyDef.position.Set(5, 6.5);
    var body =  world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

  }


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
                    new b2Vec2(0, 0)    //gravity
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

