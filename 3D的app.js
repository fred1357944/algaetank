let scene, camera, renderer, spheres, mouse, raycaster;
const boundary = 2; // 定义边界范围
init();
animate();

function init() {
  // 基本场景设置
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

  // 渲染器设置
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 创建球体
  spheres = [];
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff00 });
  for (let i = 0; i < 10; i++) {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    );
    sphere.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      0
    );
    sphere.isSqueezed = false;
    sphere.originalScale = new THREE.Vector3(1, 1, 1); // 存储原始大小
    spheres.push(sphere);
    scene.add(sphere);
  }

  // 监听鼠标事件
  document.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onMouseMove(event) {
  // 计算鼠标在场景中的位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  // 更新摄像机和渲染器大小
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // 更新射线与鼠标位置
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  spheres.forEach((sphere) => {
    // 更新球体位置
    sphere.position.add(sphere.velocity);

    // 边界检测和反弹
    let isSqueezedByBoundary = false;
    if (sphere.position.x > boundary || sphere.position.x < -boundary) {
      sphere.velocity.x *= -1;
      isSqueezedByBoundary = true;
    }
    if (sphere.position.y > boundary || sphere.position.y < -boundary) {
      sphere.velocity.y *= -1;
      isSqueezedByBoundary = true;
    }

    // 根据与鼠标的距离调整球体速度和形状
    const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 0);
    const distanceToMouse = mousePosition.distanceTo(sphere.position);
    const isIntersected = intersects.some(
      (intersect) => intersect.object === sphere
    );

    if (isIntersected && distanceToMouse < 1) {
      // 如果球体被鼠标接近
      const forceDirection = sphere.position
        .clone()
        .sub(mousePosition)
        .normalize();
      const forceMagnitude = Math.min(0.05 / (distanceToMouse + 0.1), 0.05); // 控制加速度
      sphere.velocity.add(forceDirection.multiplyScalar(forceMagnitude));
    }

    // 处理球体被挤压和恢复的形状
    if (isSqueezedByBoundary || (isIntersected && distanceToMouse < 1)) {
      if (!sphere.isSqueezed) {
        sphere.isSqueezed = true;
        sphere.scale.set(1.2, 0.8, 1); // 改变球体的形状
      }
    } else {
      // 如果球体不再被挤压，逐渐恢复形状
      sphere.scale.lerp(sphere.originalScale, 0.1);
      if (sphere.scale.distanceTo(sphere.originalScale) < 0.01) {
        sphere.isSqueezed = false;
      }
    }

    // 确保球体的速度不会因减速而停止
    sphere.velocity.multiplyScalar(0.999);
  });

  renderer.render(scene, camera);
}
