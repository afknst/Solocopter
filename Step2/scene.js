"use strict";


main();

function main() {

    const sceneThreeJs = {
        sceneGraph: null,
        camera: null,
        renderer: null,
        controls: null,
        N : 6,
        R : 2,
    };

    const pickingData = {
        enabled: false,           // Mode picking en cours ou désactivé (CTRL enfoncé)
        enableDragAndDrop: false, // Drag and drop en cours ou désactivé
        selectableObjects: [],    // Les objets selectionnables par picking
        selectedObject: null,     // L'objet actuellement selectionné
        selectedPlane: {p:null,n:null}, // Le plan de la caméra au moment de la selection. Plan donné par une position p, et une normale n.

        // Les représentations visuelles associées au picking
        visualRepresentation: {
            sphereSelection:null,    // Une sphère montrant le point d'intersection au moment du picking
            sphereTranslation: null, // Une sphère montrant l'état actuel de la translation
        },
    }


    initEmptyScene(sceneThreeJs);
    init3DObjects(sceneThreeJs.sceneGraph,pickingData,sceneThreeJs.N,sceneThreeJs.R);

    const raycaster = new THREE.Raycaster();
    const screenSize = {
        w:sceneThreeJs.renderer.domElement.clientWidth,
        h:sceneThreeJs.renderer.domElement.clientHeight
    };

    const wrapperMouseDown = function(event) { onMouseDown(event,raycaster,pickingData,screenSize,sceneThreeJs.camera); };
    document.addEventListener( 'mousedown', wrapperMouseDown );

    const wrapperMouseUp = function(event) { onMouseUp(event,pickingData); };
    document.addEventListener( 'mouseup', wrapperMouseUp );

    // Fonction à appeler lors du déplacement de la souris: translation de l'objet selectionné
    const wrapperMouseMove = function(event) { onMouseMove(event, pickingData, screenSize, sceneThreeJs) };
    document.addEventListener( 'mousemove', wrapperMouseMove );

    // Fonction de rappels pour le clavier: activation/désactivation du picking par CTRL
    const wrapperKeyDown = function(event) { onKeyDown(event,pickingData,sceneThreeJs.controls); };
    const wrapperKeyUp = function(event) { onKeyUp(event,pickingData,sceneThreeJs.controls); };
    document.addEventListener( 'keydown', wrapperKeyDown );
    document.addEventListener( 'keyup', wrapperKeyUp );

    animationLoop(sceneThreeJs);
}

