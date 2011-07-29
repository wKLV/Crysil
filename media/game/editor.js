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
		$(".highlight").animate({opacity:0.5});			
		$(".highlight").removeClass('highlight')
		$("#st"+tile).addClass('highlight');
		$("#st"+tile).animate({opacity:1});
	}	
}

function setToolEntity(entity){
	// The Tool was selected in the top menu
	if(!entity){
		$("#options").html("<div id='entitiesMap'></div> <br><hr><h3>ACTIONS</h3><div id='actuatorTool'></div>");
		$("#entitiesMap").append("<div id='sedelete' onclick='setToolEntity(\"delete\")')" +
					" style='opacity:0.5; height:32px; width:32px; float:left;" +
					"background-image:url(/static/tiles/tool.gif)'/>");
		var entities = $.entities.getEntityTypes();
		$.each(entities, function(key, value){
			$("#entitiesMap").append("<div id='se"+key+"' onclick='setToolEntity(\""+key+"\")')" +
					" style='opacity:0.5; height:32px; width:32px; float:left;" +
					"background-image:url("+value.sprite+")'/>");
		});
		$.tool.setTool('Entity')
	}
	// A entity has been selected
	else{
		if(entity !== 'delete'){
			var ent = $.entities.getEntityTypes()[entity];
			ent.name = entity;
			$.tool.changeToolEntityBrush(ent);
			$(".highlight").animate({opacity:0.5});
			$(".highlight").removeClass('highlight')
			$("#se"+entity).addClass('highlight');		
			$("#se"+entity).animate({opacity:1});
			
		}
		else {
			$.tool.changeToolEntityBrush({type:'delete'});
			$(".highlight").animate({opacity:0.5});
			$(".highlight").removeClass('highlight')
			$("#sedelete").addClass('highlight');		
			$("#sedelete").animate({opacity:1});
		}
	}
};

function setActuatorTool(actuators, entName){
	if(!actuators){
		actuators = $.tool.getToolActuators().actuators;
		entName = $.tool.getToolActuators().entName;
	}
	else
		$.tool.changeToolActuators(actuators, entName);
	$("#actuatorTool").empty();
	$.each(actuators, function(key, value){
		var id = 'sa' + key;
		$("#actuatorTool").append("<div id='"+id+"' style:'float:center'><h4>"+key+ "</h4></div>");
		$("#"+id).append("<div id='"+id+"new'><div id='"+id+"newimg' style='float:left; " +
				"background-image:url(/static/icons/defaultent.png); height:32; width:32'/> To create a new action " +
				"drop a entity from the map to the icon</div>");
		$.each(actuators[key], function(k, v){
			$("#"+id).append("<div id='"+id+k+"'>" +
				"<div id='"+id+k+"img' ent='"+v.target.xy+"' style='float:left; " +
				"background-image:url("+v.target.sprite+"); width:32; height:32'/>" +
				"<select id='"+id+k+"beh' style='float:left'> </select>" +
				"<div id='"+id+k+"rem' onclick='removeActuator("+k+",\""+entName+"\", \""+key+"\")'" +
				"style='float:left; background-image:url(/static/tiles/tool.gif); width:32; height:32'/>" +
				"</div> <br>");
				var selector = $("#"+id+k+"beh");
				$.each($.entities.getEntityTypes()[v.target.type].behaviours, function(bk, bv){
					selector.append($("<option>", {value: bv}).text(bv));
				});
				selector.val(v.behaviour);
				selector.change(function(){
					editActuatorTool({behaviour:selector.val(), trigger:key, owner:entName, 
					target:$.entities.get($("#"+id+k+"img").attr('ent'))}, k);
				});
		});
		$("#"+id+"new").droppable({accept:'.entity', activeClass:'entOver', drop: function(event, ui){
				editActuatorTool({trigger: key, owner: entName, target:$.entities.get(ui.helper.attr('ent'))}, false);		}});
	});	
};

function editActuatorTool(actuator, overwrite){
	var acts = $.entities.getActuators()[actuator.owner][actuator.trigger];
	if(overwrite || overwrite === 0)
		acts[overwrite] = {behaviour:actuator.behaviour, target:actuator.target};	
	else 
		acts.push({target:actuator.target, behaviour:actuator.behaviour});
	setActuatorTool();
};

function removeActuator(index, own, trig){
	$.entities.getActuators()[own][trig].splice(index,1);
	setActuatorTool();
}

