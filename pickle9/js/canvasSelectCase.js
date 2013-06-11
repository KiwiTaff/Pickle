(function() {
	canvas = document.getElementById(id);
            ctx = canvas.getContext("2d");

    //set up an array of food items

	function randomise(options) {
            options = options || {};
            var ingredients=Math.round(Math.random()*foodList.length);
            console.log(ingredients);
    }

	switch(ingredients)
	{w
	case "1":
	  food = new Image();
        food.src = 'images/beef.png';
        ctx.drawImage(food, 0, 0);
	  break;
	case "2":
		if()options.radius = options.radius||0.5 + Math.random()*1;//adds radius to the prototype
            var shape = new Circle(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);

	  food = new Image();
        food.src = 'images/carrot.png';
        ctx.drawImage(food, 0, 0);
	  break;
	case "3":
	  food = new Image();
        food.src = 'images/capsicum.png';
        ctx.drawImage(food, 0, 0);
	  break;
	case "4":
	  food = new Image();
        food.src = 'images/potato.png';
        ctx.drawImage(food, 0, 0);
	  break;
	default:
	  code to be executed if n is different from case 1,2,3 and 4
	}
   
   init.start('canvasId');

})();

random: function(options) {
            options = options || {};
            var choice=Math.random();
            console.log(choice);
            if (choice < 0.33){
                this.circle(options);
            }else if (choice < 0.67) {
                this.box(options);
            }else{
                this.pot(options);
            }
        },