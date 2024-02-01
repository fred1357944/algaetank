let scene, camera, renderer, instancedSpheres, mouse, raycaster;
const boundarySize = { x: 10, y: 10, z: 2 };
const instanceCount = 10000; // 球体的数量
let mouseInfluenceRadius = 5; // 鼠标影响圆的初始半径
let mouseInfluenceRadiusDelta = 0.9; // 半径的变化量

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
  const ambientLight = new THREE.AmbientLight(0xddffdd, 0.2); // 色彩，强度
  scene.add(ambientLight);

  pointLight = new THREE.PointLight(0xffffff, 2, 20);
  scene.add(pointLight);
  pointLight.decay = 6; // 衰减
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  const radius = 0.01; // 基础半径
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff00,
    opacity: 0.9,
    transparent: true,
    roughness: 0.9,
    metalness: 0.9,
    shininess: 90
  });

  instancedSpheres = new THREE.InstancedMesh(geometry, material, instanceCount);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  for (let i = 0; i < instanceCount; i++) {
    // 随机位置
    position.x = THREE.MathUtils.randFloatSpread(boundarySize.x);
    position.y = THREE.MathUtils.randFloatSpread(boundarySize.y);
    position.z = THREE.MathUtils.randFloatSpread(boundarySize.z);

    // 随机大小
    const randomScale = THREE.MathUtils.randFloat(0.01, 0.02) / radius;
    scale.set(randomScale, randomScale, randomScale);

    matrix.compose(position, quaternion, scale);
    instancedSpheres.setMatrixAt(i, matrix);
  }

  scene.add(instancedSpheres);

  /*
  const boundaryGeometry = new THREE.BoxGeometry(6, 20, 4); // XYZ维度的大小
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true // 仅显示线框
  });
  const boundaryBox = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
  scene.add(boundaryBox);
本來這一段是有中間的 X 面結構線條 */

  // 创建发光效果的边界盒子
  /*  const glowBoundaryGeometry = new THREE.BoxGeometry(
    boundarySize.x + 0.2, // 稍大一点以创建发光边框效果
    boundarySize.y + 0.2,
    boundarySize.z + 0.2
  );
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0
  });
  const glowBoundaryBox = new THREE.Mesh(glowBoundaryGeometry, glowMaterial);
  scene.add(glowBoundaryBox); */

  // 现有的边界盒子 (BoundaryBox)
  const boundaryGeometry = new THREE.BoxGeometry(
    boundarySize.x,
    boundarySize.y,
    boundarySize.z
  );
  const edges = new THREE.EdgesGeometry(boundaryGeometry);
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

  // const material = new THREE.MeshBasicMaterial({ color: 0xff00 });
  for (let i = 0; i < 1000; i++) {
    const radius = THREE.MathUtils.randFloat(0.03, 0.02); // 生成0.3到0.8之间的随机半径
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00,
      opacity: 0.6,
      transparent: true,
      roughness: 0.9,
      metalness: 0.9,
      shininess: 80 // 调整这个值以改变高光效果的强度
      // 其他可调整的属性...
    });
    /* const sphere = new THREE.Mesh(geometry, material);
    // 初始化球体位置
    sphere.position.set(
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    ); */
    const sphere = new THREE.Mesh(geometry, material);
    // 初始化球体位置
    sphere.position.set(
      THREE.MathUtils.randFloatSpread(boundarySize.x), // 在边界内随机分布
      THREE.MathUtils.randFloatSpread(boundarySize.y),
      THREE.MathUtils.randFloatSpread(boundarySize.z)
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

  // 更新鼠标三维坐标
  mouse.unproject(camera);
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
  mouseInfluenceRadius += mouseInfluenceRadiusDelta;
  if (mouseInfluenceRadius > 2 || mouseInfluenceRadius < 1) {
    mouseInfluenceRadiusDelta *= -1; // 反转半径变化方向
  }

  // 更新射线与鼠标位置
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  instancedSpheres.instanceMatrix.needsUpdate = true; // 更新实例化网格的变换矩阵
  const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
  for (let i = 0; i < instanceCount; i++) {
    const matrix = new THREE.Matrix4();
    instancedSpheres.getMatrixAt(i, matrix);

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    matrix.compose(position, quaternion, scale);
    instancedSpheres.setMatrixAt(i, matrix);
  }

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
    const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    const distanceToMouse = mouse3D.distanceTo(sphere.position);

    // 根据与鼠标的距离调整球体速度和形状
    if (distanceToMouse < mouseInfluenceRadius) {
      // 提高这个值来增加鼠标影响的范围
      const forceMagnitude = Math.min(0.1 / (distanceToMouse + 1), 0.1); // 根据距离计算力的大小
      const forceDirection = sphere.position.clone().sub(mouse3D).normalize(); // 计算从球体指向鼠标的方向
      sphere.velocity.add(forceDirection.multiplyScalar(forceMagnitude)); // 应用力改变球体的速度
    }

    // 确保球体的速度不会因减速而停止
    if (sphere.velocity.length() < sphere.initialVelocity.length() / 1.1) {
      sphere.velocity.setLength(sphere.initialVelocity.length() / 1.1);
    }

    // 当球体距离摄像机过远时，给予球体一个向摄像机方向的力
    const distanceToCamera = sphere.position.distanceTo(camera.position);

    if (distanceToCamera > 15.6) {
      // 這裡是距離鏡頭的位置，可以去讓反彈速度增加亂數
      const returnForceDirection = camera.position
        .clone()
        .sub(sphere.position)
        .normalize();
      const returnForceMagnitude = 0.001; // 反彈速度大小，根据需要调整
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

      const mouseDirection = new THREE.Vector3(mouse.x, mouse.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();

      // 获取从相机位置到球体中心的向量
      const toSphere = sphere.position.clone().sub(camera.position);

      // 计算鼠标射线与到球体中心向量之间的夹角
      const angle = mouseDirection.angleTo(toSphere);

      // 如果射线与球体中心方向基本垂直，则跳过（避免除以0或极小数导致的计算错误）
      if (Math.abs(angle) < 0.01) return;

      // 计算射线与球体中心连线的垂直距离
      const distanceToMouse = toSphere.length() * Math.sin(angle);
      //原本的 滑鼠影響範圍 const distanceToMouse = intersectPoint.distanceTo(sphere.position);
      if (distanceToMouse < 30) {
        // 提高这个值来增加鼠标影响的范围
        // 根据距离计算力的大小
        const forceMagnitude = Math.min(0.1 / (distanceToMouse + 1), 0.01); //0.00X是力道
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

    pointLight.position.set(pos.x, pos.y, pos.z);
  }
}