// Initialise les objets composant la scène 3D
function init3DObjects(sceneGraph,pickingData,N,R) {

    //const elementsToAdd = [];
    const Frames = [];
    const Surface = [];

    var angle=2*Math.PI/N;
    var L = R / Math.cos(angle/2);

    for (var i=0; i<N; i++) {
      var framegeometry = primitive.Cylinder(Vector3(0,0,0),Vector3(R*Math.cos(i*angle),R*Math.sin(i*angle),0),0.05);
      var frame = new THREE.Mesh(framegeometry,MaterialRGB(0.8,0,0));
      frame.name = "frame" + i;
      Frames.push(frame);

      var surface1geometry = primitive.Triangle(Vector3(0,0,0),Vector3(R*Math.cos(i*angle),R*Math.sin(i*angle),0),Vector3(L*Math.cos(i*angle-angle/2),L*Math.sin(i*angle-angle/2),0));
      var surface1 = new THREE.Mesh(surface1geometry,MaterialRGB(0.8,0.8,0));
      surface1.traverse( function( node ) {
        if( node.material ) {
            node.material.side = THREE.DoubleSide;
          }
        });
        surface1.name = "surface"+i+"1";
        Surface.push(surface1);

        var surface2geometry = primitive.Triangle(Vector3(0,0,0),Vector3(R*Math.cos(i*angle),R*Math.sin(i*angle),0),Vector3(L*Math.cos(i*angle+angle/2),L*Math.sin(i*angle+angle/2),0));
        var surface2 = new THREE.Mesh(surface2geometry,MaterialRGB(0.8,0.8,0));
        surface2.traverse( function( node ) {
          if( node.material ) {
              node.material.side = THREE.DoubleSide;
            }
          });
          surface2.name = "surface"+i+"2";
          Surface.push(surface2);

    }

    var pointgeometry = primitive.Sphere(Vector3(0,0,0),0.1);
    var point = new THREE.Mesh(pointgeometry,MaterialRGB(0.8,0.1,0));
    point.name = "point";
    Frames.push(point);
    sceneGraph.add(point);
    pickingData.selectableObjects.push(point);


    for( const k in Frames ) {
        const element = Frames[k];
    //    element.castShadow = true;
    //    element.receiveShadow = true;
        sceneGraph.add(element);
    //    pickingData.selectableObjects.push(element);
    }


    for( const k in Surface ) {
        const element = Surface[k];
    //    element.castShadow = true;
    //    element.receiveShadow = true;
        sceneGraph.add(element);
    }


    const sphereSelection = new THREE.Mesh(primitive.Sphere(Vector3(0,0,0),0.015),MaterialRGB(1,0,0) );
    sphereSelection.name = "sphereSelection";
    sphereSelection.visible = false;
    sceneGraph.add(sphereSelection);
    pickingData.visualRepresentation.sphereSelection = sphereSelection;

    // *********************** //
    /// Une sphère montrant la position après translation
    // *********************** //
    const sphereTranslation = new THREE.Mesh(primitive.Sphere(Vector3(0,0,0),0.015),MaterialRGB(0,1,0) );
    sphereTranslation.name = "sphereTranslation";
    sphereTranslation.visible = false;
    sceneGraph.add(sphereTranslation);
    pickingData.visualRepresentation.sphereTranslation = sphereTranslation;

}



function onKeyDown(event, pickingData, orbitControl) {

    const ctrlPressed = event.ctrlKey;

    // Relachement de ctrl : activation du mode picking
    if ( ctrlPressed ) {
        pickingData.enabled = true;
        orbitControl.enabled = false;
    }

}

function onKeyUp(event, pickingData, orbitControl) {

    const ctrlPressed = event.ctrlKey;

    // Relachement de ctrl : fin du picking actuel
    if ( ctrlPressed===false ) {
        pickingData.enabled = false;
        pickingData.enableDragAndDrop = false;
        orbitControl.enabled = true;
        pickingData.selectedObject = null;
        pickingData.visualRepresentation.sphereSelection.visible = false;
        pickingData.visualRepresentation.sphereTranslation.visible = false;
    }

}



function onMouseDown(event,raycaster,pickingData,screenSize,camera) {

	// Gestion du picking
    if( pickingData.enabled===true ) { // activation si la touche CTRL est enfoncée

        // Coordonnées du clic de souris
        const xPixel = event.clientX;
        const yPixel = event.clientY;

        const x =  2*xPixel/screenSize.w-1;
        const y = -2*yPixel/screenSize.h+1;

        // Calcul d'un rayon passant par le point (x,y)
        //  c.a.d la direction formé par les points p de l'espace tels que leurs projections sur l'écran par la caméra courante soit (x,y).
        raycaster.setFromCamera(new THREE.Vector2(x,y),camera);

        // Calcul des interections entre le rayon et les objets passés en paramètres
        const intersects = raycaster.intersectObjects( pickingData.selectableObjects );

        const nbrIntersection = intersects.length;
        if( nbrIntersection>0 ) {

            // Les intersections sont classés par distance le long du rayon. On ne considère que la première.
            const intersection = intersects[0];

            // Sauvegarde des données du picking
            pickingData.selectedObject = intersection.object; // objet selectionné
            pickingData.selectedPlane.p = intersection.point.clone(); // coordonnées du point d'intersection 3D
            pickingData.selectedPlane.n = camera.getWorldDirection().clone(); // normale du plan de la caméra

            // Affichage de la selection
            const sphereSelection = pickingData.visualRepresentation.sphereSelection;
            sphereSelection.position.copy( pickingData.selectedPlane.p );
            sphereSelection.visible = true;
            pickingData.enableDragAndDrop = true;

        }
    }

}


