// Global constants:
var PLAYGROUND_WIDTH    = 790;
var PLAYGROUND_HEIGHT   = 550;
var REFRESH_RATE        = 15;

//It manages the collisions
var collisions = function(){
	 var walls= {};
	 var tiles = {};
	 var entities = {};
	 // Helper function that generates a key for two points
	 var createKey = function(posx1, posy1, posx2, posy2){
	 	return "" + posx1+','+ posy1+';'+posx2+','+posy2;
	 };
	 // Helper function that generates a key for one point
	 var createSKey = function(posx, posy){
	 	return ""+posx+','+posy;
	 };
	 return {
		 addWall : function(posx, posy, len, direction) {
		 	if (direction == 0)
		 		for (i=0; i<len; i++)
		 			walls[createKey(posx+i, posy-1, posx+i, posy)] = true
		 	else if(direction == 90)
		 		for (i=0; i<len; i++)
		 			walls[createKey(posx-1, posy-i, posx, posy-i)] = true
		 },
		 addTile : function(posx, posy){
		 	tiles[createSKey(posx,posy)] = true;
		 },
		 addEntity : function(posx,posy){
		 	entities[createSKey(posx, posy)] = true;
		 },
		 isPassable: function(posx1, posy1, posx2, posy2){
		 	var w = walls[createKey(posx1,posy1,posx2,posy2)];
		 	var t = tiles[createSKey(posx2,posy2)];
		 	var e = entities[createSKey(posx2,posy2)]
		 	if (w || t || e) return false;
		 	else return true;
		 }
	 };
}();

// It manages the position of the pj
var pjPosition = function(){
	// The current positions and direction
	var posx=1; var posy=1; var dir = 0;
	// position : {nPosx, nPosy}
	// Help function to generate the position 
	var getNewPosition = function(incX, incY, aut){
		//Down left corner
		if(dir === 135 || dir === 180 || dir === 225)
			return {nPosx:parseInt($("#PJ").css("left"))+incX,
			  nPosy:parseInt($("#PJ").css("top"))+30+incY, automatic:aut};
		// Down center
		else if(dir === 90 ||dir ===  270)
			return {nPosx:parseInt($("#PJ").css("left"))+16+incX,
			  nPosy:parseInt($("#PJ").css("top"))+30+incY, automatic:aut};
		// Down right corner
		else if(dir === 0 || dir === 45 || dir === 315)
			return {nPosx:parseInt($("#PJ").css("left"))+32+incX,
			  nPosy:parseInt($("#PJ").css("top"))+30+incY, automatic:aut};
	};
	return {
		changePosition : function (nPosx, nPosy){
			var nTPosx = Math.ceil(nPosx/32);
			var nTPosy = Math.ceil(nPosy/32);
			posx = nTPosx;
			posy = nTPosy;
			if (dir === 135 || dir=== 180 || dir=== 225) $("#PJ").css("left", nPosx);
			else if (dir === 90 || dir===270) $("#PJ").css("left", nPosx-16);
			else if (dir === 0 || dir===45 || dir===315) $("#PJ").css("left", nPosx-32);
			$("#PJ").css("top", nPosy-30);
		},
		//opts x,y and automatic(changes the position automatically)
		isChangePosition : function(opts){
			// The new coordinates
			var nPosx = opts.nPosx; var nPosy = opts.nPosy; var automatic = opts.automatic;
			// the new TILE position
			var nTPosx = Math.ceil(nPosx/32);
			var nTPosy = Math.ceil(nPosy/32);
			if (posx != nTPosx || nTPosy != posy)
				if(collisions.isPassable(posx, posy, nTPosx, nTPosy)){
					if(automatic)
						this.changePosition(nPosx,nPosy);	
					return true;		 
				}
				else return false;
			else {
				 this.changePosition(nPosx,nPosy);
				 return false;
			}
		},
		changeDirection : function (nDirection){
			if (nDirection === 0 || nDirection === 45 || nDirection === 90
				|| nDirection === 135 || nDirection === 180 || nDirection === 225
				|| nDirection === 270 || nDirection === 315){
				dir = nDirection
				return true;
			}
			else return false;
		},
		getLookedPosition : function(){
			if (dir ===0) return {x:posx+1, y:posy};
			else if (dir===45) return {x:posx+1, y:posy-1};
			else if (dir===90) return {x:posx, y:posy-1};
			else if (dir===135) return {x:posx-1, y:posy-1};
			else if (dir===180) return {x:posx-1, y:posy};
			else if (dir===225) return {x:posx-1, y:posy+1};
			else if (dir===270) return {x:posx, y:posy+1};
			else if (dir===315) return {x:posx+1, y:posy+1};
			else return null;
		},
		tryMoveCharacter: function(direction){
			dir = direction;
			if (dir ===0) return this.isChangePosition (getNewPosition(3, 0, true));
			else if (dir===45) return this.isChangePosition (getNewPosition(2, -2, true));
			else if (dir===90) return this.isChangePosition (getNewPosition(0, -3, true));
			else if (dir===135) return this.isChangePosition (getNewPosition(-2, -2, true));
			else if (dir===180) return this.isChangePosition (getNewPosition(-3, 0, true));
			else if (dir===225) return this.isChangePosition (getNewPosition(-2, 2, true));
			else if (dir===270) return this.isChangePosition (getNewPosition(0, 3, true));
			else if (dir===315) return this.isChangePosition (getNewPosition(2, 2, true));
			else return null;
		}
	}
}();

