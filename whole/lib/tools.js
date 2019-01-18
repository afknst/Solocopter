/* global THREE */

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
