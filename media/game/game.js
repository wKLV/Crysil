// Global constants:
var PLAYGROUND_WIDTH    = 790;
var PLAYGROUND_HEIGHT   = 550;
var REFRESH_RATE        = 15;

var setEntityAnimation = function(entityId, animation){
	$("#"+entityId).setAnimation(animation);
}

//it creates the animations and put them all in tileanimations
var loadTileAnimations = function(tiles){
	var tileAnimations = [];
	var c=0;
	for (i=1; i<tiles[tiles.length-1]+1; i++){
		if(tiles[c]==i){
			c++;
			tileAnimations.push(new $.gameQuery.Animation(
				{imageURL: "/static/tiles/"+i+".gif",type: $.gameQuery.ANIMATION_HORIZONTAL, 
                	numberOfFrame: 1, delta: 10, rate: 300}));
		}
//as the animations are got by their index, it puts blank where should be animations	
		else tileAnimations.push(0);
	} 
	return tileAnimations
};


//Creates the animations for the map entities
var loadEntitiesAnimations = function(entities){
	var pjAnimations = {}
	$.each(entities, function(key, value){
  		pjAnimations[key] = 
  			new $.gameQuery.Animation({imageURL: value.sprite})
	});
	return pjAnimations;
};


//Adds a entity to the playground and adds the trigger
var addEntity = function(entity, entityName, animation){
		$("#actors").addSprite(entityName, {animation: animation, posx:entity.posx, posy:entity.posy });
	}


//LOADS A MAP
var loadMap = function (map){
    var tilemap = map.tilemap;
	var tiles = map.tiles;
	var ents = map.entities;
	delete map;
	
	tileAnimations = loadTileAnimations(tiles);
	entAnimations = loadEntitiesAnimations(ents);
	pjAnimation = new $.gameQuery.Animation({imageURL: "/static/pj/robot1.png"});
	lampOnAnimation = new $.gameQuery.Animation({imageURL: "/static/pj/lampon.png"});
	lampOffAnimation = new $.gameQuery.Animation({imageURL: "/static/pj/lamp.png"});
	casitaAniamtion = new $.gameQuery.Animation({imageURL: "/static/pj/casa.png"});
	
	$("#playground").playground({height: PLAYGROUND_HEIGHT, 
    	width: PLAYGROUND_WIDTH, keyTracker: true})
    $.playground().startGame();
    $.playground().addGroup("background")
    	.addTilemap("tile", tilemap, tileAnimations, {className:"t_"});
    $.playground().addSprite("Casita", {animation: casitaAniamtion, width:300, height:200, posx:300, posy:300 });
    $.playground().addGroup("actors");
    addEntity({posx:0,posy:0}, "PJ", pjAnimation);
    $.each(ents, function(key, value){
  		addEntity(value, key, entAnimations[key]);
    });
};

var lampOnAnimation;
var lampOffAnimation;

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
	
	$.playground().registerCallback(function(){
		if(jQuery.gameQuery.keyTracker[65]){ //(a) Izquierda
			var nextpos = parseInt($("#PJ").css("left"))-3;
			if(nextpos > 0){
				$("#PJ").css("left", ""+nextpos+"px");
			}
		}

		if(jQuery.gameQuery.keyTracker[68]){ //(d) Derecha
			var nextpos = parseInt($("#PJ").css("left"))+3;
			if(nextpos < PLAYGROUND_WIDTH){
				$("#PJ").css("left", ""+nextpos+"px");
			}
		}

		if(jQuery.gameQuery.keyTracker[87]){ //(w) Arriba
			var nextpos = parseInt($("#PJ").css("top"))-3;
			if(nextpos > 0){
				$("#PJ").css("top", ""+nextpos+"px");
			}
		}

		if(jQuery.gameQuery.keyTracker[83]){ //(s) Down
			var nextpos = parseInt($("#PJ").css("top"))+3;
			if(nextpos < PLAYGROUND_HEIGHT){
				$("#PJ").css("top", ""+nextpos+"px");
			}
		}
	}, REFRESH_RATE);
});

$(document).keydown(function(e){
	switch(e.keyCode){
    	case 13: //this is enter! (enter)
        	$.getJSON('http://127.0.0.1:8080/game/entity=1/trigger=press', function(data){
				if(data.mtoggle.sprite.newSprite == '/static/pj/lampon.png')
					setEntityAnimation(data.mtoggle.sprite.instance, lampOnAnimation);        
				else if (data.mtoggle.sprite.newSprite == '/static/pj/lamp.png')
					setEntityAnimation(data.mtoggle.sprite.instance, lampOffAnimation);   	
        	});
    }});