function onMouseUp(event,pickingData) {
    pickingData.enableDragAndDrop = false;
}

function onMouseMove( event, pickingData, screenSize, sceneThreeJs ) {

	// Gestion du drag & drop
    if( pickingData.enableDragAndDrop===true) {

		// Coordonnées de la position de la souris
        const xPixel = event.clientX;
        const yPixel = event.clientY;

        const x =  2*xPixel/screenSize.w-1;
        const y = -2*yPixel/screenSize.h+1;

        // Projection inverse passant du point 2D sur l'écran à un point 3D
        const selectedPoint = Vector3(x, y, 0.5 /*valeur de z après projection*/ );
        selectedPoint.unproject( sceneThreeJs.camera );

        // Direction du rayon passant par le point selectionné
        const p0 = sceneThreeJs.camera.position;
        const d = selectedPoint.clone().sub( p0 );

        // Intersection entre le rayon 3D et le plan de la camera
        const p = pickingData.selectedPlane.p;
        const n = pickingData.selectedPlane.n;
        // tI = <p-p0,n> / <d,n>
        const tI = ( (p.clone().sub(p0)).dot(n) ) / ( d.dot(n) );
        // pI = p0 + tI d
        const pI = (d.clone().multiplyScalar(tI)).add(p0); // le point d'intersection

        // Translation à appliquer
        const translation = pI.clone().sub( p );


        const Frames = [];
        const Surface = [];


        var angle=2*Math.PI/sceneThreeJs.N;
        var r=Math.sqrt(pI.x*pI.x+pI.y*pI.y+pI.z*pI.z);
        var L = sceneThreeJs.R / Math.cos(angle/2);


        for (var i=0; i<sceneThreeJs.N; i++) {
          sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName("frame"+i));
          sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName("surface"+i+"1"));
          sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName("surface"+i+"2"));
          sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName("point"));
        }

        var x0 = pI.x;
        var y0 = pI.y;
        var z0 = pI.z;

        var pointgeometry = primitive.Sphere(Vector3(0,0,z0),0.1);
        var point = new THREE.Mesh(pointgeometry,MaterialRGB(0.8,0.1,0));
        point.name = "point";
        Frames.push(point);
        sceneThreeJs.sceneGraph.add(point);
        pickingData.selectableObjects.push(point);

        for (var i=0; i<sceneThreeJs.N; i++) {
          var framegeometry = primitive.Cylinder(Vector3(0,0,z0),Vector3(sceneThreeJs.R*Math.cos(i*angle),sceneThreeJs.R*Math.sin(i*angle),0),0.05);
          var frame = new THREE.Mesh(framegeometry,MaterialRGB(0.8,0,0));
          frame.name = "frame" + i;
          Frames.push(frame);

          var surface1geometry = primitive.Triangle(Vector3(0,0,z0),Vector3(sceneThreeJs.R*Math.cos(i*angle),sceneThreeJs.R*Math.sin(i*angle),0),Vector3(L*Math.cos(i*angle-angle/2),L*Math.sin(i*angle-angle/2),0));
          var surface1 = new THREE.Mesh(surface1geometry,MaterialRGB(0.8,0.8,0));
          surface1.traverse( function( node ) {
            if( node.material ) {
                node.material.side = THREE.DoubleSide;
              }
            });
            surface1.name = "surface"+i+"1";
            Surface.push(surface1);

            var surface2geometry = primitive.Triangle(Vector3(0,0,z0),Vector3(sceneThreeJs.R*Math.cos(i*angle),sceneThreeJs.R*Math.sin(i*angle),0),Vector3(L*Math.cos(i*angle+angle/2),L*Math.sin(i*angle+angle/2),0));
            var surface2 = new THREE.Mesh(surface2geometry,MaterialRGB(0.8,0.8,0));
            surface2.traverse( function( node ) {
              if( node.material ) {
                  node.material.side = THREE.DoubleSide;
                }
              });
              surface2.name = "surface"+i+"2";
              Surface.push(surface2);

        }


        for( const k in Frames ) {
            const element = Frames[k];
      //      element.castShadow = true;
      //      element.receiveShadow = true;
            sceneThreeJs.sceneGraph.add(element);
            pickingData.selectableObjects.push(element);
        }


        for( const k in Surface ) {
            const element = Surface[k];
      //      element.castShadow = true;
      //      element.receiveShadow = true;
            sceneThreeJs.sceneGraph.add(element);
        }



          pickingData.visualRepresentation.sphereTranslation.visible = true;
          pickingData.visualRepresentation.sphereTranslation.position.copy(p);



    /*    var sketchgeometry = primitive.Cylinder(Vector3(0,0,0),Vector3(pI.x,pI.y,pI.z),0.1);
        var sketchtoadd = new THREE.Mesh(sketchgeometry,MaterialRGB(0.8,0,0));
        sketchtoadd.name = "sketchtoadd";
      //  sketch.push(sketchtoadd);
        sketchtoadd.castShadow = true;
        sketchtoadd.receiveShadow = true;
        sceneThreeJs.sceneGraph.add(sketchtoadd);
        pickingData.selectableObjects.push(sketchtoadd); */




    }

}


