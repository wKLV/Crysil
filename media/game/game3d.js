staticurl = '/static';
var pj, onMove=false, domEvent, projector = new THREE.Projector;
$(document).ready(function(){
	var renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( document.body.clientWidth, document.body.clientHeight );
	document.body.appendChild(renderer.domElement);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
    renderer.clear();
    //renderer.shadowMapEnabled = true;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
	    35,         // Field of view
	    800 / 640,  // Aspect ratio
	    .1,         // Near
	    10000       // Far
	);
	camera.position.set(0, 34, -30);
	scene.add(camera);
	var objects = [];

	$.getJSON(staticurl+'/maps/map3d.json', function(data){
		var floors = data.floor, entities = data.entity, actors = data.actors,
		ambientlight = data.ambientlight, directionallight = data.directionallight,
		spotlights = data.spotlights;
		
		$.each(floors, function(i,v){
			CUBOID.create({model:false, objects:objects, scene:scene, type:'floor', 
				text:v.tile, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), size:v.size})
		});
		
		$.each(entities, function(i,v){
			CUBOID.create({model:true, objects:objects, scene:scene, type:'entity', 
				geometry:v.geometry, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), size:v.size})
		});
		
		$.each(actors, function(i,v){
			if(v.focus) v.focus = camera
			var obj= CUBOID.create({model:true, objects:objects, scene:scene, type:'actor', 
				geometry:v.geometry, pos:new THREE.Vector3(v.pos[0],v.pos[1],v.pos[2]), 
				size:v.size, focus:v.focus})
			if(v.focus) pj = obj
		});
		
		ambientlight = new THREE.AmbientLight(ambientlight.color);
		scene.add(ambientlight);
			
		var pos = directionallight.direction;
		directionallight = new THREE.DirectionalLight(directionallight.color);
		directionallight.position.set(pos[0], pos[1], pos[2]);
		scene.add(directionallight);
		
	});
//	var floor = CUBOID.create({model:false, objects:objects, scene:scene, type:'floor', text:'t.jpg', pos:new THREE.Vector3(0,0,0), size:{x:25,y:0.1,z:50}})

	/*var light = new THREE.DirectionalLight( 0xFFFFFF );
	light.position.set( 0, 17, -15 );
	//light.castShadow = true;
	
	var olight = new THREE.AmbientLight(0xFFFFFF);
	
	scene.add( light );
	scene.add(olight);
	
	domEvent = new THREEx.DomEvent(camera, document.body)
	
	var objects = [];
	
	var actorsecundariobob = CUBOID.create({model:true, objects:objects, scene:scene, type:'actor', geometry:'centinela.js', pos:new THREE.Vector3()});
	var cubo = CUBOID.create({model:true, objects:objects, scene:scene, type:'entity', geometry:'cubo2.js', pos:new THREE.Vector3(-2,0, -4)})
	var puerta = CUBOID.create({model:true, objects:objects, scene:scene, type:'entity', geometry:'puerta2.js', pos:new THREE.Vector3(-10,0, 10)})

	pj = CUBOID.create({model:true, objects:objects, scene:scene, type:'actor', geometry:'prota.js', pos:new THREE.Vector3(1,0,2), focus:camera})
	*/
	mousePos = {x:0,y:0};
	$(document).mousemove(function(e){ 
		mousePos.x = e.pageX;
		mousePos.y = e.pageY;
	});
	THREEx.WindowResize(renderer, camera);
	var render = function(){
		 renderer.render(scene, camera);
		 requestAnimationFrame(render);
		 
		 if(onMove) moveCharToMouse()
	}
	render();
	$(document).mousedown(onDocumentEvent('mousedown'));
	$(document).mouseup(onDocumentEvent('mouseup'));
	$(document).mousemove(onDocumentEvent('mousemove'));
	
function onDocumentEvent(type) {return function( event ) {
		event.preventDefault();
	    if(type === 'mouseup') onMove= false
	    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );	    
	    var ray = projector.pickingRay(vector.clone(), camera);
	    var intersects = ray.intersectObjects( objects );

	    if ( intersects.length > 0 ){
	    	if (intersects[0].object.prnt)
	    		CUBOID.event(type, intersects[0].object.parent)
	        else
	        	CUBOID.event(type, intersects[0].object)
	    }
	}}; 
});
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
	pjj.translateX((pjPos.x-mousePos.x)/1000); pjj.translateZ((pjPos.y-mousePos.y)/1000);
//	pjj.rotation.y = Math.atan((pjPos.y-mousePos.y)/(pjPos.x-mousePos.x))
}