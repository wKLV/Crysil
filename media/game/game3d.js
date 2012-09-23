staticurl = '/static';
var pj, onMove=false, domEvent, projector = new THREE.Projector, objects = [], 
mouseClickPos, animations = [], animHandler = THREE.AnimationHandler, collisions;
;
$(document).ready(function(){
	var renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( document.body.clientWidth, document.body.clientHeight );
	document.body.appendChild(renderer.domElement);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
    renderer.clear();
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	document.body.appendChild( stats.domElement );
	
	$(document).add($('<div style="position:absolute; bottom:80px; id="coll"/>'))
    
	Physijs.scripts.worker = staticurl+'/game/physijs_worker.js';
	Physijs.scripts.ammo = staticurl+'/game/ammo.js';
	
	scene = new THREE.Scene;

	camera = new THREE.PerspectiveCamera(
	    35,         // Field of view
	    800 / 640,  // Aspect ratio
	    .1,         // Near
	    10000       // Far
	);
	camera.position.set(0,-26 , 34);
	scene.add(camera);

	$.getJSON(staticurl+'/maps/map3d.json', function(data){
		var floors = data.floor, entities = data.entity, actors = data.actors,
		ambientlight = data.ambientlight, directionallight = data.directionallight,
		spotlights = data.spotlights;
		
		$.each(floors, function(i,v){
			CUBOID.create({model:false, objects:objects, scene:scene, type:'floor', 
				text:v.tile, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), size:v.size, repeat:v.repetition})
		});
		
		$.each(entities, function(i,v){
			CUBOID.create({model:true, objects:objects, scene:scene, type:'entity', 
				geometry:v.geometry, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), 
				size:v.size, actions:v.actions})
		});
		
		$.each(actors, function(i,v){
			if(v.focus) v.focus = camera
			var obj = CUBOID.create({model:true, objects:objects, scene:scene, type:'actor', 
				geometry:v.geometry, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), 
				size:v.size, focus:v.focus, actions:v.actions})
			if(v.focus) pj = obj
		});
		
		//ambientlight = new THREE.AmbientLight(ambientlight.color);
		//scene.add(ambientlight);
			
		var pos = directionallight.direction;
		directionallight = new THREE.DirectionalLight(directionallight.color, 1.5);
		directionallight.position.set(pos[0], pos[1], pos[2]);
		scene.add(directionallight);
		directionallight.castShadow = true;
		directionallight.shadowDarkness = 0.5;
		directionallight.shadowCameraLeft = -60;
		directionallight.shadowCameraTop = -60;
		directionallight.shadowCameraRight = 60;
		directionallight.shadowCameraBottom = 60;
		directionallight.shadowCameraNear = 1;
		directionallight.shadowCameraFar = 500;
		directionallight.shadowBias = -.001
		directionallight.shadowMapWidth = directionallight.shadowMapHeight = 2048;
		directionallight.shadowDarkness = .7;
		
	});
	mousePos = {x:0,y:0};
	$(document).mousemove(function(e){ 
		mousePos.x = e.pageX;
		mousePos.y = e.pageY;
	});
	THREEx.WindowResize(renderer, camera);

	var render = function(time){
		$.each(CUBOID.list, function(i, cub){
			cub.update(time)
		});
		
		if(pj){ if(pj().show.children){
			var pjj = pj().show;
			if(CUBOID.checkCollisions(pjj)){
				//onMove= false
			}
		}}
		renderer.render(scene, camera);
		stats.update()
		if(onMove) moveCharToMouse()
		
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

	$(document).mousedown(onDocumentEvent('mousedown'));
	$(document).mouseup(onDocumentEvent('mouseup'));
	$(document).mousemove(onDocumentEvent('mousemove'));
});

function onDocumentEvent(type) {return function( event) {
		event.preventDefault();
	    if(type === 'mouseup') onMove= false
	    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );	    
	    var ray = projector.pickingRay(vector.clone(), camera);
	    var objectsh, objects = [], intersects;
	    if(onMove)
	    	objectsh = scene.select(":mesh&&.floor");
	    else
	    	objectsh = scene.select(":mesh");
	    $.each(objectsh, function(i,v){
	    	objects.push(v)
	    });
	    intersects = ray.intersectObjects( objects );   
	    
	    if ( intersects.length > 0 ) {
		    mouseClickPos = intersects[0].point;
	    	if (intersects[0].object.prnt)
	    		CUBOID.event(type, intersects[0].object.parent)
	        else
	        	CUBOID.event(type, intersects[0].object)
	    }
	}}; 
	


function toScreenXY ( position, camera, jqdiv ) {
    var pos = position.clone();
    projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
    projScreenMat.multiplyVector3( pos );

    return { x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
         y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top };
}
function moveCharToMouse(){
	var pjj = pj().show
	var pjPos = toScreenXY(new THREE.Vector3(pjj.position.x,pjj.position.y, pjj.position.z), camera, $(document.body));
	
	
	var y = mouseClickPos.y - pjj.position.y, x = mouseClickPos.x - pjj.position.x
	//if(Math.sqrt(x^2+y^2)<=0.00001) {onMove = false; return;}
	pjj.rotation.z = Math.atan2(y, x) + Math.PI/2
	pjj.rotation.x = 0;
	pjj.rotation.y = 0;
	
	pjj.position.x -= (pjPos.x-mousePos.x)/1000;
	pjj.position.y += (pjPos.y-mousePos.y)/1000;
	
	mouseClickPos.x -= (pjPos.x-mousePos.x)/1000;
	mouseClickPos.y += (pjPos.y-mousePos.y)/1000;
	
	camera.position.x -= (pjPos.x-mousePos.x)/1000;
	camera.position.y += (pjPos.y-mousePos.y)/1000;
}
