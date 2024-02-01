let scene, camera, renderer, spheres, mouse, raycaster;
boundary = 8;
init();
animate();

function init() {
  // 基本場景設置
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  // 渲染器設置
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 創建球體
  spheres = [];
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  for (let i = 0; i < 10; i++) {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    );
    sphere.velocity = new THREE.Vector3(
      (Math.random() - 0.9) * 0.05,
      (Math.random() - 0.5) * 0.05,
      0
    );
    spheres.push(sphere);
    scene.add(sphere);
  }

  // 監聽滑鼠事件
  document.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onMouseMove(event) {
  // 計算滑鼠在場景中的位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  // 更新攝像機和渲染器大小
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // 更新射線與滑鼠位置
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    // 為球體添加漂浮動畫
    sphere.position.x +=
      Math.sin(Date.now() * 0.001 + sphere.position.x) * 0.01;
    sphere.position.y +=
      Math.cos(Date.now() * 0.001 + sphere.position.y) * 0.01;

    // 如果滑鼠接觸到球體，將球體擠開
    if (intersects.length > 0 && intersects[0].object === sphere) {
      sphere.position.x += (Math.random() - 0.5) * 0.2;
      sphere.position.y += (Math.random() - 0.5) * 0.2;
    }

    spheres.forEach((sphere) => {
      sphere.position.add(sphere.velocity);

      // 检测边界并反弹
      if (sphere.position.x > 2 || sphere.position.x < -2) {
        sphere.velocity.x *= -1;
      }
      if (sphere.position.y > 2 || sphere.position.y < -2) {
        sphere.velocity.y *= -1;
      }
    });
  }

  renderer.render(scene, camera);
  // 确保球体的速度不会因减速而停止
  sphere.velocity.multiplyScalar(0.999);
}
