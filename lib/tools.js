/* global THREE */
/* eslint-disable no-unused-vars */

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

function Vector3 (x, y, z) {
  return new THREE.Vector3(x, y, z)
}

function MaterialRGB (r, g, b) {
  const c = new THREE.Color(r, g, b)
  return new THREE.MeshLambertMaterial({ color: c })
}

String.prototype.format = function () {
  var str = this

  for (var i = 0; i < arguments.length; i++) {
    str = str.replace('{' + i + '}', arguments[ i ])
  }
  return str
}

THREE.STLExporter = function () {}

THREE.STLExporter.prototype = {

  constructor: THREE.STLExporter,

  parse: (function () {
    var vector = new THREE.Vector3()
    var normalMatrixWorld = new THREE.Matrix3()

    return function parse (scene) {
      var output = ''

      output += 'solid exported\n'

      scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
          var geometry = object.geometry
          var matrixWorld = object.matrixWorld

          if (geometry instanceof THREE.Geometry) {
            var vertices = geometry.vertices
            var faces = geometry.faces

            normalMatrixWorld.getNormalMatrix(matrixWorld)

            for (var i = 0, l = faces.length; i < l; i++) {
              var face = faces[ i ]

              vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize()

              output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n'
              output += '\t\touter loop\n'

              var indices = [ face.a, face.b, face.c ]

              for (var j = 0; j < 3; j++) {
                vector.copy(vertices[ indices[ j ] ]).applyMatrix4(matrixWorld)

                output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n'
              }

              output += '\t\tendloop\n'
              output += '\tendfacet\n'
            }
          }
        }
      })

      output += 'endsolid exported\n'

      return output
    }
  }())

}
