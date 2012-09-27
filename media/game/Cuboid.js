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
		var loader = new THREE.SceneLoader();
		//loader.convertUpAxis = true;
		loader.load(model, createCuboid)//, staticurl+'/'+opts.type+'/texts');
	};
	var createFaceCuboid = function(){
		var texture = THREE.ImageUtils.loadTexture(staticurl+'/texts/'+opts.text);
	    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
	    texture.repeat.set( opts.repeat[0], opts.repeat[1] );
		cub.show = new THREE.Mesh(
			    new THREE.CubeGeometry(opts.size[0], opts.size[1], opts.size[2]),
			    new THREE.MeshLambertMaterial({map:texture, ambient:0x444444}));
		cub.show.castShadow = true;
		cub.show.receiveShadow = true;
		cub.show.prnt = true;
		cub.show.class = 'floor'
		cub.show.position.z = opts.size[2]/2
		var cont = new THREE.Object3D();
		cont.add(cub.show);
		cub.show = cont;
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);
		cub.show.size = {x:opts.size[0], y:opts.size[1], z:opts.size[2]}
		cub.show.heightFromPos = opts.size[2] + cub.show.position.z
		cub.type = 'floor'
		cub.show.class = 'floor'
		opts.scene.add( cub.show );

	}
	
	function createCuboid(scene){
		cub.show = scene.scene
				
		var spos = scene.position;
		var cont = new THREE.Object3D()

		while(cub.show.children[0]){
			cub.show.children[0].size = {x:opts.size[0], y:opts.size[1], z:opts.size[2]}
			cont.add(cub.show.children[0]);
		}
		if(opts.repetition){
			var scont = new THREE.Object3D();
			for (var i=0; i<opts.repetition[0]; i++)
				for(var i=0; i<opts.repetition[1]; i++)
					scont.add(cont.clone())
			cont = scont;
		}
		cub.show = cont;
		opts.scene.add(cub.show);
		cub.show.size = {x:opts.size[0], y:opts.size[1], z:opts.size[2]}
		cub.show.class = opts.type;
		cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);	
		//opts.scene.add(cub.show)
		
	//	cub.show.position.set(opts.pos.x, opts.pos.y, opts.pos.z);	
		
		cub.show.animations = scene.animations;
		/*$.each(cub.show.animations, function(i,v){
			THREE.AnimationHandler.add(v)
			geometry.animations[i] = new THREE.Animation(v.node, v.data)
			geometry.animations[i].timeScale = 1;
		})*/
		
		if(opts.focus){
			cub.show.class = 'prota'
			var headPos = cub.show.position.clone();
			headPos.y += opts.size[1]
			opts.focus.lookAt(headPos); 
		}
		CUBOID.add(cub)
		$.each(scene.objects, function(j, v){
			v.prnt = true; 
			v.castShadow = true;
			v.receiveShadow = true;
			if(opts.focus) v.class = 'prota'
		});

		if(opts.actions) if(opts.actions.mousedown){
			CUBOID.createAction(opts.actions.mousedown, scene, cub)
			cub.update = function(){}
		}
		else{
			cub.update = function(){}
		}
		cub.actions.mousedown = function(){onMove=true};
		cub.actions.mouseup = function(){};
		cub.actions.mousemove = function(){}
	}
	
	if(opts.model) 
		createModelCuboid(staticurl+'/'+opts.type+'/'+opts.geometry);
	else createFaceCuboid();
	
	if(opts.type === 'floor') {
		cub.actions.mousedown = function(){onMove=true};
		cub.actions.mouseup = function(){onMove=false; shouldMove=false;};
		cub.actions.mousemove = function(){};
		
		cub.show.prnt = false;
		cub.update = function(){}
		CUBOID.add(cub)
	}
	
	return function(){return cub};
};

CUBOID.createAction = function(str, geometry, cub){
	var patt = /\-[a-z]+/
	var action = str.slice(0,str.search(patt))
	var type = str.slice(str.search(patt)+1)
	switch(action){
	/*case 'animate':
		var lastTimestamp = Date.now()
		cub.update = function(time){
			var frameTime = ( time - lastTimestamp ) * 0.001; // seconds
			cub.show.animations[0].update( frameTime );
			lastTimestamp = time;
			}
		break;*/
	}
}


CUBOID.event = function(type, obj3D){
	var cub = CUBOID.getByForm(obj3D.id);
	cub.actions[type]()
}

CUBOID.checkCollisions = function(obj){
	// Using a little trigonometry calculate a point in
	// space 1000 units in front of our character
	var deltaX =   Math.sin(obj.rotation.z);
	var deltaY = - Math.cos(obj.rotation.z);
	
	// Fire a ray from the centre point of our character to the
	// collision focus point
	var objectsh = scene.select(":mesh&&¬.prota");
	var objects = []
	$.each(objectsh, function(i,v){
		objects.push(v)
	})
	var npos1 = obj.position.clone();
	npos1.z += 0.5;
	var ray = new THREE.Ray(npos1,  new THREE.Vector3(deltaX, deltaY, 0));
	var npos2 = obj.position.clone()
	npos2.z += 5
	var ray2 = new THREE.Ray(npos2,  new THREE.Vector3(deltaX, deltaY, 0));
	var intersects = ray.intersectObjects( objects );
	var intersects2 = ray2.intersectObjects( objects );

	
	if(intersects.length)
		if(intersects[0].distance<=2) {
			return intersects[0];
		}
	if(intersects2.length)
		if(intersects2[0].distance<=2) {
			return intersects2[0];
		}
	return false
	
}

CUBOID.checkFall = function(obj){
	var objectsh = scene.select(":mesh&&¬.	prota");
	var objects = []
	$.each(objectsh, function(i,v){
		objects.push(v)
	})
	
	var deltaX =   Math.sin(obj.rotation.z);
	var deltaY = - Math.cos(obj.rotation.z);
	
	var npos1 = obj.position.clone();
	npos1.x += deltaX; npos1.y += deltaY;
	var ray = new THREE.Ray(npos1,  new THREE.Vector3(0, 0, -1));
	var npos2 = obj.position.clone()
	npos2.x += deltaX*1.5; npos2.y += deltaY*1.5;
	var ray2 = new THREE.Ray(npos2,  new THREE.Vector3(0, 0, -1));
	var intersects = ray.intersectObjects( objects );
	var intersects2 = ray2.intersectObjects( objects );

	if(intersects.length){
		if(intersects[0].distance > 0)	return intersects[0];
	}
	else if(intersects2.length){
		if(intersects2[0].distance>0) return intersects2[0];
	}
	else
		return false
	
}