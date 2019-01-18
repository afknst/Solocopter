"use strict";

// ****************************** //
//  Creation de la scène
// ****************************** //

const sceneGraph = new THREE.Scene();

// Creation d'une caméra Orthographique (correspondance simple entre la position de la souris et la position dans l'espace (x,y))
const camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,500);
camera.position.set(1,0,0);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer( { antialias: true,alpha:false } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor(0xeeeeee,1.0);

// Force la zone de rendu à être de taille carré
let canvasSize = Math.min(window.innerWidth, window.innerHeight);
renderer.setSize( canvasSize,canvasSize );

const baliseHtml = document.querySelector("#AffichageScene3D");
baliseHtml.appendChild(renderer.domElement);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0,0,1);
sceneGraph.add(spotLight);

// ****************************** //
//  Ajout de l'objet
// ****************************** //

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var inters = false ;

const radius = 0.25; // Rayon de la sphère
const geometry = new THREE.SphereGeometry( radius,32,32 );
const material = new THREE.MeshLambertMaterial( {color:0xaaffff} );
const object = new THREE.Mesh( geometry, material );
sceneGraph.add(object);

// ****************************** //
//  Fonctions de rappels évènementielles
// ****************************** //

// Bouton de la souris enclenché
const down = function(event){onMouseDown(event,sceneGraph)};
window.addEventListener('mousedown',down);

// Bouton de la souris relaché
const up = function(event){onMouseUp(event,sceneGraph)};
window.addEventListener('mouseup',up);

// Souris qui se déplace
const move = function(event){onMouseMove(event,sceneGraph)};
window.addEventListener('mousemove', move);

// Touche de clavier enfoncé
window.addEventListener('keydown', onKeyDown);

// Touche de clavier relaché
window.addEventListener('keyup', onKeyUp);

// Redimensionnement de la fenêtre
window.addEventListener('resize',onResize);
//window.requestAnimationFrame(render);


// ****************************** //
//  Rendu
// ****************************** //


function render(sceneGraph) {
  /*  raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( sceneGraph.children );
    console.log("length=",intersects.length);
    console.log("raycaster=",raycaster);
    if ( intersects.length > 0) {
      intersects[0].object.material.color.set(0xff0022);
      console.log("AtObject");
      inters = true ;
    }
    else if (inters == true) {
      object.material.color.set(0xaaffff);
      inters = false;
      console.log("inters=",inters);
    }  */
    renderer.render(sceneGraph, camera);
}

render(sceneGraph);





// Fonction appelée lors du clic de la souris
function onMouseDown(event,sceneGraph) {
    console.log('Mouse down');

    // Coordonnées du clic de souris en pixel
    const xPixel = event.clientX;
    const yPixel = event.clientY;

    // Conversion des coordonnées pixel en coordonnées relatives par rapport à la fenêtre (ici par rapport au canvas de rendu).
    // Les coordonnées sont comprises entre -1 et 1
    const x = 2*(xPixel/canvasSize)-1;
    const y = 1-2*(yPixel/canvasSize);


    // Recherche si le clic est à l'intérieur ou non de la sphère
    if ( x*x+y*y < radius*radius ) {

        object.material.color.set(0xff0000);

    }

    // MAJ de l'image
    render(sceneGraph);

}

// Fonction appelée lors du relachement de la souris
function onMouseUp(event,sceneGraph) {
    console.log('Mouse up');

    object.material.color.set(0xaaffff);
    render(sceneGraph);
}

// Fonction appelée lors du déplacement de la souris
function onMouseMove(event,sceneGraph) {
    mouse.x = (event.clientX/canvasSize)*2-1;
    mouse.y = -(event.clientY/canvasSize)*2+1;

    //event.preventDefault();
    raycaster.setFromCamera( mouse, camera);
    var intersects = raycaster.intersectObjects( sceneGraph.children );
    if ( intersects.length > 0) {
      intersects[0].object.material.color.set(0x000000);
      console.log(intersects[0].point);
      inters = true ;
    }
    else if (inters == true) {
      object.material.color.set(0xaaffff);
      inters = false;
    }

    render(sceneGraph);
}

// Fonction appelée lors de l'appuis sur une touche du clavier
function onKeyDown(event) {
    const keyCode = event.code;
    console.log("Touche ",keyCode," enfoncé");
}

// Fonction appelée lors du relachement d'une touche du clavier
function onKeyUp(event) {
	const keyCode = event.code;
	console.log("Touche ",keyCode," relaché");
}

// Fonction appelée lors du redimmensionnement de la fenetre
function onResize(event) {

    // On force toujours le canvas à être carré
    canvasSize = Math.min(window.innerWidth, window.innerHeight);
    renderer.setSize( canvasSize,canvasSize );
}