var animations = function(){
	var anims = {};
	var tileAnims = new Array();
	return { 
		add : function(animationName, options){
			var animation = new $.gameQuery.Animation(options);
			anims[animationName] = animation;
			return animation;
		},
		get : function(animationName){
			return anims[animationName];
		},
		// It changes the row (horizontal) of a multianimation
		setRow : function(row, animationName){
			anim = anims[animationName];
			anim.offsety = (row-1)*anim.delta;
			return anim;
		},
		// It changes the column (vertical) of a multianimation
		setColumn : function(column, animationName){
			var anim = anims[animationName];
			anim.offsetx = (column-1)*anim.delta;
			return anim;
		},
		setEntityAnimation : function(enitityId, animationName){
			$('#'+entityId).setAnimation(anims[animationName]);
		},
		// It creates the necessary tiles, specified in the tiles field in the JSON
		loadTileAnimations : function(tiles){
			var c=0;
			for (i=1; i<tiles[tiles.length-1]+1; i++){
				if(tiles[c]==i){
					tileAnims[i-1] = new $.gameQuery.Animation({imageURL: "/static/tiles/"+i+".gif", delta:32, rate:300});
					c++;
				}
//as the animations are got by their index, it puts blank where should be animations	
				else tileAnims.push(0);
			}; 
			return tileAnims
		}
	}
}();

var entities = function(){
	var entities = {};
	var entitiesPos = {};
	return {
		add : function(entity, entityName, animation, posx, posy){
			$("#actors").addSprite(entityName, {animation: animation, posx:(entity.posx-1)*32, posy:(entity.posy-1)*32 });
			collisions.addEntity(entity.posx, entity.posy);
			entities[entityName] = {act:entity.actuators, posx:posx, posy:posy};
			entitiesPos[''+posx+','+posy] = entity.actuators;
		},
		moveEntity : function(entityName, newPosx, newPosy){
			var ox = entities[entityName]; oy = entities[entityName];
			entities[entityName].posx = newPosx; entities[entityName].posy = newPosy;
			delete entitiesPos[""+ox+","+oy];
			entitiesPos[""+newPosx+","+newPosy] = entities[entityName];
		},
		getEntityActuatorbyName : function(entityName, trigger){
			return entities[entityName].act[trigger];
		},
		getEntityActuator : function(x,y,trigger){
			return entitiesPos[""+x+","+y][trigger];
		}, 
		//Creates the animations for the map entities
		loadEntitiesAnimations: function(entities){
			var pjAnimations = {}
			$.each(entities, function(key, value){
		  		pjAnimations[key] = 
		  			//new $.gameQuery.Animation({imageURL: value.sprite})
		  			animations.add(key, {imageURL: value.sprite, numberofFrame:1, delta:32, distance:0, rate:100,
						type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32});
			});
			return pjAnimations;
		}
	}
}();


