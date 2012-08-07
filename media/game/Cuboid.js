var CUBOID = {}

CUBOID.list = [];
CUBOID.forms = {};

CUBOID.add = function(cub){
	var i = CUBOID.list.push(cub)
	CUBOID.forms[cub.show.id] = i-1;
	return this;
}
CUBOID.getByForm = function(form){
	return CUBOID.list[CUBOID.forms[form]];
}

CUBOID.create = function(opts){
	var cub = {show:{}, actions:{}}
	
	var createModelCuboid = function(model){
		var loader = new THREE.JSONLoader();
		loader.load(model, createCuboid, staticurl+'/'+opts.type+'/texts');
	};
	var createFaceCuboid = function(){
		var texture = THREE.ImageUtils.loadTexture(staticurl+'/texts/'+opts.text);
	    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
		cub.show = new THREE.Mesh(
			    new THREE.CubeGeometry(opts.size[0], opts.size[1], opts.size[2]),
			    new THREE.MeshLambertMaterial({map:texture})
			);
		opts.scene.add( cub.show );
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);
	}
	
	function createCuboid(geometry){
		//var object = tQuery.createCube().addTo(opts.world);
		cub.show = THREE.SceneUtils.createMultiMaterialObject(geometry,geometry.materials)
		//cub.show.castShadow = true;
		//cub.show.receiveShadow = true;
		opts.scene.add(cub.show)
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);	
		if(opts.focus){ opts.focus.lookAt(cub.show.position); cub.show.add(opts.focus);} 
		CUBOID.add(cub)
		for (i in cub.show.children){ 
			cub.show.children[i].prnt = true; 
			opts.objects.push(cub.show.children[i])
		}
		
		cub.actions.mousedown = function(){alert('TADA!')};
		cub.actions.mouseup = function(){alert('PACHIN!')};
		cub.actions.mousemove = function(){alert('aha')}
	}
	
	if(opts.model) createModelCuboid(staticurl+'/'+opts.type+'/'+opts.geometry);
	else createFaceCuboid();
	
	if(opts.type === 'floor') {
		cub.actions.mousedown = function(){onMove=true};
		cub.actions.mouseup = function(){onMove=false};
		cub.actions.mousemove = function(){};
		
		cub.show.prnt = false
		CUBOID.add(cub)
		opts.objects.push(cub.show)
	}
	
	return function(){return cub};
};

CUBOID.event = function(type, obj3D){
	var cub = CUBOID.getByForm(obj3D.id);
	cub.actions[type]()
}