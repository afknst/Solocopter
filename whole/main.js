/* global THREE sceneThreeJs pickingData raycaster screenSize mousePosition render sceneInit Vector3 globalVar primitive MaterialRGB angle remove update1 update2 */
'use strict'

main()

function main () {
  init1()
  // init2()

  window.addEventListener('mousedown', onMouseDown)

  window.addEventListener('mouseup', onMouseUp)

  window.addEventListener('mousemove', onMouseMove)

  window.addEventListener('resize', onResize)
}

function init1 () {
  sceneThreeJs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
  sceneThreeJs.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  sceneThreeJs.renderer.setPixelRatio(window.devicePixelRatio)
  sceneThreeJs.renderer.setClearColor(0xeeeeee, 1.0)
  sceneThreeJs.renderer.setSize(screenSize.m)
  sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement)
  sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph)
  sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(0, 0, 10))

  update1(0.2, 0.2)
  render()
}

function init2 () {
  sceneThreeJs.renderer = sceneInit.createRenderer()
  sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement)
  sceneThreeJs.camera = sceneInit.createCamera(0, 1, 8)
  sceneThreeJs.controls = new THREE.OrbitControls(sceneThreeJs.camera)
  // sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(-3, 5, 1))
  // sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(3, -5, -1))
  // const elementsToAdd = [];
  const Frames = []
  const Surface = []

  const N = globalVar.n
  const R = globalVar.r
  const sceneGraph = sceneThreeJs.sceneGraph

  var angle = 2 * Math.PI / N
  var L = R / Math.cos(angle / 2)

  for (var i = 0; i < N; i++) {
    var framegeometry = primitive.Cylinder(Vector3(0, 0, 0), Vector3(R * Math.cos(i * angle), R * Math.sin(i * angle), 0), 0.05)
    var frame = new THREE.Mesh(framegeometry, MaterialRGB(0.8, 0, 0))
    frame.name = 'frame' + i
    Frames.push(frame)

    var surface1geometry = primitive.Triangle(Vector3(0, 0, 0), Vector3(R * Math.cos(i * angle), R * Math.sin(i * angle), 0), Vector3(L * Math.cos(i * angle - angle / 2), L * Math.sin(i * angle - angle / 2), 0))
    var surface1 = new THREE.Mesh(surface1geometry, MaterialRGB(0.8, 0.8, 0))
    surface1.traverse(function (node) {
      if (node.material) {
        node.material.side = THREE.DoubleSide
      }
    })
    surface1.name = 'surface' + i + '1'
    Surface.push(surface1)

    var surface2geometry = primitive.Triangle(Vector3(0, 0, 0), Vector3(R * Math.cos(i * angle), R * Math.sin(i * angle), 0), Vector3(L * Math.cos(i * angle + angle / 2), L * Math.sin(i * angle + angle / 2), 0))
    var surface2 = new THREE.Mesh(surface2geometry, MaterialRGB(0.8, 0.8, 0))
    surface2.traverse(function (node) {
      if (node.material) {
        node.material.side = THREE.DoubleSide
      }
    })
    surface2.name = 'surface' + i + '2'
    Surface.push(surface2)
  }

  var pointgeometry = primitive.Sphere(Vector3(0, 0, 0), 0.1)
  var point = new THREE.Mesh(pointgeometry, MaterialRGB(0.8, 0.1, 0))
  point.name = 'point'
  Frames.push(point)
  sceneGraph.add(point)
  pickingData.selectableObjects.push(point)

  for (const k in Frames) {
    const element = Frames[k]
    //    element.castShadow = true;
    //    element.receiveShadow = true;
    sceneGraph.add(element)
    //    pickingData.selectableObjects.push(element);
  }

  for (const k in Surface) {
    const element = Surface[k]
    //    element.castShadow = true;
    //    element.receiveShadow = true;
    sceneGraph.add(element)
  }

  const sphereSelection = new THREE.Mesh(primitive.Sphere(Vector3(0, 0, 0), 0.015), MaterialRGB(1, 0, 0))
  sphereSelection.name = 'sphereSelection'
  sphereSelection.visible = false
  sceneGraph.add(sphereSelection)
  pickingData.visualRepresentation.sphereSelection = sphereSelection

  // *********************** //
  // / Une sphère montrant la position après translation
  // *********************** //
  const sphereTranslation = new THREE.Mesh(primitive.Sphere(Vector3(0, 0, 0), 0.015), MaterialRGB(0, 1, 0))
  sphereTranslation.name = 'sphereTranslation'
  sphereTranslation.visible = false
  sceneGraph.add(sphereTranslation)
  pickingData.visualRepresentation.sphereTranslation = sphereTranslation

  render()
}

