/* Small mobile-menu water ornament. It animates only while the menu is open. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const nav = document.querySelector('.nav-links');
const toggle = document.querySelector('.menu-toggle');
if (nav && toggle && matchMedia('(max-width: 680px)').matches) {
  try {
    const stage = document.createElement('div');
    stage.className = 'nav-water-stage';
    stage.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'presentation');
    stage.append(canvas);
    nav.prepend(stage);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.z = 3.8;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    scene.add(new THREE.HemisphereLight(0xe7ffff, 0x285c6d, 2.15));
    const light = new THREE.DirectionalLight(0xffffff, 3.1);
    light.position.set(-2, 3, 4);
    scene.add(light);
    const rim = new THREE.PointLight(0x61e4ee, 8, 5);
    rim.position.set(1.1, 0.3, 1.5);
    scene.add(rim);

    const dropGroup = new THREE.Group();
    scene.add(dropGroup);
    const dropMaterial = new THREE.MeshPhysicalMaterial({ color: 0x86f0ee, emissive: 0x126c86, emissiveIntensity: 0.26, roughness: 0.1, metalness: 0.14, transparent: true, opacity: 0.93, clearcoat: 1 });
    const drop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 3), dropMaterial);
    drop.scale.set(0.77, 1.25, 0.58);
    dropGroup.add(drop);

    // A softly rippling ribbon gives the menu ornament a flowing-stream shape.
    const streamGeometry = new THREE.PlaneGeometry(1.25, 0.22, 40, 8);
    const streamPositions = streamGeometry.attributes.position;
    const streamBaseY = Float32Array.from({ length: streamPositions.count }, (_, i) => streamPositions.getY(i));
    const streamColors = [];
    for (let i = 0; i < streamPositions.count; i++) {
      const blend = (streamPositions.getX(i) + 0.625) / 1.25;
      const color = new THREE.Color().setRGB(0.22 + blend * 0.5, 0.92 + blend * 0.06, 0.96 + blend * 0.04);
      streamColors.push(color.r, color.g, color.b);
    }
    streamGeometry.setAttribute('color', new THREE.Float32BufferAttribute(streamColors, 3));
    const streamMaterial = new THREE.MeshPhysicalMaterial({ vertexColors: true, transparent: true, opacity: 0.78, roughness: 0.16, metalness: 0.06, clearcoat: 1, side: THREE.DoubleSide });
    const stream = new THREE.Mesh(streamGeometry, streamMaterial);
    stream.position.set(0, -0.34, 0.02);
    dropGroup.add(stream);

    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x9df5ee, transparent: true, opacity: 0.56 });
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.012, 8, 64), orbitMaterial);
    orbit.rotation.set(0.88, 0.2, -0.36);
    dropGroup.add(orbit);
    const orbitFar = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.007, 6, 64), new THREE.MeshBasicMaterial({ color: 0xf3d890, transparent: true, opacity: 0.6 }));
    orbitFar.rotation.set(1.3, -0.44, 0.2);
    dropGroup.add(orbitFar);

    const rippleMaterial = new THREE.MeshBasicMaterial({ color: 0x77e8ed, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const ripples = [0, 1].map((index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.009, 6, 48), rippleMaterial.clone());
      ring.scale.set(1.7, 0.48, 1);
      ring.position.set(0, -0.39, 0.01 - index * 0.01);
      dropGroup.add(ring);
      return ring;
    });

    const bubbles = [];
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb7ffff, emissive: 0x1d8ca0, emissiveIntensity: 0.18, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.8, clearcoat: 1 });
    for (let i = 0; i < 7; i++) {
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.012, 12, 10), bubbleMaterial);
      bubble.userData = { phase: i * 0.91, radius: 0.55 + (i % 2) * 0.1, speed: 0.6 + (i % 3) * 0.12 };
      scene.add(bubble);
      bubbles.push(bubble);
    }

    function resize() {
      const width = stage.clientWidth || 70;
      const height = stage.clientHeight || 76;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    function updateTheme() {
      const lightMode = document.documentElement.dataset.theme === 'light';
      dropMaterial.color.set(lightMode ? 0x137f96 : 0x86f0ee);
      dropMaterial.emissive.set(lightMode ? 0x55bdc8 : 0x126c86);
      streamMaterial.color.set(lightMode ? 0x70cedb : 0x8ff8f2);
      orbitMaterial.color.set(lightMode ? 0x399eaa : 0x9df5ee);
      bubbleMaterial.color.set(lightMode ? 0x80ced8 : 0xb7ffff);
      ripples.forEach(ring => ring.material.color.set(lightMode ? 0x359dab : 0x77e8ed));
    }
    updateTheme();
    new MutationObserver(updateTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let animation = 0;
    let isOpen = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    function draw() {
      animation = 0;
      if (!isOpen) return;
      const time = clock.getElapsedTime();
      dropGroup.rotation.y = Math.sin(time * 0.7) * 0.22;
      dropGroup.rotation.x = Math.cos(time * 0.52) * 0.08;
      dropGroup.position.y = Math.sin(time * 1.25) * 0.045;
      orbit.rotation.z += 0.004;
      orbitFar.rotation.z -= 0.0025;
      for (let i = 0; i < streamPositions.count; i++) {
        const x = streamPositions.getX(i);
        const row = Math.floor(i / 41);
        const phase = x * 6.5 - time * 2.1 + row * 0.35;
        streamPositions.setY(i, streamBaseY[i] + Math.sin(phase) * 0.035);
        streamPositions.setZ(i, Math.cos(phase * 0.72) * 0.035);
      }
      streamPositions.needsUpdate = true;
      streamGeometry.computeVertexNormals();
      ripples.forEach((ring, index) => {
        const pulse = (time * 0.34 + index * 0.5) % 1;
        ring.scale.set(1.7 + pulse * 0.9, 0.48 + pulse * 0.52, 1);
        ring.material.opacity = (1 - pulse) * 0.48;
      });
      bubbles.forEach(bubble => {
        const p = bubble.userData;
        const angle = p.phase + time * p.speed;
        bubble.position.set(Math.cos(angle) * p.radius, Math.sin(angle * 1.15) * 0.54, Math.sin(angle) * 0.14);
      });
      renderer.render(scene, camera);
      if (!reducedMotion) animation = requestAnimationFrame(draw);
    }
    function setOpen(open) {
      if (open === isOpen) return;
      isOpen = open;
      if (open) {
        resize();
        clock.start();
        draw();
      } else {
        if (animation) cancelAnimationFrame(animation);
        animation = 0;
        renderer.clear();
      }
    }
    new MutationObserver(() => setOpen(nav.classList.contains('is-open'))).observe(nav, { attributes: true, attributeFilter: ['class'] });
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') === 'true'));
    setOpen(nav.classList.contains('is-open'));
  } catch (error) {
    document.querySelector('.nav-water-stage')?.remove();
    console.info('Mobile menu 3D ornament unavailable; using the CSS fallback.', error);
  }
}
