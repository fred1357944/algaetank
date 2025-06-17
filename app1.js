let scene, camera, renderer, spheres, mouse, raycaster, pointLight;
const boundary = 20; // 定义边界范围
const boundarySize = { x: 6, y: 20, z: 4 };
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
  camera.position.z = 15;
  // 环境光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // 色彩，强度
  scene.add(ambientLight);

  pointLight = new THREE.PointLight(0xffffff, 1, 100);
  scene.add(pointLight);
  pointLight.decay = 3; // 衰减
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  /*
  const boundaryGeometry = new THREE.BoxGeometry(6, 20, 4); // XYZ维度的大小
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true // 仅显示线框
  });
  const boundaryBox = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
  scene.add(boundaryBox);
本來這一段是有中間的 X 面結構線條 */

  const boundaryGeometry = new THREE.BoxGeometry(
    boundarySize.x,
    boundarySize.y,
    boundarySize.z
  );
  const edges = new THREE.EdgesGeometry(boundaryGeometry); // 创建一个只包含边缘的几何体
  const boundaryMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const boundaryBox = new THREE.LineSegments(edges, boundaryMaterial);
  scene.add(boundaryBox);
  // 渲染器设置
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // 应用色调映射
  renderer.toneMappingExposure = 1.0; // 调整曝光
  document.body.appendChild(renderer.domElement);

  // 创建球体
  spheres = [];
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff00, // 颜色
    opacity: 0.9, // 透明度
    transparent: true, // 是否透明
    shininess: 80 // 光泽度
  });
  // const material = new THREE.MeshBasicMaterial({ color: 0xff00 });
  for (let i = 0; i < 50; i++) {
    const radius = 0.3 + Math.random() * 0.5; // 半径在 0.5 到 1 之间随机
    const geometry = new THREE.SphereGeometry(radius, 32, 32); // 使用随机半径
    const sphere = new THREE.Mesh(geometry, material);
    // 初始化球体位置
    sphere.position.set(
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    );
    // 初始化速度，并存储初始速度
    const initialVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      0
    );
    sphere.velocity = initialVelocity.clone();
    sphere.initialVelocity = initialVelocity;
    spheres.push(sphere);
    scene.add(sphere);
  }

  // 监听鼠标事件
  document.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onMouseMove(event) {
  // 将屏幕坐标转换为三维空间中的坐标
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 鼠标坐标已经在 -1 到 1 的范围内，不需要 unproject
}

function onWindowResize() {
  // 更新摄像机和渲染器大小
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  updatePointLightPosition();
  // 更新射线与鼠标位置
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  spheres.forEach((sphere) => {
    // 更新球体位置
    sphere.position.add(sphere.velocity);

    // 边界检测和反弹，确保球体在 boundaryBox 内
    if (
      sphere.position.x > boundarySize.x / 2 ||
      sphere.position.x < -boundarySize.x / 2
    ) {
      sphere.velocity.x *= -1; // 反转球体在 x 轴上的速度
    }
    if (
      sphere.position.y > boundarySize.y / 2 ||
      sphere.position.y < -boundarySize.y / 2
    ) {
      sphere.velocity.y *= -1; // 反转球体在 y 轴上的速度
    }
    if (
      sphere.position.z > boundarySize.z / 2 ||
      sphere.position.z < -boundarySize.z / 2
    ) {
      sphere.velocity.z *= -1; // 反转球体在 z 轴上的速度
    }

    // 确保球体的速度不会因减速而停止
    if (sphere.velocity.length() < sphere.initialVelocity.length() / 3) {
      sphere.velocity.setLength(sphere.initialVelocity.length() / 3);
    }

    // 当球体距离摄像机过远时，给予球体一个向摄像机方向的力
    const distanceToCamera = sphere.position.distanceTo(camera.position);
    if (distanceToCamera > 19) {
      const returnForceDirection = camera.position
        .clone()
        .sub(sphere.position)
        .normalize();
      const returnForceMagnitude = 0.05; // 回归力大小，根据需要调整
      sphere.velocity.add(
        returnForceDirection.multiplyScalar(returnForceMagnitude)
      );
    }

    // 根据与鼠标的距离调整球体速度和形状
    const isIntersected = intersects.some(
      (intersect) => intersect.object === sphere
    );
    if (isIntersected) {
      // 获取交点和计算从球体指向交点的方向
      const intersectPoint = raycaster.ray.at(intersects[0].distance);
      const forceDirection = sphere.position
        .clone()
        .sub(intersectPoint)
        .normalize();

      // 计算交点到球体中心的距离
      const distanceToMouse = intersectPoint.distanceTo(sphere.position);
      if (distanceToMouse < 1) {
        // 提高这个值来增加鼠标影响的范围
        // 根据距离计算力的大小
        const forceMagnitude = Math.min(0.1 / (distanceToMouse + 1), 0.005);
        // 应用力改变球体的速度
        sphere.velocity.add(forceDirection.multiplyScalar(forceMagnitude));
      }
    }

    // 如果球体与摄像机之间的距离太近，反转球体的z轴速度
    if (sphere.position.z > camera.position.z - 1) {
      sphere.velocity.z *= -1;
    }
    // 确保球体的速度不会因减速而停止
    sphere.velocity.multiplyScalar(0.999);
  });

  renderer.render(scene, camera);

  function updatePointLightPosition() {
    // 需要将鼠标坐标转换为场景中的坐标
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    // 更新点光源位置
    pointLight.position.set(pos.x, pos.y, pos.z);
  }
}