//LOADS A MAP
var loadMap = function (map){
    var tilemap = map.tilemap;
	var tiles = map.tiles;
	var ents = map.entities;
	delete map;
	
	var tileAnimations = animations.loadTileAnimations(tiles);
	var entAnimations = entities.loadEntitiesAnimations(ents);
	var pjAnimation = animations.add('PJ', {imageURL: "/static/pj/robot1.png", numberOfFrame: 6, delta: 32, distance: 0, rate: 100, 
		type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 0});
		
	$("#playground").playground({height: PLAYGROUND_HEIGHT, 
    	width: PLAYGROUND_WIDTH, keyTracker: true}).startGame();
  
    $.playground().addGroup("background")
    	.addTilemap("tile", tilemap, tileAnimations, {className:"t_"});
    
    // We add to the colisions the non-walkable tiles
    var nonWalkTiles = [];
    $.getJSON("http://127.0.0.1:8080/static/tiles/walkable.json",function(nonWalkTiles){
    	for (i=0;i<tilemap.length; i++)
			for (j=0; j<tilemap[0].length; j++)
				for (k=0; k<nonWalkTiles.length; k++)
					if (tilemap[i][j] === nonWalkTiles[k])
						collisions.addTile(j+1, i+1);
    });
  
    $.playground().addGroup("actors");
    $("#actors").addSprite("PJ", {animation: pjAnimation, posx:0, posy:0 });
    $.each(ents, function(key, value){
  		entities.add(value, key, entAnimations[key], value.posx, value.posy);
    });
};

$(function(){
	var mapJSON;	
	var req = new XMLHttpRequest();
	req.open('GET', 'http://127.0.0.1:8080/static/maps/MAPPY.json', false);
	req.send(null);
	if(req.status == 200)
		mapJSON = req.responseText;
	delete req;
	var map = json_parse(mapJSON).map;

	loadMap(map);
	
	$.playground().registerCallback(function(){
		if(jQuery.gameQuery.keyTracker[65]){     //a
			if(jQuery.gameQuery.keyTracker[87]){       //w : UP LEFT
				animations.setRow(7, 'PJ');
				pjPosition.tryMoveCharacter(135);
			}
			else if(jQuery.gameQuery.keyTracker[83]){ //s: DOWN LEFT
				animations.setRow(6, 'PJ');
				pjPosition.tryMoveCharacter(225);
			}
			else{                                     // LEFT
				animations.setRow(2, 'PJ');
				pjPosition.tryMoveCharacter(180);
			}
		}
		else if(jQuery.gameQuery.keyTracker[68]){ //d
			if(jQuery.gameQuery.keyTracker[87]){       // w : UP RIGHT
				animations.setRow(8, 'PJ');
				pjPosition.tryMoveCharacter(45);
			}
			else if(jQuery.gameQuery.keyTracker[83]){ // s : DOWN RIGHT
				animations.setRow(5, 'PJ');
				pjPosition.tryMoveCharacter(315);
			}
			else{                                     //RIGHT
				animations.setRow(3, 'PJ');
				pjPosition.tryMoveCharacter(0);
			}
		}
		else if(jQuery.gameQuery.keyTracker[87]){  //    UP
			animations.setRow(4, 'PJ');
			pjPosition.tryMoveCharacter(90);
		}
		else if(jQuery.gameQuery.keyTracker[83]){  // DOWN
			animations.setRow(1, 'PJ');
			pjPosition.tryMoveCharacter(270);
		}
	}, REFRESH_RATE);
});

$(document).keydown(function(e){
	switch(e.keyCode){
    	case 13: //this is enter! (enter)
    	var pos = pjPosition.getLookedPosition();
    	var x = pos.x;
    	var y = pos.y;
    	var ent = entities.getEntityActuator(x,y,"press");
    	if(ent){
        	$.getJSON('http://127.0.0.1:8080/game/entity='+ent+'/trigger=press', function(data){
					animations.setRow(data.mon.sprite.newSprite, data.mon.sprite.instance);
        	});
    }}});
