/* Independent, light-weight Three.js models for the product cards. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const cards = [...document.querySelectorAll('.product-card')];
if (cards.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const entries = [];
  const colors = [0xe6fbfc, 0xeaeaff, 0xf8e8da];
  cards.forEach((card, index) => {
    const holder = document.createElement('div');
    holder.className = 'mini-three';
    holder.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    holder.append(canvas);
    card.prepend(holder);

    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
      camera.position.set(0, 0, 5.4);
      scene.add(new THREE.HemisphereLight(0xeaffff, 0x446879, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(-3, 4, 5);
      scene.add(key);
      const rim = new THREE.PointLight(index === 2 ? 0xffc98b : 0x63e7ed, 18, 8);
      rim.position.set(2, 1.2, 2);
      scene.add(rim);

      const model = new THREE.Group();
      scene.add(model);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: colors[index], roughness: 0.19, metalness: 0.06, clearcoat: 0.9, clearcoatRoughness: 0.12 });
      const trimMaterial = new THREE.MeshStandardMaterial({ color: index === 2 ? 0xe6ad76 : 0x76cbd2, roughness: 0.22, metalness: 0.45 });
      const screenMaterial = new THREE.MeshPhysicalMaterial({ color: 0x9cf1ed, emissive: 0x167d8c, emissiveIntensity: 0.35, roughness: 0.12, clearcoat: 1 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.72, 3, 5, 2), bodyMaterial);
      model.add(body);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.12, 0.7), trimMaterial);
      lid.position.y = 0.91;
      model.add(lid);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.14, 0.045), new THREE.MeshPhysicalMaterial({ color: 0xcffafa, transparent: true, opacity: 0.48, roughness: 0.14, clearcoat: 1 }));
      face.position.set(0, 0.05, 0.375);
      model.add(face);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.07), screenMaterial);
      screen.position.set(0, 0.13, 0.42);
      model.add(screen);
      const drop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 2), new THREE.MeshPhysicalMaterial({ color: 0x16a9c1, emissive: 0x08738c, emissiveIntensity: 0.24, roughness: 0.1, metalness: 0.17, clearcoat: 1 }));
      drop.scale.set(0.74, 1.22, 0.5);
      drop.position.set(0, 0.14, 0.48);
      model.add(drop);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.58), trimMaterial);
      base.position.y = -0.96;
      model.add(base);
      const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 16), trimMaterial);
      tap.position.set(0.14, -0.52, 0.49);
      model.add(tap);
      const water = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), screenMaterial);
      water.position.set(0.14, -0.75, 0.5);
      model.add(water);
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: 0x77dfe3, transparent: true, opacity: 0.55 }));
      orbit.rotation.set(0.9, 0.24, -0.25);
      model.add(orbit);

      const resize = () => {
        const width = holder.clientWidth || 140, height = holder.clientHeight || 140;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(holder);
      resize();
      const entry = { renderer, scene, camera, model, drop, orbit, card, resizeObserver, pointerX: 0, pointerY: 0, hover: false, index };
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        entry.pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        entry.pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
      }, { passive: true });
      card.addEventListener('pointerenter', () => { entry.hover = true; });
      card.addEventListener('pointerleave', () => { entry.hover = false; entry.pointerX = 0; entry.pointerY = 0; });
      entries.push(entry);
    } catch (error) {
      holder.remove();
      console.warn('Product 3D preview unavailable; keeping the product photos visible.', error);
    }
  });

  const visible = new Set();
  const visibilityObserver = new IntersectionObserver(changes => changes.forEach(change => {
    if (change.isIntersecting) visible.add(change.target);
    else visible.delete(change.target);
  }), { rootMargin: '100px' });
  entries.forEach(entry => visibilityObserver.observe(entry.card));
  const clock = new THREE.Clock();
  function draw() {
    const t = clock.getElapsedTime();
    entries.forEach(entry => {
      if (!visible.has(entry.card)) return;
      const { model, drop, orbit } = entry;
      const rate = entry.hover ? 0.1 : 0.028;
      model.rotation.y += ((entry.pointerX * 0.6 + Math.sin(t * 0.42 + entry.index) * 0.07) - model.rotation.y) * rate;
      model.rotation.x += ((-entry.pointerY * 0.24) - model.rotation.x) * rate;
      model.position.y = Math.sin(t * 1.2 + entry.index) * 0.045;
      orbit.rotation.y += entry.hover ? 0.012 : 0.003;
      drop.scale.y = 1.22 + Math.sin(t * 2.5 + entry.index) * 0.07;
      entry.renderer.render(entry.scene, entry.camera);
    });
    requestAnimationFrame(draw);
  }
  draw();
}
