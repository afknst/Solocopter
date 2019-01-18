'use strict'

// ****************************** //
//  Creation de la scène
// ****************************** //

const sceneGraph = new THREE.Scene()

// Creation d'une caméra Orthographique (correspondance simple entre la position de la souris et la position dans l'espace (x,y))
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0xeeeeee, 1.0)

// Force la zone de rendu à être de taille carré
let canvasSize = Math.min(window.innerWidth, window.innerHeight)
renderer.setSize(canvasSize, canvasSize)

const baliseHtml = document.querySelector('#container')
baliseHtml.appendChild(renderer.domElement)

const spotLight = new THREE.SpotLight(0xffffff)
spotLight.position.set(0, 0, 10)
sceneGraph.add(spotLight)

// ****************************** //
// Output
// ****************************** //
var x1 = 0
var y1 = 0
var x2 = 0
var y2 = 0
var n = 0
var r = 0
var theta1 = 0
var theta2 = 0
var dtheta = 0

// ****************************** //
// Step
// ****************************** //
var s1 = true
var s2 = false

// ****************************** //
//  Ajout de l'objet
// ****************************** //
update1(0.2, 0.2)

// ****************************** //
//  Fonctions de rappels évènementielles
// ****************************** //

// Bouton de la souris enclenché
window.addEventListener('mousedown', onMouseDown)

// Bouton de la souris relaché
window.addEventListener('mouseup', onMouseUp)

// Souris qui se déplace
window.addEventListener('mousemove', onMouseMove)

// Redimensionnement de la fenêtre
window.addEventListener('resize', onResize)

// ****************************** //
//  Rendu
// ****************************** //
function render () {
  renderer.render(sceneGraph, camera)
}

render()

// Fonction appelée lors du clic de la souris
function onMouseDown (event) {
  console.log('Mouse down')
}

// Fonction appelée lors du relachement de la souris
function onMouseUp (event) {
  const x = 2 * (event.clientX / canvasSize) - 1
  const y = 1 - 2 * (event.clientY / canvasSize)
  console.log('Mouse up')
  if (s1) {
    x1 = x
    y1 = y
    theta1 = angle(x1, y1)
    r = Math.sqrt(x * x + y * y)
    s1 = false
    s2 = true
    update2(x, y)
  } else if (s2) {
    const k = y / x
    x2 = r * x / Math.abs(x) / Math.sqrt(k * k + 1)
    y2 = k * x1
    theta2 = angle(x2, y2)
    dtheta = 2 * Math.PI / n
    s2 = false
    console.log('Finished!')
    console.log('r=' + r, 'theta=' + dtheta, 'n=' + n)
    sceneGraph.remove(sceneGraph.getObjectByName('line2'))
    render()
  }
}

// Fonction appelée lors du déplacement de la souris
function onMouseMove (event) {
  const x = 2 * (event.clientX / canvasSize) - 1
  const y = 1 - 2 * (event.clientY / canvasSize)

  if (s1) {
    sceneGraph.remove(sceneGraph.getObjectByName('circle'))
    sceneGraph.remove(sceneGraph.getObjectByName('line1'))
    update1(x, y)
    render()
  }

  if (s2) {
    var i
    for (i = 2; i <= n + 1; i++) {
      var name = 'line' + i
      sceneGraph.remove(sceneGraph.getObjectByName(name))
    }
    update2(x, y)
    render()
  }
}

// Fonction appelée lors du redimmensionnement de la fenetre
function onResize (event) {
    // On force toujours le canvas à être carré
  canvasSize = Math.min(window.innerWidth, window.innerHeight)
  renderer.setSize(canvasSize, canvasSize)
}

// Step 1
function update1 (x, y) {
  const radius = Math.sqrt(x * x + y * y)
  const circleGeometry = new THREE.CircleGeometry(radius, 32)
  const circleMaterial = new THREE.MeshBasicMaterial({color: 0x00ffff})
  const circle = new THREE.Mesh(circleGeometry, circleMaterial)
  circle.name = 'circle'
  circle.castShadow = false
  circle.receiveShadow = false
  sceneGraph.add(circle)

  const lineGeometry = new THREE.Geometry()
  lineGeometry.vertices.push(
	  new THREE.Vector3(0, 0, 0),
	  new THREE.Vector3(x, y, 0)
    )
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2})
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line1'
  line.castShadow = false
  line.receiveShadow = false
  sceneGraph.add(line)
}

// Step 2
function update2 (x, y) {
  const k = y / x
  var xr = r * x / Math.abs(x) / Math.sqrt(k * k + 1)
  var yr = k * xr
  const xr0 = xr
  const yr0 = yr

  const lineGeometry = new THREE.Geometry()
  lineGeometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(xr0, yr0, 0)
    )
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x101010, linewidth: 2})
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = 'line2'
  line.castShadow = false
  line.receiveShadow = false
  sceneGraph.add(line)

  var thetar = angle(xr, yr)
  var theta = thetar - theta1
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
  n = Math.abs(num)
  for (i = 1; i < n; i++) {
    var name = 'line' + (i + 2)
    thetar = theta1 + i * theta
    xr = r * Math.cos(thetar)
    yr = r * Math.sin(thetar)
    const lineGeometry = new THREE.Geometry()
    lineGeometry.vertices.push(
  	       new THREE.Vector3(0, 0, 0),
  	       new THREE.Vector3(xr, yr, 0)
      )
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2})
    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.name = name
    line.castShadow = false
    line.receiveShadow = false
    sceneGraph.add(line)
  }
}

function angle (x, y) {
  const theta = Math.atan(Math.abs(y / x))
  if (x >= 0) {
    if (y >= 0) {
      return theta
    } else {
      return 2 * Math.PI - theta
    }
  } else {
    if (y >= 0) {
      return Math.PI - theta
    } else {
      return Math.PI + theta
    }
  }
}
