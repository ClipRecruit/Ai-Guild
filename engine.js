// ENGINE-001: Three.js first build. The original Canvas renderer remains a fallback.
// CDN is temporary until a verified local Three.js distribution can be bundled.
const status = document.getElementById('engineStatus');
const canvas = document.getElementById('engineWorld');
const sceneElement = canvas.closest('.scene');
const bridge = window.aiGuildBridge;
try {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:false});
  renderer.setSize(800,500,false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52,800/500,0.1,700);
  // Horizon near 25% from top. A horizontal plane and perspective camera,
  // not a painted sky rectangle.
  camera.position.set(0, 20, 36);
  camera.rotation.order='YXZ';
  camera.rotation.set(-0.095,0,0);
  const skyDay = new THREE.Color('#80c9f2');
  const skyNight = new THREE.Color('#172c52');
  scene.background=skyDay;
  const sun = new THREE.DirectionalLight(0xffffff,2.0);
  sun.position.set(-20,35,15);scene.add(sun);
  const ambient=new THREE.AmbientLight(0xffffff,1.2);scene.add(ambient);
  const texCanvas=document.createElement('canvas');texCanvas.width=256;texCanvas.height=256;
  const g=texCanvas.getContext('2d');g.fillStyle='#70af51';g.fillRect(0,0,256,256);
  let seed=41729;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const shades=['#589d48','#65a84b','#83ba5b','#92bd62','#4c9142'];
  for(let i=0;i<7200;i++){g.fillStyle=shades[Math.floor(rnd()*shades.length)];g.fillRect(Math.floor(rnd()*256),Math.floor(rnd()*256),1+Math.floor(rnd()*2),1+Math.floor(rnd()*2));}
  const grass=new THREE.CanvasTexture(texCanvas);grass.wrapS=grass.wrapT=THREE.RepeatWrapping;
  grass.repeat.set(20,20);grass.magFilter=THREE.NearestFilter;grass.minFilter=THREE.NearestFilter;
  grass.colorSpace=THREE.SRGBColorSpace;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshLambertMaterial({map:grass,side:THREE.DoubleSide}));
  ground.rotation.x=-Math.PI/2;ground.position.y=0;scene.add(ground);
  const tokens=new Map();
  const tokenGeo=new THREE.CylinderGeometry(.85,.85,.22,12);
  const ringGeo=new THREE.RingGeometry(1.08,1.23,24);
  function makeToken(agent){
    const root=new THREE.Group();
    const disc=new THREE.Mesh(tokenGeo,new THREE.MeshBasicMaterial({color:agent.color}));
    disc.position.y=.2;root.add(disc);
    const ring=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:'#ffe8a1',side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.34;root.add(ring);
    const label=document.createElement('canvas');label.width=256;label.height=64;
    const ctx=label.getContext('2d');ctx.font='bold 30px monospace';ctx.textAlign='center';
    ctx.fillStyle='#20172e';ctx.fillText(agent.name,129,39);
    ctx.fillStyle='#fff9d8';ctx.fillText(agent.name,127,37);
    const labelTexture=new THREE.CanvasTexture(label);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture,transparent:true,depthTest:false}));
    sprite.scale.set(7,1.75,1);sprite.position.y=2.5;root.add(sprite);
    root.userData={ring};scene.add(root);tokens.set(agent.id,root);
  }
  bridge.getAgents().forEach(makeToken);
  let clock=0,previous=performance.now();
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
  canvas.addEventListener('pointerdown',e=>{
    const rect=canvas.getBoundingClientRect();
    mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects([...tokens.values()],true);
    if(hits.length){let obj=hits[0].object;while(obj.parent&&!obj.userData.ring)obj=obj.parent;
      const match=[...tokens.entries()].find(([,root])=>root===obj);
      if(match)bridge.select(match[0]);
    }
  });
  sceneElement.classList.add('engine-active');
  window.aiGuildThreeActive=true;
  status.textContent='Three.js · ENGINE-001';
  function animate(now){
    const dt=Math.min(80,now-previous);previous=now;
    if(!bridge.getPaused())clock+=dt;
    const night=bridge.getNight();
    scene.background=night?skyNight:skyDay;
    ambient.intensity=night?.45:1.2;sun.intensity=night?.4:2;
    ground.material.color.set(night?'#678a73':'#ffffff');
    bridge.getAgents().forEach((a,i)=>{
      const root=tokens.get(a.id);
      const orbit=(clock/1000+i*5)/24*Math.PI*2;
      root.position.set(([-14,-6,5,-10,12][i])+Math.cos(orbit)*3,0,(-5+[0,0,0,10,10][i])+Math.sin(orbit)*2);
      root.userData.ring.visible=bridge.getSelected()===a.id;
    });
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
} catch (error) {
  status.textContent='Canvas fallback · Three.js unavailable';
  status.title=String(error);
  console.warn('ENGINE-001 fallback:',error);
}
