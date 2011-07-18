// Global constants:
var PLAYGROUND_WIDTH    = 790;
var PLAYGROUND_HEIGHT   = 550;

function setToolTile(){
	
}
var changeTile = function(x, y){
	$.tiles.changeTile(x,y,3);
};

function setToolEntity(){
	
}

var tool = function(ev){
	x = ev.pageX;
	y = ev.pageY;
	
	tx = Math.ceil(x/32);
	ty = Math.ceil(y/32)-1;
	
	changeTile(tx,ty);
	
}

var animations = function(){
	anims = {};
	tileAnims = new Array();
	return { 
		add : function(animationName, options){
			var animation = new $.gameQuery.Animation(options);
			anims[animationName] = animation;
			return animation;
		},
		get : function(animationName){
			return anims[animationName];
		},
		setRow : function(row, animationName){
			anim = anims[animationName];
			anim.offsety = (row-1)*anim.delta;
			return anim;
		},
		setColumn : function(column, animationName){
			anim = anims[animationName];
			anim.offsetx = (column-1)*anim.delta;
			return anim;
		},
		setEntityAnimation : function(enitityId, animationName){
			$('#'+entityId).setAnimation(anims[animationName]);
		},
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
	entities = {};
	entitiesPos = {};
	return {
		add : function(entity, entityName, animation, posx, posy){
			$("#actors").addSprite(entityName, {animation: animation, posx:(entity.posx-1)*32, posy:(entity.posy-1)*32 });
			entitiesPos[''+posx+','+posy] = entity.actuators;
		},
		moveEntity : function(entityName, newPosx, newPosy){
			ox = entities[entityName]; oy = entities[entityName];
			entities[entityName].posx = newPosx; entities[entityName].posy = newPosy;
			delete entitiesPos[""+ox+","+oy];
			entitiesPos[""+newPosx+","+newPosy] = entities[entityName];
		},
		getEntityActuatorbyName : function(entityName, trigger){
			return entities[entityName].act[trigger];
		},
		getEntityActuator : function(x,y,trigger){
			return entitiesPos[""+x+","+y][trigger];
		}
	}
}();

$.tiles = function(){
	tilemap = [];
	tileAnims = [];
	return {
		tilemap: function(tilem){
			tilemap = tilem;
			return tilemap;
		},
		changeTile: function(x, y, tile){
			tilemap[y-1][x-1] = tile;
			$("#tile_tile_"+ parseInt(y-1) +"_"+parseInt(x-1)).setAnimation(tileAnims[tile-1]);
		},
		loadTileAnimations : function(len){
			for (i=1; i<=len; i++)
					tileAnims[i-1] = new $.gameQuery.Animation({imageURL: "/static/tiles/"+i+".gif", delta:32, rate:300});				
			return tileAnims;
		}
	}
}();

//Creates the animations for the map entities
var loadEntitiesAnimations = function(entities){
	var pjAnimations = {}
	$.each(entities, function(key, value){
  		pjAnimations[key] = 
  			//new $.gameQuery.Animation({imageURL: value.sprite})
  			animations.add(key, {imageURL: value.sprite, numberofFrame:1, delta:32, distance:0, rate:100,
				type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32});
	});
	return pjAnimations;
};


//LOADS A MAP
var loadMap = function (map){
    var tilemap = $.tiles.tilemap(map.tilemap);
	var tiles = map.tiles;
	var ents = map.entities;
	delete map;
	
	tileAnimations = animations.loadTileAnimations(tiles);
	entAnimations = loadEntitiesAnimations(ents);
	
	$("#playground").playground({height: PLAYGROUND_HEIGHT, 
    	width: PLAYGROUND_WIDTH, keyTracker: true}).startGame();
  
    $.playground().addGroup("background")
    	.addTilemap("tile", tilemap, tileAnimations, {className:"t_"});
    
    $.playground().addGroup("actors");
    $.each(ents, function(key, value){
  		entities.add(value, key, entAnimations[key], value.posx+1, value.posy+1);
    });
    
    $("#playground").click(tool);
};

$(function(){
	var mapJSON;	
	var req = new XMLHttpRequest();
	req.open('GET', 'http://127.0.0.1:8080/static/maps/test.json', false);
	req.send(null);
	if(req.status == 200)
		mapJSON = req.responseText;
	delete req;
	var map = json_parse(mapJSON).map;

	loadMap(map);
});