$.tool = function(){
	var current = null;
	var toolTile = 1;
	var toolEntityBrush = function(){
		var that = {
			name: 'tool',
			type: 'delete',
			sprite: 'static/pj/tool.png',
		};
		return {
			get: function(){
				return { name: that.name,
						 type: that.type,
						 sprite: that.sprite,
						 triggers: that.triggers,
						 behaviours: that.behaviours,
						 xy: that.xy				
					   };
			},
			set: function(entity){
				if (entity) $.extend(true, that, entity);			
			}
		}
	}();
	var toolActuators = function(){
		var entName;
		return {
			get: function(){
				return {actuators:$.entities.getActuators()[entName], entName: entName};
			},
			set: function(actuators, entiName){
				if (actuators) $.extend(true, $.entities.getActuators()[entiName], actuators);
				entName = entiName;	
			}
		}
	}();

	return {
		t: function(ev){
			var x = ev.pageX - this.offsetLeft;
			var y = ev.pageY - this.offsetTop;
			
			var tx = Math.ceil(x/32);
			var ty = Math.ceil(y/32);
			
			if(current== 'Tile')
				$.tiles.changeTile(tx,ty, toolTile);
			else if(current=='Entity')
				$.entities.changeEntity(tx, ty, toolEntityBrush.get());
		},
		changeToolTile: function(tile){
			toolTile = tile;
		},
		changeToolEntityBrush: function(entity){
			toolEntityBrush.set(entity);
		},
		changeToolActuators: function(actuators, entName){
			toolActuators.set(actuators, entName);
		},
		setTool: function(tool){
			current = tool;
		},
		getToolActuators: function(){
			return toolActuators.get();
		}
	}		
}();


$.entities = function(){
	var entis = {};
	var actuators = {};
	var entitiesAnimations = {};
	var entityTypes = {};
	var entityDrop = function(entId, ox, oy, x, y){
		var nx = Math.ceil(x/32); var ny = Math.ceil(y/32);
		
		if(x<=PLAYGROUND_WIDTH && y<=PLAYGROUND_HEIGHT)
			$.entities.move(entId, nx, ny, ox, oy);
	
	};
	return {
		loadEntites: function(entities){
				$.each(entities, function(key, value){
					value.type = key;
					entityTypes[key] = value;
  					entitiesAnimations[key] = new $.gameQuery.Animation(
  					  {imageURL: value.sprite, numberofFrame:1, delta:32,
  					   distance:0, rate:100, type: $.gameQuery.ANIMATION_HORIZONTAL |
  					   $.gameQuery.ANIMATION_MULTI, offsetx: 0, offsety: 32});
				});
				return entitiesAnimations;
		},
		add : function(entity, x, y){
			entity.name = entity.type + 'at' +x+''+y;
			entity.xy = ""+x+","+y;
			$("#actors").addSprite(entity.name, {
				animation: entitiesAnimations[entity.type],
  				posx:(x-1)*32, posy:(y-1)*32, classes:'entity'});
			entis[""+x+","+y] = entity;
			
			actuators[entity.name] = {};
			var triggers = entityTypes[entity.type].triggers;
			for (i=0; i<triggers.length; i++)
				actuators[entity.name][triggers[i]] = [];
		
			$("#"+entity.name).draggable({helper:'clone', scroll:false, appendTo:'#options', stop: function(ev, ui) {
				var off = $("#playground").offset();
				entityDrop(entity.name, x, y, ev.pageX - off.left, ev.pageY -off.top)
			}});
			$("#"+entity.name).attr('ent', ""+x+","+y);
		},
		get: function(id){
			return entis[id];
		},
		remove: function(entityId, posx, posy){
			$("#"+entityId).remove();
			entis[""+posx+","+posy] = null;
		},
		move: function(entityName, posx, posy, ox, oy){
			var ent = entis[""+ox+","+oy];
			ent.xy = ""+posx+""+posy;
			this.remove(entityName, ox, oy);
			this.add(ent, posx, posy);
		},
		getEntityTypes: function(){
			return entityTypes;
		},
		changeEntity: function(x, y, entity){
			var e = entis[""+x+","+y];
  			if(!e && entity.type !== 'delete'){
				this.add(entity, x, y);
				setActuatorTool(actuators[entity.name], entity.name);
  			}
  			else if(entity.type === 'delete')
  				this.remove(e.name, x, y);
  			else
  				setActuatorTool(actuators[e.name], e.name);

		},
		getActuators: function(){
			return actuators;
		}
	}
}();

$.tiles = function(){
	var tilemap = [];
	var tileAnims = [];
	var tils = [];
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
	var tlength = data.l;
	$.getJSON("/static/pj/entities.json", function(entities){
	var tileAnimations = $.tiles.loadTileAnimations(tlength);
	var entAnimations = $.entities.loadEntites(entities);
	
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
