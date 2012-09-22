THREE.Object3D.prototype.select = function(select){
	var its = {}, itsnext = {};
	function iterchildren(el, f){
		$.each(el.children, function(i,v){
			iterchildren(v, f);
			f(i,v);
		});
	}
	function arrayrem(l1, l2){
		$.each(l1, function(i,v){
			if(l2[i]) delete l1[i]
		});
	}
	function arrayintersect(l1, l2){
		$.each(l1, function(i,v){
			if(! l2[i]) delete l1[i]
		});
	}
	if(typeof select === 'string'){
		var first = select[0]
		select = select.slice(1);
		var iAnd = select.search('&&'); 
		var iOr = select.search('vorv');
		var next = false;
		if(iAnd !== -1 && (iAnd < iOr || iOr === -1)){
			next = {select: select.slice(iAnd+2), t:'and'}
			select = select.slice(0, iAnd);
		}
		else if(iOr !== -1 && (iOr < iAnd || iAnd === -1)){
			next = {select: select.slice(iOr), t:'or'}
			select = select.slice(0, iOr+4);
		}
		switch (first){
		case '¬':
			var itsnot = this.select(select);
			var itseverything = this.select(':all');
			arrayrem(itseverything, itsnot);
			its = itseverything;
			break;
		case '#':
			iterchildren(this, function(i,v){
				if(v.name === select) its[v.id] = v;
			});
			break;
		case '.':
			iterchildren(this, function(i,v){
				if(v.class === select) its[v.id] = v;
			});			
			break;
		case ',':
			iterchildren(this, function(i,v){
				if(v.state === select) its[v.id] = v;
			});			
			break;
		case ':':
			switch(select){
			//TODO: Types of objects 3d, meshes, lights, cameras, stuff
			case 'all':
				iterchildren(this, function(i,v){
					its[v.id] = v;
				});
				break;
			case 'mesh':
				iterchildren(this, function(i,v){
					if (v instanceof THREE.Mesh) its[v.id] = v;
				});
				break;
			}
			break;
		}
		if(next !== false){
			itsnext =  this.select(next.select);
			switch (next.t){
			case 'and':
				arrayintersect(its, itsnext);
				break;
			case 'or':
				its = its.concat(itsnext);
				break;
			}
		}
	}
	return its;
}
