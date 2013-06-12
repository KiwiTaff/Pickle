    colander  = [
                [{x: 0.1, y: 0}, {x: 0.1, y: 1.8}, {x: 0, y: 1.8}, {x: 0, y: 0}], // left side
                [{x: 0.1, y: 1.5}, {x: 2.2, y: 1.5}, {x: 2.2, y: 1.8}, {x: 0.1, y: 1.8}], // base
                [{x: 2.3, y: 0}, {x: 2.3, y: 1.8}, {x: 2.2, y: 1.8}, {x: 2.2, y: 0}] // right side
                ];


            walls: function() {
                add.box({x: 35.13, y: 12.8,halfHeight: 25.6, halfWidth:2, isStatic: true});// right
                add.box({x: 17.07, y: 26.6,halfHeight: 2, halfWidth:34.13, isStatic: true});//ground
                add.box({x: -1, y: 12.8, halfHeight: 25.6, halfWidth:2, isStatic: true});//left


            units: function() {
                box2d.createBoxBody(x:6.53 , y:20.1 , halfHeight:8.6 , halfWidth:11  , isStatic: true, isSensor: false);// , 999988 unit1
                box2d.createBoxBody(x:13.15, y:22.9 , halfHeight:4.7 , halfWidth:4.96, isStatic: true, isSensor: false);// , 999989 cooker
                box2d.createBoxBody(x:20.3 , y:20.1 , halfHeight:9.4 , halfWidth:11  , isStatic: true, isSensor: false);// , 999990 unit2
                box2d.createBoxBody(x:28.87, y:20.47, halfHeight:7.67, halfWidth:10.2, isStatic: true, isSensor: false);// , 999991 freezer
                box2d.createBoxBody(x:28.87, y:12.73, halfHeight:6   , halfWidth:0.1 , isStatic: true, isSensor: false);// , 999992 shelf1
                box2d.createBoxBody(x:28.87, y:10   , halfHeight:6   , halfWidth:0.1 , isStatic: true, isSensor: false);// , 999993 shelf2
                box2d.createBoxBody(x:32.29, y:11.47, halfHeight:0.7 , halfWidth:7.8 , isStatic: true, isSensor: false);// , 999994 fridgeW
                box2d.createBoxBody(x:28.46, y:7.6  , halfHeight:6.83, halfWidth:0.1 , isStatic: true, isSensor: false);// , 999995 fridgeT
                box2d.createBoxBody(x:5    , y:7.75 , halfHeight:10.1, halfWidth:1.1 , isStatic: true, isSensor: false);// , 999996 shelf3
                box2d.createBoxBody(x:33.4 , y:20.1 , halfHeight:1.47, halfWidth:11  , isStatic: true, isSensor: false);// , 999997 unit3

	        bigPot: function() {
	            // pot edges have no fixtures. If the pot was dynamic the sides would move independently
	            add.box({x: 17.1, y: 13.4,height: 2.4, width:0.2, isStatic: true});// right
	            add.box({x: 19, y: 14.5,height: 0.2, width:3.6, isStatic: true});//bottom
	            add.box({x: 20.9, y: 13.4, height: 2.4, width:0.2, isStatic: true});//left


waterSensor = 	box2d.createBoxBody(19, 13.7, 3.6, 1.4, b2Body.b2_staticBody, true);

	        door1: function() {
	            //ovenDoor = box2d.createBoxBody(13.15, 14.7 , 4.7 , 0.2, b2Body.b2_staticBody, false,999998);
	            ovenDoor = add.box({x: 13.15, y: 14.7,height: 0.2, width:4.7, isStatic: true});

	            //console.log(ovenDoor);

	            //maybe more effective to add a shape and fixture to the base of the oven 
	            //need more effective naming convention.  
	            //activation could be the solution rather than create and destroy bodyDef.active=true.
	        },
	        door2: function() {
	            fridgeDoor = add.box({x: 25.32, y: 11.47,height: 7.8, width:0.7, isStatic: true});
	            //maybe more effective to add shapes to a fridge body and destoy and create the wall by clicking on a jquery area.

	        },


converted to: (world measurements)

var initialState = {
					"rightWall"	: {id:  1, x: 35.13,  y: 12.8, halfHeight: 25.6, halfWidth:2   , isStatic: true, isSensor: false},
					"ground" 	: {id:  2, x: 17.07,  y: 26.6, halfHeight: 2  ,  halfWidth:34.13,isStatic: true, isSensor: false},
					"leftWall"	: {id:  3, x: -1, 	  y: 12.8, halfHeight: 25.6, halfWidth:2   , isStatic: true, isSensor: false},
					"unit1" 	: {id:  4, x: 6.53 ,  y:20.1 , halfHeight: 8.6 , halfWidth:11  , isStatic: true, isSensor: false},
					"cooker" 	: {id:  5, x: 13.15,  y:22.9 , halfHeight: 4.7 , halfWidth:4.96, isStatic: true, isSensor: false},
					"unit2" 	: {id:  6, x: 20.3 ,  y:20.1 , halfHeight: 9.4 , halfWidth:11  , isStatic: true, isSensor: false},
					"freezer" 	: {id:  7, x: 28.87,  y:20.47, halfHeight: 7.67, halfWidth:10.2, isStatic: true, isSensor: false},
					"shelf1" 	: {id:  8, x: 28.87,  y:12.73, halfHeight: 6   , halfWidth: 0.1, isStatic: true, isSensor: false},
					"shelf2" 	: {id:  9, x: 28.87,  y:10   , halfHeight: 6   , halfWidth: 0.1, isStatic: true, isSensor: false},
					"fridgeW" 	: {id: 10, x: 32.29,  y:11.47, halfHeight: 0.7 , halfWidth: 7.8, isStatic: true, isSensor: false},
					"fridgeT" 	: {id: 11, x: 28.46,  y:7.6  , halfHeight: 6.83, halfWidth: 0.1, isStatic: true, isSensor: false},
					"shelf3" 	: {id: 12, x: 5    ,  y:7.75 , halfHeight: 10.1, halfWidth: 1.1, isStatic: true, isSensor: false},
					"unit3" 	: {id: 13, x: 33.4 ,  y:20.1 , halfHeight: 1.47, halfWidth: 11 , isStatic: true, isSensor: false},
               		"waterSensr": {id: 15, x: 19,	  y: 13.7, halfHeight: 1.4,	 halfWidth: 2.4, isStatic:false, isSensor: true},
               		"ovenDoor"	: {id: 16, x: 13.15,  y: 14.7, halfHeight: 0.2,  halfWidth: 4.7, isStatic: true, isSensor: false},
               		"fridgeDoor": {id: 17, x: 25.32,  y: 11.47,halfHeight: 7.8,  halfWidth: 0.7, isStatic: true},
               		"bigPot"	: {id: 14, x: 17.1,   y: 13.4, polys:[
								[{x: 0.1, y: 0}, {x: 0.1, y: 1.5}, {x: 0, y: 1.5}, {x: 0, y: 0}], // left side
                 				[{x: 0.1, y: 1.3}, {x: 2, y: 1.3}, {x: 2, y: 1.5}, {x: 0.1, y: 1.5}], // base
                 				[{x: 2.1, y: 0}, {x: 2.1, y: 1.5}, {x: 2, y: 1.5}, {x: 2, y: 0}] // right side
               					], isStatic: false, isSensor:false},
               		"colander"  : {id: 18, x: 15, y:13.5, poly:[
               					[{x: 0.1, y: 0}, {x: 0.1, y: 1.8}, {x: 0, y: 1.8}, {x: 0, y: 0}], // left side
                				[{x: 0.1, y: 1.5}, {x: 2.2, y: 1.5}, {x: 2.2, y: 1.8}, {x: 0.1, y: 1.8}], // base
                				[{x: 2.3, y: 0}, {x: 2.3, y: 1.8}, {x: 2.2, y: 1.8}, {x: 2.2, y: 0}], // right side
                				] isStatic: false, isSensor:false}},
                	"blueBerry"	: {id:  19, x:0, y:0, radius: 2, isStatic: false, isSensor:false},//

};









example from Seth Ladd


var initialState = {"0": {id: 0, x: 10, y: 5, radius: 2},//
                    "1": {id: 1, x: 5, y: 5, polys: [
                      [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y:2}] // triangle
                    ]},
                    "2": {id: 2, x: 9, y: 4, halfHeight: 1.5, halfWidth: 0.9},
                    "3": {id: 3, x: 4.5, y: 3, polys: [
                      [{x: 0, y: -2}, {x: 2, y: 0}, {x: 0, y:2}, {x:-0.5, y: 1.5}] // odd shape
                    ]},
                    "4": {id: 4, x: 10, y: 10, polys: [
                        [{x: -1, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}], // box
                        [{x: 1, y: -1.5}, {x: 2, y: 0}, {x: 1, y: 1.5}]  // arrow
                    ], color: "green"}
};


