// Global constants:
var PLAYGROUND_WIDTH    = 790;
var PLAYGROUND_HEIGHT   = 550;

function setToolTile(tile){
	if(!tile){
		$("#options").html("<div id='tilesMap'></div>");
		for (i=1; i<=$.tiles.tiles().length; i++)
			$("#tilesMap").append("<img id='st"+i+"' src='/static/tiles/"+i+".gif'" +
				" onclick='setToolTile("+i+")'" +
				"style='opacity:0.5'/>")
		$.tool.setTool('Tile')
	}
	else{
		$.tool.changeToolTile(tile);
		$("#st"+tile).animate({opacity:1});
		$(".highlight").animate({opacity:0.5});
		$("#st"+tile).addClass('highlight');
	}	
}

function setToolEntity(entity){
	if(!entity){
		$("#options").html("<div id='entitiesMap'></div>");
		$("#entitiesMap").append("<div id='sedelete' onclick='setToolEntity(\"delete\")')" +
					" style='opacity:0.5; height:32px; width:32px; float:left;" +
					"background-image:url(/static/tiles/tool.gif)'/>");
		entities = $.entities.getEntityTypes();
		$.each(entities, function(key, value){
			$("#entitiesMap").append("<div id='se"+key+"' onclick='setToolEntity(\""+key+"\")')" +
					" style='opacity:0.5; height:32px; width:32px; float:left;" +
					"background-image:url("+value.sprite+")'/>");
		});
		$.tool.setTool('Entity')
	}
	else{
		if(entity !== 'delete'){
			ent = $.entities.getEntityTypes()[entity];
			ent.name = entity;
			$.tool.changeToolEntity(ent);
			$("#se"+entity).animate({opacity:1});
			$(".highlight").animate({opacity:0.5});
			$("#se"+entity).addClass('highlight');		
		}
		else {
			$.tool.changeToolEntity({type:'delete'});
			$("#sedelete").animate({opacity:1});
			$(".highlight").animate({opacity:0.5});
			$("#sedelete").addClass('highlight');		
		}
	}
}

$.tool = function(){
	var current = null;
	var toolTile = 1;
	var toolEntity = function(){
		that = {
			name: 'tool',
			type: 'delete',
			sprite: 'static/pj/tool.png',
			actuators: {}
		};
		return {
			get: function(){
				return {name: that.name,
						type: that.type,
						sprite: that.sprite,
						actuators: that.actuators,
						behaviours: that.behaviours,
						triggers: that.triggers
				};
			},
			set: function(entity){
				if (entity) $.extend(true, that, entity);			
			}
		}
	}();

	return {
		t: function(ev){
			x = ev.pageX - this.offsetLeft;
			y = ev.pageY - this.offsetTop;
			
			tx = Math.ceil(x/32);
			ty = Math.ceil(y/32);
			
			if(current== 'Tile')
				$.tiles.changeTile(tx,ty, toolTile);
			else if(current=='Entity')
				$.entities.changeEntity(tx, ty, toolEntity.get());
		},
		changeToolTile: function(tile){
			toolTile = tile;
		},
		changeToolEntity: function(entity){
			toolEntity.set(entity);
		},
		setTool: function(tool){
			current = tool;
		}
	}		
}();


$.entities = function(){
	entis = {};
	actuators = {};
	entitesAnimations = {};
	entitiesAnimationsSprite = {};
	entityTypes = {};
	return {
		loadEntites: function(entities){
				$.each(entities, function(key, value){
					value.type = key;
					entityTypes[key] = value;
  					entitesAnimations[key] = new $.gameQuery.Animation(
  					  {imageURL: value.sprite, numberofFrame:1, delta:32,
  					   distance:0, rate:100, type: $.gameQuery.ANIMATION_HORIZONTAL |
  					   $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32});
  					entitiesAnimationsSprite[value.sprite] = new $.gameQuery.Animation(
  					  {imageURL: value.sprite, numberofFrame:1, delta:32,
  					   distance:0, rate:100, type: $.gameQuery.ANIMATION_HORIZONTAL |
  					   $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32});
				});
				return entitiesAnimationsSprite;
		},
		add : function(entity, x, y){
			$("#actors").addSprite(entity.name+'-'+x+'-'+y, {
				animation: new $.gameQuery.Animation(
  					  {imageURL: entity.sprite, numberofFrame:1, delta:32,
  					   distance:0, rate:100, type: $.gameQuery.ANIMATION_HORIZONTAL |
  					   $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32}),
  				posx:(x-1)*32, posy:(y-1)*32});
			entis[""+x+","+y] = entity;
		},
		remove: function(entityName, posx, posy){
			$("#"+entityName+'-'+posx+'-'+posy).remove();
			entis[""+posx+","+posy] = null;
		},
		getEntityTypes: function(){
			return entityTypes;
		},
		changeEntity: function(x, y, entity){
			e = entis[""+x+","+y];
  			if(!e && entity.type !== 'delete')
				this.add(entity, x, y);
  			else if(entity.type === 'delete')
  				this.remove(e.name, x, y);
  			else if(e.type !== entity.type){
  				this.remove(e.name, x, y);
  				this.add(entity, x, y, entity.actuators);
  			}
  			else
  				$.extend(actuators[entity.name], entity.actuators);
		}
	}
}();

$.tiles = function(){
	tilemap = [];
	tileAnims = [];
	tils = [];
	return {
		tilemap: function(tilem){
			if(tilem)
				tilemap = tilem;
			return tilemap;
		},
		changeTile: function(x, y, tile){
			tilemap[y-1][x-1] = tile;
			$("#tile_tile_"+ parseInt(y-1) +"_"+parseInt(x-1)).setAnimation(tileAnims[tile-1]);
		},
		loadTileAnimations : function(len){
			for (i=1; i<=len; i++){
					tileAnims[i-1] = new $.gameQuery.Animation({imageURL: "/static/tiles/"+i+".gif", delta:32, rate:300});
					tils[i-1] = i;
			}
			return tileAnims;
		},
		tileAnimations: function(){
			return tileAnims;
		},
		tiles: function(){
			return tils;
		}
	}
}();

//LOADS A MAP
var loadMap = function (map){
    var tilemap = $.tiles.tilemap(map.tilemap);
	var ents = map.entities;
	delete map;
	$.getJSON('/static/tiles/number_tiles.json', function(data){
	tlength = data.l;
	$.getJSON("/static/pj/entities.json", function(entities){
	tileAnimations = $.tiles.loadTileAnimations(tlength);
	entAnimations = $.entities.loadEntites(entities);
	
	$("#playground").playground({height: PLAYGROUND_HEIGHT, 
    	width: PLAYGROUND_WIDTH, keyTracker: true}).startGame();
  
    $.playground().addGroup("background")
    	.addTilemap("tile", tilemap, tileAnimations, {className:"t_"});
    
    $.playground().addGroup("actors");
    $.each(ents, function(key, value){
    	value.name = key;
  		$.entities.add(value, value.posx, value.posy);
    });
   	})});
	
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
	$("#playground").click($.tool.t);
});
