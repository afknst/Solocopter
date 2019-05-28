/* global THREE sceneThreeJs screenSize mousePosition render sceneInit globalVar angle remove update1 update2 update3 clearScene requestAnimationFrame updateSplineOutline helperObjects hiding:true Vector3 splineHelperObjects objects */
'use strict'

main()

function main () {
  init1()

  document.addEventListener('mousedown', onMouseDown)

  document.addEventListener('mouseup', onMouseUp)

  document.addEventListener('mousemove', onMouseMove)

  window.addEventListener('resize', onResize)
}

function init1 () {
  sceneThreeJs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
  sceneThreeJs.renderer = sceneInit.createRenderer()
  sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement)

  update1(0.2, 0.2)
  render()
}

function init2 () {
  clearScene()
  sceneThreeJs.camera = sceneInit.createCamera(0, 0, 3)
  sceneThreeJs.controls = new THREE.OrbitControls(sceneThreeJs.camera, sceneThreeJs.renderer.domElement)
  sceneThreeJs.renderer.setSize(screenSize.w, screenSize.h)
  sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(0, 0, 10), true)
  sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(0, 0, 100))
  sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(20, -20, 100))
  sceneInit.insertLight(sceneThreeJs.sceneGraph, Vector3(-20, 20, 100))

  var planeGeometry = new THREE.PlaneBufferGeometry(200, 200)
  var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })

  var plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.position.z = -2
  plane.receiveShadow = true
  sceneThreeJs.sceneGraph.add(plane)

  var helper = new THREE.GridHelper(20, 200)
  helper.rotateX(Math.PI / 2)
  helper.position.z = -1.9
  helper.material.opacity = 0.4
  helper.material.transparent = true
  sceneThreeJs.sceneGraph.add(helper)

  sceneThreeJs.controls.damping = 0.2
  sceneThreeJs.controls.addEventListener('change', render)
  sceneThreeJs.controls.addEventListener('start', function () { cancelHideTransorm() })
  sceneThreeJs.controls.addEventListener('end', function () { delayHideTransform() })

  sceneThreeJs.transformControl = new THREE.TransformControls(sceneThreeJs.camera, sceneThreeJs.renderer.domElement)
  sceneThreeJs.transformControl.addEventListener('change', render)
  sceneThreeJs.transformControl.addEventListener('dragging-changed', function (event) { sceneThreeJs.controls.enabled = !event.value })
  sceneThreeJs.sceneGraph.add(sceneThreeJs.transformControl)

  sceneThreeJs.transformControl.addEventListener('change', function () { cancelHideTransorm() })
  sceneThreeJs.transformControl.addEventListener('mouseDown', function () { cancelHideTransorm() })
  sceneThreeJs.transformControl.addEventListener('mouseUp', function () { delayHideTransform() })
  sceneThreeJs.transformControl.addEventListener('objectChange', function () { updateSplineOutline() })

  sceneThreeJs.dragcontrols = new THREE.DragControls(helperObjects, sceneThreeJs.camera, sceneThreeJs.renderer.domElement)
  sceneThreeJs.dragcontrols.enabled = false
  sceneThreeJs.dragcontrols.addEventListener('hoveron', function (event) {
    sceneThreeJs.transformControl.attach(event.object)
    cancelHideTransorm()
  })
  sceneThreeJs.dragcontrols.addEventListener('hoveroff', function () { delayHideTransform() })

  update3()
  // render()

  animate()
}

function onMouseDown (event) {
  console.log('Mouse down')
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
  } else if (globalVar.s2) {
    const k = y / x
    globalVar.x2 = globalVar.r * x / Math.abs(x) / Math.sqrt(k * k + 1)
    globalVar.y2 = k * globalVar.x1
    globalVar.theta2 = angle(globalVar.x2, globalVar.y2)
    globalVar.dtheta = 2 * Math.PI / globalVar.n
    globalVar.s2 = false
    globalVar.s3 = true
    console.log('Finished!')
    console.log('r=' + globalVar.r, 'theta=' + globalVar.dtheta, 'n=' + globalVar.n)
    remove('line2')
    init2()
    render()
  }
}

function onMouseMove (event) {
  console.log('Mouse move')
  // console.log(mousePosition(event, 0))
  const x = mousePosition(event, 0).x
  const y = mousePosition(event, 0).y
  var i

  if (globalVar.s1) {
    remove('circle')
    remove('line1')
    update1(x, y)
    render()
  } else if (globalVar.s2) {
    for (i = 2; i <= globalVar.n + 1; i++) {
      var name = 'line' + i
      remove(name)
    }
    update2(x, y)
    render()
  }
}

function onResize () {
  if (globalVar.s3 === true) {
    sceneThreeJs.renderer.setSize(screenSize.w, screenSize.h)
  } else {
    sceneThreeJs.renderer.setSize(screenSize.m, screenSize.m)
  }
  render()
}

function animate () {
  requestAnimationFrame(animate)
  render()

  if (globalVar.play) {
    globalVar.time += 0.02

    splineHelperObjects[3].position.z = splineHelperObjects[2].position.z + globalVar.r * Math.sin(10 * globalVar.time) / 2

    updateSplineOutline()

    objects.sphere0.position.x = 5 * Math.sin(globalVar.time)
    objects.sphere0.position.y = 2 * (-Math.cos(globalVar.time) + 1)

    objects.sphere0.position.z = -globalVar.r * (Math.cos(globalVar.time * 5) - 1)
  }
}

function delayHideTransform () {
  cancelHideTransorm()
  hideTransform()
}

function hideTransform () {
  hiding = setTimeout(function () {
    sceneThreeJs.transformControl.detach(sceneThreeJs.transformControl.object)
  }, 100)
}

function cancelHideTransorm () {
  if (hiding) clearTimeout(hiding)
}
