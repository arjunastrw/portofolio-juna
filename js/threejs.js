/* ========================================
   THREE.JS — 3D Scene Background
   Uses App.mouse for interaction, App.renderLoop for animation.
   ======================================== */
window.App = window.App || {};

App.threeScene = {
  init() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this._camera.position.z = 8;

    this._addLights();
    this._addGeometry();
    this._addFloaters();
    this._bindResize();
    App.renderLoop.add(this._tick.bind(this));
  },

  _addLights() {
    const ambient = new THREE.AmbientLight(0x2A1B38, 0.5);
    this._scene.add(ambient);

    this._light1 = new THREE.PointLight(0x00E5FF, 0.8, 20);
    this._light1.position.set(3, 2, 4);
    this._scene.add(this._light1);

    this._light2 = new THREE.PointLight(0xF5A623, 0.5, 15);
    this._light2.position.set(-3, -2, 2);
    this._scene.add(this._light2);

    this._light3 = new THREE.PointLight(0x6B3F7A, 0.4, 18);
    this._light3.position.set(0, 3, -2);
    this._scene.add(this._light3);
  },

  _addGeometry() {
    this._mainGroup = new THREE.Group();
    this._scene.add(this._mainGroup);

    // Icosahedron wireframe
    const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x6B3F7A, wireframe: true, emissive: 0x2A1B38,
      emissiveIntensity: 0.4, transparent: true, opacity: 0.35,
    });
    this._mainGroup.add(new THREE.Mesh(icoGeo, icoMat));

    // Torus knot
    const torusGeo = new THREE.TorusKnotGeometry(0.7, 0.18, 100, 20);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.6,
      metalness: 0.1, roughness: 0.5, wireframe: true, transparent: true, opacity: 0.25,
    });
    this._torusMesh = new THREE.Mesh(torusGeo, torusMat);
    this._mainGroup.add(this._torusMesh);

    // Outer ring
    const ringGeo = new THREE.TorusGeometry(2.0, 0.03, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xF5A623, emissive: 0xF5A623, emissiveIntensity: 0.5,
      metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.5,
    });
    this._ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this._ringMesh.rotation.x = Math.PI / 2;
    this._mainGroup.add(this._ringMesh);

    // Second tilted ring
    const ring2Geo = new THREE.TorusGeometry(1.7, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xFF0055, emissive: 0xFF0055, emissiveIntensity: 0.4,
      metalness: 0.3, roughness: 0.3, transparent: true, opacity: 0.35,
    });
    this._ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    this._ring2Mesh.rotation.x = Math.PI / 3;
    this._ring2Mesh.rotation.y = Math.PI / 4;
    this._mainGroup.add(this._ring2Mesh);
  },

  _addFloaters() {
    this._floaters = [];
    const geos = [
      new THREE.OctahedronGeometry(0.15),
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.TetrahedronGeometry(0.15),
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.DodecahedronGeometry(0.12),
      new THREE.ConeGeometry(0.12, 0.25, 8),
    ];

    for (let i = 0; i < App.config.FLOATER_COUNT; i++) {
      const geo = geos[Math.floor(Math.random() * geos.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.55, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(Math.random() * 0.15 + 0.55, 0.8, 0.2),
        emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.6,
        wireframe: Math.random() > 0.5, transparent: true,
        opacity: 0.15 + Math.random() * 0.25,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / App.config.FLOATER_COUNT) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 2.5;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3.5,
        Math.sin(angle) * radius
      );
      mesh.userData = {
        baseX: mesh.position.x,
        baseY: mesh.position.y,
        baseZ: mesh.position.z,
        speed: 0.3 + Math.random() * 0.7,
        amplitude: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      };
      this._floaters.push(mesh);
      this._scene.add(mesh);
    }
  },

  _bindResize() {
    window.addEventListener('resize', () => {
      this._renderer.setSize(window.innerWidth, window.innerHeight);
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
    });
  },

  _tick(time) {
    const t = time * 0.001;
    const progress = 1 - (t - Math.floor(t)); // smooth increment

    // Mouse influence on main group
    this._mainGroup.rotation.x += (App.mouse.targetY * 0.5 - this._mainGroup.rotation.x) * 0.03;
    this._mainGroup.rotation.y += (App.mouse.targetX * 0.8 - this._mainGroup.rotation.y) * 0.03;
    this._mainGroup.rotation.y += 0.001;
    this._mainGroup.rotation.x += 0.0005;

    // Torus knot spins
    this._torusMesh.rotation.x += 0.002;
    this._torusMesh.rotation.y += 0.003;

    // Ring oscillation
    this._ringMesh.rotation.z += 0.001;
    this._ring2Mesh.rotation.z -= 0.0008;

    // Floaters
    this._floaters.forEach(f => {
      const d = f.userData;
      f.position.x = d.baseX + Math.sin(t * d.speed + d.offset) * d.amplitude;
      f.position.y = d.baseY + Math.cos(t * d.speed * 0.7 + d.offset) * d.amplitude;
      f.position.z = d.baseZ + Math.cos(t * d.speed * 0.5 + d.offset) * d.amplitude;
      f.rotation.x += 0.003;
      f.rotation.y += 0.005;
    });

    // Light animation
    this._light1.intensity = 0.6 + Math.sin(t * 1.5) * 0.2;
    this._light2.intensity = 0.4 + Math.cos(t * 1.3) * 0.2;

    this._renderer.render(this._scene, this._camera);
  },
};
