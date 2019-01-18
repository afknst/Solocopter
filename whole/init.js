/* global THREE */

const sceneThreeJs = {
  sceneGraph: null,
  camera: null,
  renderer: null,
  controls: null
}

const pickingData = {
  enabled: false, // Mode picking en cours ou désactivé (CTRL enfoncé)
  enableDragAndDrop: false, // Drag and drop en cours ou désactivé
  selectableObjects: [], // Les objets selectionnables par picking
  selectedObject: null, // L'objet actuellement selectionné
  selectedPlane: { p: null, n: null }, // Le plan de la caméra au moment de la selection. Plan donné par une position p, et une normale n.
  // Les représentations visuelles associées au picking
  visualRepresentation: {
    sphereSelection: null, // Une sphère montrant le point d'intersection au moment du picking
    sphereTranslation: null // Une sphère montrant l'état actuel de la translation
  }
}

const raycaster = new THREE.Raycaster()

function render () {
  sceneThreeJs.renderer.render(sceneThreeJs.sceneGraph, sceneThreeJs.camera)
}

const globalVar = {
  s1: true,
  s2: false,
  s3: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  n: 0,
  r: 0,
  theta1: 0,
  theta2: 0,
  dtheta: 0
}

const sceneInit = (function () {
  return {

    // Création et ajout de lumière dans le graphe de scène
    insertLight: function (sceneGraph, p) {
      const spotLight = new THREE.SpotLight(0xffffff, 0.8)
      spotLight.position.copy(p)

      spotLight.castShadow = true
      spotLight.shadow.mapSize.width = 2048
      spotLight.shadow.mapSize.height = 2048

      sceneGraph.add(spotLight)
    },

    insertAmbientLight: function (sceneGraph) {
      const ambient = new THREE.AmbientLight(0xffffff, 0.8)
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
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setClearColor(0xeeeeee, 1.0)
      renderer.setSize(window.innerWidth, window.innerHeight)

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

// sceneThreeJs.sceneGraph = new THREE.Scene()
// sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph)
// sceneThreeJs.renderer = sceneInit.createRenderer()
// sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement)
// sceneThreeJs.camera = sceneInit.createCamera(0, 1, 8)
// sceneThreeJs.controls = new THREE.OrbitControls(sceneThreeJs.camera)
