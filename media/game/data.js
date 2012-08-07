DATA = function(){
	var string = 'string';
	var longString = 'longString';
	var integer = 'integer';
	var boolean = 'boolean';
	var reference = 'reference';
	var multiple = 'multiple';
	var tuple = 'tuple';
	
	var data = {}
	
	var set = function(type, element, value){ data[type][element][value.name] = value.value; return value;}
	var get = function(type){return data[type]}
	
	var print = function(name, type, val){
		switch(type){
		case string: return $('<input type="text" class="'+name+'" />').val(val); break;
		case longString: return $('<textarea class="'+name+'"/>').val(val); break;
		case integer: return $('<input type="number" class="'+name+'"/>').val(val); break;
		case boolean: return $('<input type="radio" class="'+name+'"/>').val(val); break;
		default:
			switch(type.type){
				case tuple:
					var e = $('<div class="'+name+'"/>');
					$.each(type.value, function(i, v){
						e.append(print(v.name, v.type, v.value));});							
					return e;
				case reference: 
					var sel = $('<select name="'+name+'">');
					for (e in get(type.ref))
						sel.append($('<option value="'+
								e[val.name]+'">'+
								e[val.name]+'</option>'));
					sel.val(val);
					return sel;
					break;
			}
		}
	};
	var printAdd = function(d){
		var p = $('<div id="'+d.name+'new"/>');
		p.append(print(d.name, {type:d.type, value:d.value}, d.value));
		p.append("<a onclick='DATA.add(\""+d.name+"\", \""+d.name+"new\")'>ADD</a>");
		return p;
	};
	
	var getData = function(div, type){
		switch(type){
			case string: return div.val(); break;
			case longString: return div.val(); break;
			case integer: return div.val(); break;
			case boolean: return div.val(); break;
			case reference: return div.val(); break;
			default:
				switch(type.type){
					case tuple:
						var list = [];
						div.each(function(i,v){
							list.push(getData(v, type.value[v.attr('class')]))
						})
						return list; break;
				}
		}
	};
	var separateType = function(name, type, f){
		var obj = {name:name, type:type}
		switch(type){
			case string: obj.value = f(type); break; 
			case longString: obj.value = f(type); break; 
			case integer: obj.value = f(type); break; 
			case boolean: obj.value = f(type); break;
			case reference : obj.value = f(type); break;
			default:
				switch(type.type){
					case tuple:
						var obj = {};
						$.each(type.value, function(i,v){
							obj[i] = {name:name, type:type, value:f(v.type)}
						})
					break;
			}
			return obj;
		}
	}
							
	return {
		createType: function(name, type){
			data[name+'type']=type
			data[name]={}
			
			return {
				add: function(elementname, element){
					data[name][elementname] = element
					return this;
				},
				get: function(elementname){
					return {type:type, name:elementname, value:data[name][elementname]}
				},
				print: function(div){
					for (e in data[name]){
						div.append($("e.name+'!!!'"))
						for (i in e.value)
							div.append(print(e.name, e.type, e.val));
					}
					div.append(printAdd(data[name+'type']));
					return this;
				}
			}
		},
		getType: function(name){
			return data[name+'type'];
		},
		add: function(type, id){
			var div = $("#"+id);
			type = data[type+'type'];
			var dat = separateType(type.name, type, function(i){
				getData($('.'+i, $(div)), i)
			});
			data[type.name][dat.name] = dat;
		}
	}
}();