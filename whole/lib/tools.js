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