// Demande le rendu de la scène 3D
function render( sceneThreeJs ) {
    sceneThreeJs.renderer.render(sceneThreeJs.sceneGraph, sceneThreeJs.camera);
}

function animate(sceneThreeJs, time) {

    const t = time/1000;//time in second
/*
    const cube = sceneThreeJs.sceneGraph.getObjectByName("cube");
    cube.position.set( Math.sin(3*t),0,0 );

    const cylinder = sceneThreeJs.sceneGraph.getObjectByName("cylinder");
    // Rotation du cylinder
    cylinder.setRotationFromAxisAngle(Vector3(0,0,1),Math.PI*t); // rotation de l'objet
    cylinder.position.set(0,1.5,2); // placement de l'objet à sa position dans l'espace

    const cylinder2 = sceneThreeJs.sceneGraph.getObjectByName("cylinder2");
    cylinder2.position.set(0,0,0);
    cylinder2.setRotationFromAxisAngle(Vector3(0,0,1),3*Math.PI*t);
    cylinder2.position.set(0,1,0.25);
*/
    render(sceneThreeJs);
}






// Fonction d'initialisation d'une scène 3D sans objets 3D
//  Création d'un graphe de scène et ajout d'une caméra et d'une lumière.
//  Création d'un moteur de rendu et ajout dans le document HTML
function initEmptyScene(sceneThreeJs) {

    sceneThreeJs.sceneGraph = new THREE.Scene();

    sceneThreeJs.camera = sceneInit.createCamera(0,1,8);
    sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph);
    sceneInit.insertLight(sceneThreeJs.sceneGraph,Vector3(-3,5,1));
    sceneInit.insertLight(sceneThreeJs.sceneGraph,Vector3(3,-5,-1));

    sceneThreeJs.renderer = sceneInit.createRenderer();
    sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement);

    sceneThreeJs.controls = new THREE.OrbitControls( sceneThreeJs.camera );

    window.addEventListener('resize', function(event){onResize(sceneThreeJs);},false );
}

// Fonction de gestion d'animation
function animationLoop(sceneThreeJs) {

    // Fonction JavaScript de demande d'image courante à afficher
    requestAnimationFrame(

        // La fonction (dite de callback) recoit en paramètre le temps courant
        function(timeStamp){
            animate(sceneThreeJs,timeStamp); // appel de notre fonction d'animation
            animationLoop(sceneThreeJs); // relance une nouvelle demande de mise à jour
        }

     );

}

// Fonction appelée lors du redimensionnement de la fenetre
function onResize(sceneThreeJs) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneThreeJs.camera.aspect = width / height;
    sceneThreeJs.camera.updateProjectionMatrix();

    sceneThreeJs.renderer.setSize(width, height);
}

function Vector3(x,y,z) {
    return new THREE.Vector3(x,y,z);
}

function MaterialRGB(r,g,b) {
    const c = new THREE.Color(r,g,b);
    return new THREE.MeshLambertMaterial( {color:c} );
}