function onMouseDown (event) {
  console.log('Mouse down')
  if (globalVar.s3) {
  // Coordonnées du clic de souris
    const xPixel = event.clientX
    const yPixel = event.clientY

    const x = 2 * xPixel / screenSize.w - 1
    const y = -2 * yPixel / screenSize.h + 1

    var camera = sceneThreeJs.camera

    // Calcul d'un rayon passant par le point (x,y)
    //  c.a.d la direction formé par les points p de l'espace tels que leurs projections sur l'écran par la caméra courante soit (x,y).
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    // Calcul des interections entre le rayon et les objets passés en paramètres
    const intersects = raycaster.intersectObjects(pickingData.selectableObjects)

    const nbrIntersection = intersects.length
    if (nbrIntersection > 0) {
    // Les intersections sont classés par distance le long du rayon. On ne considère que la première.
      const intersection = intersects[0]

      // Sauvegarde des données du picking
      pickingData.selectedObject = intersection.object // objet selectionné
      pickingData.selectedPlane.p = intersection.point.clone() // coordonnées du point d'intersection 3D
      pickingData.selectedPlane.n = camera.getWorldDirection().clone() // normale du plan de la caméra

      // Affichage de la selection
      const sphereSelection = pickingData.visualRepresentation.sphereSelection
      sphereSelection.position.copy(pickingData.selectedPlane.p)
      sphereSelection.visible = true
      pickingData.enableDragAndDrop = true
    }
    render()
  }
}

function onMouseUp (event) {
  console.log('Mouse up')
  const x = mousePosition(event, 0).x
  const y = mousePosition(event, 0).y

  if (globalVar.s1) {
    globalVar.x1 = x
    globalVar.y1 = y
    globalVar.theta1 = angle(globalVar.x1, globalVar.y1)
    globalVar.r = Math.sqrt(x * x + y * y)
    globalVar.s1 = false
    globalVar.s2 = true
    update2(x, y)
  }

  if (globalVar.s2) {
    const k = y / x
    globalVar.x2 = globalVar.r * x / Math.abs(x) / Math.sqrt(k * k + 1)
    globalVar.y2 = k * globalVar.x1
    globalVar.theta2 = angle(globalVar.x2, globalVar.y2)
    globalVar.dtheta = 2 * Math.PI / globalVar.n
    globalVar.s2 = false
    console.log('Finished!')
    console.log('r=' + globalVar.r, 'theta=' + globalVar.dtheta, 'n=' + globalVar.n)
    remove('line2')
    render()
  }

  if (globalVar.s3) {
    pickingData.enableDragAndDrop = false
  }
}

