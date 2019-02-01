/* global THREE screenSize */
/* eslint-disable no-unused-vars  */

const sceneThreeJs = {
  sceneGraph: null,
  camera: null,
  renderer: null,
  controls: null,
  transformControl: null,
  dragcontrols: null,
  gui: null
}

const objects = {
  sphere0: null,
  point: new THREE.Vector3(),
  geometry: new THREE.SphereGeometry(0.02, 32, 32),
  curve: null,
  handle: null,
  surface0: [],
  surface1: []
}

const globalVar = {
  s1: true,
  s2: false,
  s3: false,
  play: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  n: 0,
  r: 0,
  theta1: 0,
  theta2: 0,
  dtheta: 0,
  time: 0
}

const ARC_SEGMENTS = 200
var positions = []
var splineHelperObjects = []
var helperObjects = []
var splinePointsLength = 4
var hiding

const color = {
  bg: 0xeeeeee,
  surface: 0x00ffff,
  frame: 0x00aaaa,
  ind: 0xffffff
}

const raycaster = new THREE.Raycaster()

function render () {
  sceneThreeJs.renderer.render(sceneThreeJs.sceneGraph, sceneThreeJs.camera)
}

const sceneInit = (function () {
  return {

    // Création et ajout de lumière dans le graphe de scène
    insertLight: function (sceneGraph, p, shadow = false) {
      const spotLight = new THREE.SpotLight(0xffffff, 1, 100)
      spotLight.position.copy(p)
      if (shadow)
        spotLight.castShadow = true
      sceneGraph.add(spotLight)
    },

    insertAmbientLight: function (sceneGraph) {
      const ambient = new THREE.AmbientLight(0xf0f0f0)
      sceneGraph.add(ambient)
    },

    // Création et ajout d'une caméra dans le graphe de scène
    createCamera: function (x, y, z) {
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500)
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)

      return camera
    },

    // Initialisation du moteur de rendu
    createRenderer: function () {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setClearColor(color.bg, 1.0)
      renderer.setSize(screenSize.m, screenSize.m)

      renderer.shadowMap.enabled = true
      renderer.shadowMap.Type = THREE.PCFSoftShadowMap

      return renderer
    },

    insertRenderInHtml: function (domElement) {
      const baliseHtml = document.querySelector('#container')
      baliseHtml.appendChild(domElement)
    }

  }
})()

function clearScene () {
  for (var i = sceneThreeJs.sceneGraph.children.length - 1; i >= 0; i--) {
    sceneThreeJs.sceneGraph.remove(sceneThreeJs.sceneGraph.children[i])
  }
}

const exportSpline = { export: function(){

  var strplace = [];

  for ( var i = 0; i < splinePointsLength; i ++ ) {

    var p = splineHelperObjects[ i ].position;
    strplace.push( 'new THREE.Vector3({0}, {1}, {2})'.format( p.x, p.y, p.z ) );

  }

  console.log( strplace.join( ',\n' ) );
  var code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
  prompt( 'copy and paste code', code );

}}

sceneThreeJs.sceneGraph = new THREE.Scene()
sceneThreeJs.sceneGraph.background = new THREE.Color(0xf0f0f0)
sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph)

// sceneThreeJs.sceneGraph = new THREE.Scene()
// sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph)
// sceneThreeJs.renderer = sceneInit.createRenderer()
// sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement)
// sceneThreeJs.camera = sceneInit.createCamera(0, 1, 8)
// sceneThreeJs.controls = new THREE.OrbitControls(sceneThreeJs.camera)
