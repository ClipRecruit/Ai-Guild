// AI Guild WORLD-002 — first floating-island build.
// Existing UI, quests, storage, and Canvas fallback remain in index.html.
const status = document.getElementById('engineStatus');
const canvas = document.getElementById('engineWorld');
const sceneElement = canvas.closest('.scene');
const bridge = window.aiGuildBridge;
try {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
  const renderer = new THREE.WebGLRenderer({canvas,antialias:false,alpha:false});
  renderer.setSize(800,500,false);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const daySky=new THREE.Color('#a9c9d7'),nightSky=new THREE.Color('#172338');
  scene.background=daySky;
  const camera=new THREE.PerspectiveCamera(39,800/500,0.1,400);
  camera.position.set(65,68,83);camera.lookAt(0,-1,0);
  const ambient=new THREE.HemisphereLight('#f7e9cc','#536174',2.1);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff1c8',3.0);sun.position.set(-35,75,35);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;
  sun.shadow.normalBias=.035;scene.add(sun);
  // Deterministic pixel texture: same art on every page load.
  let seed=71244;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  function texture(base,colors,count){
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    x.fillStyle=base;x.fillRect(0,0,128,128);
    for(let i=0;i<count;i++){x.fillStyle=colors[Math.floor(rand()*colors.length)];x.fillRect(Math.floor(rand()*128),Math.floor(rand()*128),1+Math.floor(rand()*3),1+Math.floor(rand()*2));}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const grass=texture('#9dbd70',['#b4d181','#83a85c','#bcd98b','#759e59','#d0df9c'],2500);
  const stone=texture('#798083',['#606b72','#8e9390','#515f6a','#a1a198','#69777b'],3000);
  grass.repeat.set(4,4);stone.repeat.set(3,2);
  const topMaterial=new THREE.MeshLambertMaterial({map:grass});
  const cliffMaterial=new THREE.MeshLambertMaterial({map:stone});
  // Box materials: right, left, top, bottom, front, back.
  const sideMaterials=[cliffMaterial,cliffMaterial,topMaterial,cliffMaterial,cliffMaterial,cliffMaterial];
  const island=new THREE.Group();scene.add(island);
  function block(w,d,top,depth,x,z){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,depth,d),sideMaterials);
    mesh.position.set(x,top-depth/2,z);mesh.castShadow=true;mesh.receiveShadow=true;
    island.add(mesh);return mesh;
  }
  // Three stacked plateaus; exposed rock sides and underside make the island read as a floating cube.
  block(48,48,0,11,0,0);
  block(34,34,2.5,2.5,-2,-2);
  block(20,20,5,2.5,-5,-5);
  // Subtle dark trim at each grassy edge.
  const trimMaterial=new THREE.MeshBasicMaterial({color:'#6d9253'});
  for(const [w,d,y,x,z] of [[48,48,0,0,0],[34,34,2.5,-2,-2],[20,20,5,-5,-5]]){
    const trim=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.32,d+.12),trimMaterial);
    trim.position.set(x,y-.2,z);island.add(trim);
  }
  // Walkable positions correspond to terrace levels; independent from quest/save data.
  const slots=[
    {x:-7,z:-8,y:5}, {x:2,z:-8,y:5}, {x:-8,z:3,y:2.5},
    {x:12,z:8,y:2.5}, {x:17,z:17,y:0}
  ];
  const tokens=new Map(),selectables=[];
  const tokenGeo=new THREE.CylinderGeometry(.95,.95,.34,12);
  const ringGeo=new THREE.RingGeometry(1.15,1.42,32);
  function makeToken(a,i){
    const root=new THREE.Group();
    const color=new THREE.Color(a.color||'#d5b77a');
    const body=new THREE.Mesh(tokenGeo,new THREE.MeshLambertMaterial({color}));
    body.position.y=.25;body.castShadow=true;root.add(body);
    const ring=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:'#ffe6a1',side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.48;root.add(ring);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=64;
    const ctx=labelCanvas.getContext('2d');ctx.font='bold 29px monospace';ctx.textAlign='center';
    ctx.fillStyle='#233040';ctx.fillText(a.name,130,40);ctx.fillStyle='#fff3d0';ctx.fillText(a.name,128,38);
    const map=new THREE.CanvasTexture(labelCanvas);
    const name=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false}));
    name.position.y=2.8;name.scale.set(7,1.75,1);root.add(name);
    root.userData={id:a.id,ring,slot:slots[i]||slots[0]};
    root.position.set(root.userData.slot.x,root.userData.slot.y,root.userData.slot.z);
    island.add(root);tokens.set(a.id,root);selectables.push(body);
  }
  bridge.getAgents().forEach(makeToken);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  canvas.addEventListener('pointerdown',e=>{
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(selectables,false);
    if(hits.length)bridge.select(hits[0].object.parent.userData.id);
  });
  sceneElement.classList.add('engine-active');window.aiGuildThreeActive=true;
  status.textContent='Three.js · WORLD-002';
  let last=performance.now(),clock=0;
  function frame(now){
    const dt=Math.min(80,now-last);last=now;if(!bridge.getPaused())clock+=dt;
    const night=bridge.getNight();
    scene.background=night?nightSky:daySky;
    ambient.intensity=night?.7:2.1;sun.intensity=night?.55:3;
    for(const [id,root] of tokens){
      const slot=root.userData.slot;
      root.position.x=slot.x+Math.sin(clock/1700+slot.z)*.42;
      root.position.z=slot.z+Math.cos(clock/1900+slot.x)*.42;
      root.userData.ring.visible=bridge.getSelected()===id;
    }
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}catch(error){
  status.textContent='Canvas fallback · Three.js unavailable';status.title=String(error);
  console.warn('WORLD-002 fallback:',error);
}
