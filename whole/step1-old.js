class Step1 {
    sceneGraph = new THREE.Scene();

    // Creation d'une caméra Orthographique (correspondance simple entre la position de la souris et la position dans l'espace (x,y))
    camera = new THREE.OrthographicCamera(-1,1,1,-1,-1,1);

    renderer = new THREE.WebGLRenderer( { antialias: true,alpha:false } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor(0xeeeeee,1.0);

    // Force la zone de rendu à être de taille carré
    canvasSize = Math.min(window.innerWidth, window.innerHeight);
    renderer.setSize( canvasSize,canvasSize );

    baliseHtml = document.querySelector("#container");
    baliseHtml.appendChild(renderer.domElement);

    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0,0,10);
    sceneGraph.add(spotLight);

    s1=true;
    s2=false;

  constructor() {
    // ****************************** //
    //  Fonctions de rappels évènementielles
    // ****************************** //

    // Bouton de la souris enclenché
    window.addEventListener('mousedown', onMouseDown);

    // Bouton de la souris relaché
    window.addEventListener('mouseup', onMouseUp);

    // Souris qui se déplace
    window.addEventListener('mousemove', onMouseMove);

    // Redimensionnement de la fenêtre
    window.addEventListener('resize',onResize);

    this.output = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      n: 0,
      r: 0,
      theta1: 0,
      theta2: 0,
      dtheta: 0
    };
  }

  main() {
    update1( .2, .2 );
    render();
  }

  render() {
      renderer.render(sceneGraph, camera);
  }

  onMouseDown(event) {
      console.log('Mouse down');
  }

  onMouseUp(event) {
      const x = 2*(event.clientX/canvasSize)-1;
      const y = 1-2*(event.clientY/canvasSize);
      console.log('Mouse up');
      if (s1) {
          this.output.x1 = x;
          this.output.y1 = y;
          this.output.theta1 = angle( x, y );
          this.output.r = Math.sqrt( x*x + y*y );
          s1 = false;
          s2 = true;
          update2( x, y );
      } else if (s2) {
          const k = y/x;
          this.output.x2 = this.output.r * x/Math.abs(x) / Math.sqrt( k*k+1);
          this.output.y2 = k * this.output.x1;
          this.output.theta2 = angle( this.output.x2, this.output.y2 );
          this.output.dtheta = 2*Math.PI/this.output.n;
          s2 = false;
          console.log("Finished!");
          console.log("r="+this.output.r,"theta="+this.output.dtheta,"n="+this.output.n);
          sceneGraph.remove( sceneGraph.getObjectByName("line2") );
          render();
      }
  }

  onResize(event) {
      // On force toujours le canvas à être carré
      canvasSize = Math.min(window.innerWidth, window.innerHeight);
      renderer.setSize( canvasSize,canvasSize );
  }

  update1( x, y ) {
      const radius = Math.sqrt( x*x + y*y );
      const circleGeometry = new THREE.CircleGeometry( radius,32 );
      const circleMaterial = new THREE.MeshBasicMaterial( {color:0x00ffff} );
      const circle = new THREE.Mesh( circleGeometry, circleMaterial );
      circle.name = "circle";
      circle.castShadow = false;
      circle.receiveShadow = false;
      sceneGraph.add(circle);

      const lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(
  	  new THREE.Vector3( 0, 0, 0 ),
  	  new THREE.Vector3( x, y, 0 )
      );
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2} );
      const line = new THREE.Line( lineGeometry, lineMaterial );
      line.name = "line1";
      line.castShadow = false;
      line.receiveShadow = false;
      sceneGraph.add( line );
  }

  update2( x, y ) {
      const k = y/x;
      var xr = this.output.r * x/Math.abs(x) / Math.sqrt( k*k+1);
      var yr = k * xr;
      const xr0 = xr;
      const yr0 = yr;

      const lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( xr0, yr0, 0 )
      );
      const lineMaterial = new THREE.LineBasicMaterial( { color: 0x101010, linewidth: 2} );
      const line = new THREE.Line( lineGeometry, lineMaterial );
      line.name = "line2";
      line.castShadow = false;
      line.receiveShadow = false;
      sceneGraph.add( line );

      var thetar = angle( xr, yr );
      var theta = thetar - this.output.theta1;
      if (theta>Math.PI) {
          theta = theta - 2*Math.PI;
      }
      var num = Math.floor( 2*Math.PI/theta );
      if (num >= 20) {
          num = 20;
      }
      if (num <= -20) {
          num = -20;
      }
      theta = 2*Math.PI/num;

      var i;
      this.output.n=Math.abs(num);
      for (i = 1; i < this.output.n; i++) {
        var name = "line"+(i+2);
        thetar = this.output.theta1+i*theta;
        xr = this.output.r * Math.cos(thetar);
        yr = this.output.r * Math.sin(thetar);
        const lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
    	       new THREE.Vector3( 0, 0, 0 ),
    	       new THREE.Vector3( xr, yr, 0 )
        );
        const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2} );
        const line = new THREE.Line( lineGeometry, lineMaterial );
        line.name = name;
        line.castShadow = false;
        line.receiveShadow = false;
        sceneGraph.add( line );
      }
  }

  angle( x, y ) {
      const theta = Math.atan( Math.abs(y/x) );
      if ( x>=0 ) {
          if ( y>=0 ){
              return theta;
          } else {
              return 2*Math.PI-theta;
          }
      } else {
          if ( y>=0 ){
              return Math.PI-theta;
          } else {
              return Math.PI+theta;
          }
      }
  }
}
