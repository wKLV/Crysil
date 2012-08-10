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
		var loader = new THREE.ColladaLoader();
		loader.convertUpAxis = true;
		loader.load(model, createCuboid)//, staticurl+'/'+opts.type+'/texts');
	};
	var createFaceCuboid = function(){
		var texture = THREE.ImageUtils.loadTexture(staticurl+'/texts/'+opts.text);
	    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
		cub.show = new THREE.Mesh(
			    new THREE.CubeGeometry(opts.size[0], opts.size[1], opts.size[2]),
			    new THREE.MeshLambertMaterial({map:texture, ambient:0x444444}));
		opts.scene.add( cub.show );
		cub.show.castShadow = true;
		cub.show.receiveShadow = true;
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);
		cub.type = 'floor'
	}
	
	function createCuboid(geometry){
		var dae = geometry.scene;
		var skin = geometry.skins[0];
		dae.rotation.x = -Math.PI/2
		dae.updateMatrix();
		cub.show = dae
		
		//cub.show = THREE.SceneUtils.createMultiMaterialObject(geometry,geometry.materials)
		
		cub.show.size = opts.size
			
		opts.scene.add(cub.show)
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);	
		
		cub.show.animations = geometry.animations;
		$.each(cub.show.animations, function(i,v){
			THREE.AnimationHandler.add(v)
			geometry.animations[i] = new THREE.Animation(v.node, v.data)
			geometry.animations[i].timeScale = 1;
		})
		
		if(opts.focus){
			opts.focus.lookAt(cub.show.position); 
		}
		CUBOID.add(cub)
		for (i in cub.show.children){ 
			cub.show.children[i].prnt = true; 
			opts.objects.push(cub.show.children[i])
			cub.show.children[i].castShadow = true;
			cub.show.children[i].receiveShadow = true;
		}

		if(opts.actions.mousedown)
			CUBOID.createAction(opts.actions.mousedown, geometry, cub)
		else{
			cub.update = function(){}
		}
		cub.actions.mousedown = function(){alert('TADA!')};
		cub.actions.mouseup = function(){};
		cub.actions.mousemove = function(){}
	}
	
	if(opts.model) createModelCuboid(staticurl+'/'+opts.type+'/'+opts.geometry);
	else createFaceCuboid();
	
	if(opts.type === 'floor') {
		cub.actions.mousedown = function(){onMove=true};
		cub.actions.mouseup = function(){onMove=false};
		cub.actions.mousemove = function(){};
		
		cub.show.prnt = false
		cub.update = function(){}
		CUBOID.add(cub)
		opts.objects.push(cub.show)
	}
	
	return function(){return cub};
};

CUBOID.createAction = function(str, geometry, cub){
	var patt = /\-[a-z]+/
	var action = str.slice(0,str.search(patt))
	var type = str.slice(str.search(patt)+1)
	switch(action){
	case 'animate':
		var lastTimestamp = Date.now()
		cub.update = function(time){
			var frameTime = ( time - lastTimestamp ) * 0.001; // seconds
			cub.show.animations[0].update( frameTime );
			lastTimestamp = time;
			}
		break;
	}
}


CUBOID.event = function(type, obj3D){
	var cub = CUBOID.getByForm(obj3D.id);
	cub.actions[type]()
}

CUBOID.checkCollisions = function(obj){
	// Using a little trigonometry calculate a point in
	// space 1000 units in front of our character
	var deltaX = Math.floor(Math.sin(obj.rotation.y));
	var deltaZ = Math.floor(Math.cos(obj.rotation.y));

	// Fire a ray from the centre point of our character to the
	// collision focus point
	var npos1 = obj.position.clone();
	npos1.y += 0.5;
	var ray = new THREE.Ray(npos1,  new THREE.Vector3(deltaX, 0, deltaZ));
	var npos2 = obj.position.clone()
	npos2.y += 5
	var ray2 = new THREE.Ray(npos2,  new THREE.Vector3(deltaX, 0, deltaZ));
	var intersects = ray.intersectObjects( objects );
	var intersects2 = ray2.intersectObjects( objects );

	
	if(intersects.length)
		if(intersects[0].distance<=1){
			obj.position.x -= deltaX; camera.position.x -= deltaX;
			obj.position.z -= deltaZ; camera.position.z -= deltaZ;
			return true;
		}
	if(intersects2.length)
		if(intersects2[0].distance<=1) {
			obj.position.x -= deltaX; camera.position.x -= deltaX;
			obj.position.z -= deltaZ; camera.position.z -= deltaZ;
			return true;
		}
	
}