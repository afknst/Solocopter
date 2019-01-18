/* global THREE sceneThreeJs globalVar angle */

const screenSize = {
  w: window.innerWidth,
  h: window.innerHeight,
  m: Math.min(window.innerWidth, window.innerHeight)
}

const mousePosition = function (event, type) {
  var w
  var h
  if (type === undefined) {
    w = screenSize.w
    h = screenSize.h
  } else {
    w = screenSize.m
    h = screenSize.m
  }
  return {
    x: 2 * event.clientX / w - 1,
    y: -2 * event.clientY / h + 1
  }
}

function remove (name) {
  sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName(name))
}

function update1 (x, y) {
  const radius = Math.sqrt(x * x + y * y)
  const circleGeometry = new THREE.CircleGeometry(radius, 32)
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff })
  const circle = new THREE.Mesh(circleGeometry, circleMaterial)
  circle.name = 'circle'
  circle.castShadow = false
  circle.receiveShadow = false
  sceneThreeJs.sceneGraph.add(circle)

  const lineGeometry = new THREE.Geometry()
  lineGeometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x, y, 0)
  )
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line1'
  line.castShadow = false
  line.receiveShadow = false
  sceneThreeJs.sceneGraph.add(line)
}

function update2 (x, y) {
  const k = y / x
  var xr = globalVar.r * x / Math.abs(x) / Math.sqrt(k * k + 1)
  var yr = k * xr
  const xr0 = xr
  const yr0 = yr

  const lineGeometry = new THREE.Geometry()
  lineGeometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(xr0, yr0, 0)
  )
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x101010, linewidth: 2 })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line2'
  line.castShadow = false
  line.receiveShadow = false
  sceneThreeJs.sceneGraph.add(line)

  var thetar = angle(xr, yr)
  var theta = thetar - globalVar.theta1
  if (theta > Math.PI) {
    theta = theta - 2 * Math.PI
  }
  var num = Math.floor(2 * Math.PI / theta)
  if (num >= 20) {
    num = 20
  }
  if (num <= -20) {
    num = -20
  }
  theta = 2 * Math.PI / num

  var i
  globalVar.n = Math.abs(num)
  for (i = 1; i < globalVar.n; i++) {
    var name = 'line' + (i + 2)
    thetar = globalVar.theta1 + i * theta
    xr = globalVar.r * Math.cos(thetar)
    yr = globalVar.r * Math.sin(thetar)
    const lineGeometry = new THREE.Geometry()
    lineGeometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(xr, yr, 0)
    )
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.name = name
    line.castShadow = false
    line.receiveShadow = false
    sceneThreeJs.sceneGraph.add(line)
  }
}
