/* global objects color THREE sceneThreeJs globalVar splineHelperObjects helperObjects primitive positions:true splinePointsLength:true ARC_SEGMENTS Vector3 angle dat exportSpline */
/* eslint-disable no-unused-vars */

function remove (name) {
  sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.getObjectByName(name))
}

function addSplineObject (position) {
  var material = new THREE.MeshBasicMaterial({ color: color.ind })
  var object = new THREE.Mesh(objects.geometry, material)

  if (position) {
    object.position.copy(position)
  } else {
    object.position.x = Math.random() * 10 - 5
    object.position.y = Math.random() * 6
    object.position.z = Math.random() * 8 - 4
  }

  object.castShadow = true
  object.receiveShadow = true
  objects.sphere0.add(object)
  splineHelperObjects.push(object)
  helperObjects.push(object)
  return object
}

function addPoint (position) {
  splinePointsLength++

  if (position) {
    addSplineObject(position)
    positions.push(position)
  } else {
    positions.push(addSplineObject().position)
  }

  updateSplineOutline()
}

function removePoint () {
  if (splinePointsLength <= 4) {
    return
  }
  splinePointsLength--
  positions.pop()
  helperObjects.pop()
  objects.sphere0.remove(splineHelperObjects.pop())

  updateSplineOutline()
}

function updateSplineOutline () {
  for (var i = 0; i < globalVar.n; i++) {
    objects.sphere0.remove(objects.surface0[i])
    objects.sphere0.remove(objects.surface1[i])
  }
  objects.surface0 = []
  objects.surface1 = []

  for (i = 0; i < splineHelperObjects.length; i++) {
    splineHelperObjects[i].position.y = 0
    if (splineHelperObjects[i].position.x < 0) {
      splineHelperObjects[i].position.x = 0
    }
  }

  var spline = objects.curve

  var splineMesh = spline.mesh
  var position = splineMesh.geometry.attributes.position

  var points = []
  for (i = 0; i < ARC_SEGMENTS; i++) {
    var t = i / (ARC_SEGMENTS - 1)
    spline.getPoint(t, objects.point)
    position.setXYZ(i, objects.point.x, 0, objects.point.z)
    points.push(new THREE.Vector2(objects.point.x, objects.point.z))
  }

  var material00 = new THREE.MeshPhongMaterial({ color: color.surface, side: THREE.BackSide })
  var material01 = new THREE.MeshPhongMaterial({ color: color.frame, side: THREE.BackSide })
  var material10 = new THREE.MeshBasicMaterial({ color: color.surface, side: THREE.FrontSide })
  var material11 = new THREE.MeshBasicMaterial({ color: color.frame, side: THREE.FrontSide })

  for (i = 0; i < globalVar.n; i++) {
    var geometry = new THREE.LatheGeometry(points, Math.floor(12 / globalVar.n) + 3, Math.PI / 2 + i * globalVar.dtheta, globalVar.dtheta)
    var mesh0
    var mesh1
    if (i % 2 === 0) {
      mesh0 = new THREE.Mesh(geometry, material00)
      mesh1 = new THREE.Mesh(geometry, material10)
    } else {
      mesh0 = new THREE.Mesh(geometry, material01)
      mesh1 = new THREE.Mesh(geometry, material11)
    }
    mesh0.rotation.x = Math.PI / 2
    mesh1.rotation.x = Math.PI / 2
    mesh1.castShadow = true
    objects.surface0.push(mesh0)
    objects.surface1.push(mesh1)
    objects.sphere0.add(mesh0)
    objects.sphere0.add(mesh1)
  }

  position.needsUpdate = true
}

function load (newPositions) {
  while (newPositions.length > positions.length) {
    addPoint()
  }

  while (newPositions.length < positions.length) {
    removePoint()
  }

  for (var i = 0; i < positions.length; i++) {
    positions[ i ].copy(newPositions[ i ])
  }

  updateSplineOutline()
}

function update1 (x, y) {
  const radius = Math.sqrt(x * x + y * y)
  const circleGeometry = new THREE.CircleGeometry(radius, 32)
  const circleMaterial = new THREE.MeshBasicMaterial({ color: color.surface })
  const circle = new THREE.Mesh(circleGeometry, circleMaterial)
  circle.name = 'circle'
  sceneThreeJs.sceneGraph.add(circle)

  const lineGeometry = new THREE.Geometry()
  lineGeometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x, y, 0)
  )
  const lineMaterial = new THREE.LineBasicMaterial({ color: color.frame, linewidth: 2 })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line1'
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
  const lineMaterial = new THREE.LineBasicMaterial({ color: color.ind, linewidth: 2 })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line2'
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
    const lineMaterial = new THREE.LineBasicMaterial({ color: color.frame, linewidth: 2 })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.name = name
    sceneThreeJs.sceneGraph.add(line)
  }
}

function update3 () {
  var geometry0 = primitive.Sphere(Vector3(0, 0, 0), 0.05)
  var material0 = new THREE.MeshPhongMaterial({ color: color.frame })
  objects.sphere0 = new THREE.Mesh(geometry0, material0)
  objects.sphere0.castShadow = true
  sceneThreeJs.sceneGraph.add(objects.sphere0)
  helperObjects.push(objects.sphere0)

  objects.handle = new THREE.Mesh(primitive.Cylinder(Vector3(0, 0, 0), Vector3(0, 0, -globalVar.r * 2), 0.02),
    new THREE.MeshBasicMaterial({ color: color.frame }))
  objects.sphere0.add(objects.handle)

  for (var i = 0; i < splinePointsLength; i++) {
    addSplineObject(positions[ i ])
  }
  positions = []
  for (i = 0; i < splinePointsLength; i++) {
    positions.push(splineHelperObjects[ i ].position)
  }

  var geometryc = new THREE.BufferGeometry()
  geometryc.addAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))

  var curve = new THREE.CatmullRomCurve3(positions)
  curve.curveType = 'chordal'
  curve.mesh = new THREE.Line(geometryc, new THREE.LineBasicMaterial({
    color: color.frame,
    linewidth: 2
  }))
  curve.mesh.castShadow = true
  objects.sphere0.add(curve.mesh)
  objects.curve = curve

  load([Vector3(0, 0, 0), Vector3(globalVar.r / 3.0, 0, -globalVar.r / 3.0), Vector3(globalVar.r * 2.0 / 3.0, 0, -globalVar.r * 2.0 / 3.0), Vector3(globalVar.r, 0, -globalVar.r)])

  sceneThreeJs.gui = new dat.GUI()
  sceneThreeJs.gui.add(globalVar, 'play').name('Play Animation')
  sceneThreeJs.gui.addColor(color, 'surface').name('Surface Color1').onChange(updateSplineOutline)
  sceneThreeJs.gui.addColor(color, 'frame').name('Surface Color2').onChange(updateSplineOutline)
  sceneThreeJs.gui.addColor(color, 'frame2').name('Frame Color').onChange(function () {
    objects.sphere0.material.color.set(color.frame2)
    objects.handle.material.color.set(color.frame2)
  })
  sceneThreeJs.gui.add(exportSpline, 'export').name('Export to STL')
  sceneThreeJs.gui.open()
}
