
function isArray( object ) {
   return Object.prototype.toString.call( object ) == '[object Array]';
 }

function isNumber( object ) {
  return typeof object == 'number';
}

function random( min, max ) {
  if ( isArray( min ) ) return min[ ~~( M.random() * min.length ) ];
  if ( !isNumber( max ) ) max = min || 1, min = 0;
  return min + Math.random() * ( max - min );
}

sin = Math.sin;
cos = Math.cos;
abs = Math.abs;

TWO_PI = Math.PI * 2;
HALF_PI = Math.PI / 2;
QUARTER_PI = Math.PI / 4;

var Leaf = function(boundingBox, gravity) {
  // boundingBox vector x, y, z = width, height, depth
  this.boundingBox = boundingBox;
  this.gravity = gravity || 1;

  this.value = random(-1, 1);
  this.angle = new THREE.Vector3(0, random(), random());
  this.radius = new THREE.Vector3(random(boundingBox.x * 0.1, boundingBox.x * 0.5), random(), random(boundingBox.x * 0.5));
  this.pos = new THREE.Vector3(0, boundingBox.y * 0.5 + random(boundingBox.y * 0.05), 0);
  this.mass = random(0.3, 1);
  this.scale = random(8, 15);

  const geometry = new THREE.BufferGeometry();

  // positions
  const positions = new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 );
  positions.setXYZ( 0,	-0.5,	0.0,	0.0 );
  positions.setXYZ( 1,	0.0,	0.5,	0.25 );
  positions.setXYZ( 2,	0.5,	0.0,	0.0 );
  positions.setXYZ( 3,	0.0,	-0.5,	0.25 );
  geometry.addAttribute( 'position', positions );

  // uvs
  const uvs = new THREE.BufferAttribute( new Float32Array( 4 * 2 ), 2 );
  uvs.setXYZ( 0,	0.0,	0.5 );
  uvs.setXYZ( 1,	0.5,	0.0 );
  uvs.setXYZ( 2,	1.0,	0.5 );
  uvs.setXYZ( 3,	0.5,	1.0 );
  geometry.addAttribute( 'uv', uvs );

  // index
  geometry.setIndex( new THREE.BufferAttribute( new Uint16Array( [ 0, 1, 2, 0, 2, 3 ] ), 1 ) );

  var image = document.createElement( 'img' );
  var texture = new THREE.Texture( image );
  image.onload = function()  {
    texture.needsUpdate = true;
  };
  image.src = "leaf.png"
  const material = new THREE.MeshBasicMaterial();
  material.map = texture;
  material.side = THREE.DoubleSide;
  // material.color = new THREE.Color().setHSL(random(0.2, 0.4), 0.5, 0.5);
  material.transparent = true;


  this.mesh = new THREE.Mesh( geometry, material );
  this.mesh.visible = false;
  this.mesh.scale.set(this.scale, this.scale, this.scale);
}

Leaf.prototype.fall = function() {
  this.mesh.visible = true;
  this.started = true;
  this.startTween();
}

Leaf.prototype.hide = function() {
  // this.mesh.visible = false;
  this.started = false;
  TweenMax.killTweensOf(this);
}

Leaf.prototype.startTween = function() {
  const time = random(1, 2);
  const radiusX = random(this.boundingBox.x * 0.1, this.boundingBox.x * 0.5);
  const radiusZ = random(this.boundingBox.z * 0.1, this.boundingBox.z * 0.5) * time * 0.5;
  const ease = Quad.easeInOut;

  TweenMax.to(this.radius, time, { x: radiusX, y: radiusX /** 0.25*/, z: radiusZ, ease });

  TweenMax.to(this, time, { value: 1, ease, onComplete: () => {
    TweenMax.to(this, time, { value: -1, ease, onComplete: () => {
      this.startTween();
    } });
  } });
}

Leaf.prototype.update = function() {
  if (!this.started) return;

  this.angle.x += random(0.01);
  this.angle.z += (this.value + 1) * 0.02;
  this.pos.y += (1 - abs(this.value)) * this.radius.y * this.gravity * -0.1 - this.mass;

  this.mesh.position.x = this.value * this.radius.x;
  this.mesh.position.y = cos(this.value * HALF_PI) * -this.radius.y;
  this.mesh.position.z = sin(this.angle.z) * this.radius.z;

  this.mesh.position.y += this.pos.y;

  this.mesh.rotation.x = HALF_PI + sin(this.value * HALF_PI) * cos(this.value * this.angle.y * HALF_PI);
  this.mesh.rotation.y = sin(this.value * HALF_PI); // + cos(this.angle.y * PI);
  this.mesh.rotation.z = this.angle.z;

  this.mesh.rotation.z += this.angle.x;
}

var camera, scene, renderer;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 300;
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xADD8E6 );
  const light = new THREE.AmbientLight( 0x404040 ,10); // soft white light
scene.add( light );
  //var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
  //var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
  //mesh = new THREE.Mesh( geometry, material );

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };
  const onError = function () { };

  const loader = new THREE.GLTFLoader();
  loader.load(
    // resource URL
    'untitled.glb',
    // called when the resource is loaded
    function ( gltf ) {
  
      scene.add( gltf.scene );
      
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
      gltf.scene.scale.set(40,40,40);
      gltf.scene.position.y = -95;
      
    }
    );
  this.boundingBox = new THREE.Vector3(200, 100, 200);
  
  this.leaves = [];
  this.numLeaves = 20;

  for (let i = 0; i < this.numLeaves; i++) {
    const leaf = new Leaf(this.boundingBox);
    this.leaves.push(leaf);
    scene.add(leaf.mesh);

    TweenMax.delayedCall(random(), leaf.fall.bind(leaf));
  }
  
  const geometry = new THREE.BoxGeometry(this.boundingBox.x, this.boundingBox.y, this.boundingBox.z);
	//const material = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true  });
	//const mesh = new THREE.Mesh(geometry, material);
  //scene.add( mesh );
  const loadert = new THREE.TextureLoader();
  const groundTexture = loadert.load( 'grasslight-big.jpg' );
				groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
				groundTexture.repeat.set( 25, 25 );
				groundTexture.anisotropy = 16;
				groundTexture.encoding = THREE.sRGBEncoding;

				const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

				let mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000 ), groundMaterial );
				mesh.position.y = - 95;
				mesh.rotation.x = - Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add( mesh );



  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  this.controls = new THREE.TrackballControls(camera, renderer.domElement);
  this.controls.zoomSpeed = 0.8;
  this.controls.panSpeed = 0.8;
  this.controls.staticMoving = false;
	this.controls.dynamicDampingFactor = 0.15;
	this.controls.maxDistance = 3000;
  //
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  this.controls.update();
  
  for (let i = 0; i < this.leaves.length; i++) {
    const leaf = this.leaves[i];
    leaf.update();

    if (leaf.mesh.position.y < -this.boundingBox.y * 0.5) 
      //leaf.hide();
      leaf.pos.y = this.boundingBox.y * 0.5;
  }
  
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}