function onMouseMove (event) {
  console.log('Mouse move')
  console.log(mousePosition(event, 0))
  const x = mousePosition(event, 0).x
  const y = mousePosition(event, 0).y
  var i

  if (globalVar.s1) {
    remove('circle')
    remove('line1')
    update1(x, y)
    render()
  }

  if (globalVar.s2) {
    for (i = 2; i <= globalVar.n + 1; i++) {
      var name = 'line' + i
      remove(name)
    }
    update2(x, y)
    render()
  }

  if (globalVar.s3 && pickingData.enableDragAndDrop === true) {
    // Projection inverse passant du point 2D sur l'écran à un point 3D
    const selectedPoint = Vector3(x, y, 0.5 /* valeur de z après projection */)
    selectedPoint.unproject(sceneThreeJs.camera)

    // Direction du rayon passant par le point selectionné
    const p0 = sceneThreeJs.camera.position
    const d = selectedPoint.clone().sub(p0)

    // Intersection entre le rayon 3D et le plan de la camera
    const p = pickingData.selectedPlane.p
    const n = pickingData.selectedPlane.n
    // tI = <p-p0,n> / <d,n>
    const tI = ((p.clone().sub(p0)).dot(n)) / (d.dot(n))
    // pI = p0 + tI d
    const pI = (d.clone().multiplyScalar(tI)).add(p0) // le point d'intersection

    // Translation à appliquer
    // const translation = pI.clone().sub(p)

    const Frames = []
    const Surface = []

    var angle = 2 * Math.PI / globalVar.n
    // var r = Math.sqrt(pI.x * pI.x + pI.y * pI.y + pI.z * pI.z)
    var L = globalVar.r / Math.cos(angle / 2)

    for (i = 0; i < globalVar.n; i++) {
      sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName('frame' + i))
      sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName('surface' + i + '1'))
      sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName('surface' + i + '2'))
      sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName('point'))
    }

    // var x0 = pI.x
    // var y0 = pI.y
    var z0 = pI.z

    var pointgeometry = primitive.Sphere(Vector3(0, 0, z0), 0.1)
    var point = new THREE.Mesh(pointgeometry, MaterialRGB(0.8, 0.1, 0))
    point.name = 'point'
    Frames.push(point)
    sceneThreeJs.sceneGraph.add(point)
    pickingData.selectableObjects.push(point)

    for (i = 0; i < globalVar.n; i++) {
      var framegeometry = primitive.Cylinder(Vector3(0, 0, z0), Vector3(globalVar.r * Math.cos(i * angle), globalVar.r * Math.sin(i * angle), 0), 0.05)
      var frame = new THREE.Mesh(framegeometry, MaterialRGB(0.8, 0, 0))
      frame.name = 'frame' + i
      Frames.push(frame)

      var surface1geometry = primitive.Triangle(Vector3(0, 0, z0), Vector3(globalVar.r * Math.cos(i * angle), globalVar.r * Math.sin(i * angle), 0), Vector3(L * Math.cos(i * angle - angle / 2), L * Math.sin(i * angle - angle / 2), 0))
      var surface1 = new THREE.Mesh(surface1geometry, MaterialRGB(0.8, 0.8, 0))
      surface1.traverse(function (node) {
        if (node.material) {
          node.material.side = THREE.DoubleSide
        }
      })
      surface1.name = 'surface' + i + '1'
      Surface.push(surface1)

      var surface2geometry = primitive.Triangle(Vector3(0, 0, z0), Vector3(globalVar.r * Math.cos(i * angle), globalVar.r * Math.sin(i * angle), 0), Vector3(L * Math.cos(i * angle + angle / 2), L * Math.sin(i * angle + angle / 2), 0))
      var surface2 = new THREE.Mesh(surface2geometry, MaterialRGB(0.8, 0.8, 0))
      surface2.traverse(function (node) {
        if (node.material) {
          node.material.side = THREE.DoubleSide
        }
      })
      surface2.name = 'surface' + i + '2'
      Surface.push(surface2)
    }

    for (const k in Frames) {
      const element = Frames[k]
      //      element.castShadow = true;
      //      element.receiveShadow = true;
      sceneThreeJs.sceneGraph.add(element)
      pickingData.selectableObjects.push(element)
    }

    for (const k in Surface) {
      const element = Surface[k]
      //      element.castShadow = true;
      //      element.receiveShadow = true;
      sceneThreeJs.sceneGraph.add(element)
    }

    pickingData.visualRepresentation.sphereTranslation.visible = true
    pickingData.visualRepresentation.sphereTranslation.position.copy(p)

    /*    var sketchgeometry = primitive.Cylinder(Vector3(0,0,0),Vector3(pI.x,pI.y,pI.z),0.1);
        var sketchtoadd = new THREE.Mesh(sketchgeometry,MaterialRGB(0.8,0,0));
        sketchtoadd.name = "sketchtoadd";
      //  sketch.push(sketchtoadd);
        sketchtoadd.castShadow = true;
        sketchtoadd.receiveShadow = true;
        sceneThreeJs.sceneGraph.add(sketchtoadd);
        pickingData.selectableObjects.push(sketchtoadd); */
    render()
  }
}

function onResize () {
  // const width = window.innerWidth
  // const height = window.innerHeight
  //
  // sceneThreeJs.camera.aspect = width / height
  // sceneThreeJs.camera.updateProjectionMatrix()
  //
  // sceneThreeJs.renderer.setSize(width, height)
  sceneThreeJs.renderer.setSize(screenSize.m)
  render()
}
