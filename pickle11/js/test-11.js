step3       = ingredients ({"0":{x:5, y:13.4, radius:0.3, isStatic:false, imgSrc:'images/carrot.png'},
                           "1":{x:5, y:13.4, height:0.3, width:0.3, isStatic:false, imgSrc:'images/capsicum.png'},
                           "2":{x:5, y:13.4, height:0.4, width:0.4, isStatic:false, imgSrc:'images/potato.png'}
                           });


 function ingredients(options) {  
    var numIngredients = 0;
    var ingredient=[];

    //loops through the object and for every instance of id adds one to the number of ingredients
    for(var id in options) {
        numIngredients++;
        console.log(id);
    };
    //ing(n) with a value between 0 and 1 will be generated
    //eg if numIngredients=2 the values for ing3 and ing4 will be greater than 1 and will be ignored
    ing1=1/numIngredients; 
    ing2=2/numIngredients;
    ing3=3/numIngredients;
    ing4=4/numIngredients;
            
    for(var i = 0; i < 25; ++i) {       //this loop will produced 25 lumps
        n=Math.random();
        //console.log(n);
        if(n<ing1){
            ingredient=options[0];
            //break;
        }else if(n<ing2){
            ingredient=options[1];
            //break;
        }else if(n<ing3){
            ingredient=options[2];
            //break;
        }else{
            ingredient=options[3];
            //break;
        }
        if(ingredient.radius){
            console.log("circle");
        }else{
            console.log('box');
        }
            
    }
}