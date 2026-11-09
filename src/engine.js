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
  const daySky=new THREE.Color('#8ebbd9'),nightSky=new THREE.Color('#172338');
  scene.background=daySky;
  const camera=new THREE.PerspectiveCamera(39,800/500,0.1,400);
  camera.position.set(46,49,59);camera.lookAt(0,-1,0);
  const ambient=new THREE.HemisphereLight('#f7e9cc','#485466',1.55);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#ffe7ad',3.4);sun.position.set(-40,75,25);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;
  sun.shadow.normalBias=.035;sun.shadow.bias=-0.00015;sun.shadow.radius=3;scene.add(sun);
  // WORLD-002.2: deliberately clustered pixel-art textures, not uniform noise.
  let seed=71244;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const choice=a=>a[Math.floor(rand()*a.length)];
  function paintTexture(type){
    const c=document.createElement('canvas');c.width=c.height=256;
    const p=c.getContext('2d');p.imageSmoothingEnabled=false;
    const rect=(x,y,w,h,color)=>{p.fillStyle=color;p.fillRect(Math.round(x),Math.round(y),w,h)};
    if(type==='grass'){
      rect(0,0,256,256,'#8ebc61');
      // Organic patch clusters have a coherent footprint and a lighter facing edge.
      for(let n=0;n<235;n++){
        const x=rand()*256,y=rand()*256,r=3+rand()*13;
        const base=choice(['#7cac55','#a6c96c','#85b459','#9cc566','#b1cf74','#91b45a']);
        for(let k=0;k<6;k++)rect(x+(rand()-.5)*r*1.8,y+(rand()-.5)*r,2+rand()*6,2+rand()*3,base);
      }
      for(let n=0;n<690;n++){
        const x=rand()*256,y=rand()*256;
        const dark=choice(['#5e9447','#6f9e4b','#76a94e']);
        rect(x,y+2,2,2,dark);
        rect(x+1,y,1,3,choice(['#d2de8a','#bed97c','#a9d271']));
        if(rand()<.3)rect(x+3,y+1,1,2,'#e1e69c');
      }
      for(let n=0;n<42;n++){
        const x=rand()*256,y=rand()*256;
        rect(x,y,3+rand()*4,2,'#c9b57a');rect(x+2,y+2,4,1,'#9f9e60');
      }
    }else{
      rect(0,0,256,256,'#777b83');
      // Staggered masonry-like strata, cracks and manually placed highlights.
      const heights=[0,27,55,83,112,140,169,198,228,256];
      const light=['#a6a39a','#9a9c99','#aaa796','#8f9794'];
      const dark=['#485768','#536071','#626875','#555d69'];
      // Stone masses are painted as recognizable irregular pixel clusters,
      // with separate lit faces, shadow seams, chips and cracks.
      for(let row=0;row<heights.length-1;row++){
        const y=heights[row],h=heights[row+1]-y;
        let x=-40-(row%2)*23;
        while(x<260){
          const w=32+Math.floor(rand()*30);
          const x0=Math.round(x),y0=y+2;
          const main=choice(['#81868b','#8c8d8b','#747d87','#99958c','#7c8587']);
          rect(x0+3,y0+2,w-7,h-7,main);
          // Irregular upper lip and chamfered corners.
          rect(x0+7,y0,w-14,3,choice(['#b5ab98','#c2b39a','#a7a59b']));
          rect(x0+4,y0+3,4,5,'#a6a399');
          rect(x0+w-9,y0+3,5,4,'#636d77');
          rect(x0+4,y0+6,3,h-14,'#a8a398');
          rect(x0+w-7,y0+7,4,h-12,'#535f6e');
          rect(x0+7,y0+h-10,w-14,4,'#596571');
          // Broad painted shadow patch, not uniform pixel noise.
          if(rand()<.85){
            const px=x0+10+rand()*(w-24),py=y0+7+rand()*(h-19);
            rect(px,py,7+rand()*10,3+rand()*5,choice(['#6c737b','#737981','#9c958b']));
            rect(px+2,py+3,4+rand()*7,2,'#5e6a75');
          }
          // Pixel-staircase fractures inside individual stones.
          if(rand()<.72){
            const cx=x0+10+rand()*(w-21),cy=y0+8+rand()*(h-17);
            rect(cx,cy,2,5,'#4b5967');rect(cx+2,cy+4,5,2,'#4b5967');
            rect(cx+6,cy+5,2,4,'#4b5967');
            rect(cx-2,cy-1,2,4,'#aaa397');
          }
          if(rand()<.30){
            rect(x0+8+rand()*(w-17),y0+3,5,3,'#79916b');
          }
          x+=w;
        }
        rect(0,y,256,2,'#4b5865');
        for(let j=0;j<14;j++){
          const px=rand()*256,py=y+4+rand()*(h-8);
          rect(px,py,2+rand()*4,1,choice(['#a7a296','#5d6873','#c0b29a']));
        }
      }
      for(let n=0;n<170;n++){
        const x=rand()*256,y=rand()*256;
        rect(x,y,2+rand()*3,1,choice(['#b4aa9b','#5b6970','#999c93']));
      }
    }
    const t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.magFilter=THREE.NearestFilter;
    t.minFilter=THREE.NearestMipmapNearestFilter;
    t.colorSpace=THREE.SRGBColorSpace;
    t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  const grass=paintTexture('grass'),stone=paintTexture('stone');
  grass.repeat.set(4,4);stone.repeat.set(1.6,1.3);
  const topMaterial=new THREE.MeshLambertMaterial({map:grass});
  const cliffMaterial=new THREE.MeshLambertMaterial({map:stone});
  // Box materials: right, left, top, bottom, front, back.
  const sideMaterials=[cliffMaterial,cliffMaterial,topMaterial,cliffMaterial,cliffMaterial,cliffMaterial];
  const island=new THREE.Group();scene.add(island);
  // Deterministic rock strata and small protrusions on the exposed island walls.
  const rockMaterials=['#5a686a','#87908b','#a19f91','#4d5b63','#697476'].map(color=>new THREE.MeshLambertMaterial({color}));
  function cliffDetails(w,d,top,depth,x,z){
    const lines=Math.max(2,Math.round(depth*1.7));
    for(let layer=0;layer<lines;layer++){
      const y=top-depth*(layer+.45)/lines;
      for(let side=0;side<4;side++){
        const horizontal=side<2;
        const span=horizontal?w:d;
        const count=Math.ceil(span/3.5);
        for(let i=0;i<count;i++){
          if(rand()<.2)continue;
          const length=1.1+rand()*3.5;
          const thickness=.07+rand()*.13;
          const ledge=new THREE.Mesh(new THREE.BoxGeometry(horizontal?length:thickness,.06+rand()*.13,horizontal?thickness:length),rockMaterials[Math.floor(rand()*rockMaterials.length)]);
          const along=(i+.3+rand()*.4)/count-.5;
          ledge.position.set(horizontal?x+along*w:x+(side===2?-w/2-.025:w/2+.025),y,horizontal?z+(side===0?-d/2-.025:d/2+.025):z+along*d);
          island.add(ledge);
        }
      }
    }
  }
  function block(w,d,top,depth,x,z){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,depth,d),sideMaterials);
    mesh.position.set(x,top-depth/2,z);mesh.castShadow=true;mesh.receiveShadow=true;
    island.add(mesh);cliffDetails(w,d,top,depth,x,z);return mesh;
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
  // Small shaded crevice plates and moss seams create cliff-face depth.
  const seamsGeo=new THREE.BoxGeometry(.7,.18,.12);
  const seamsMat=new THREE.MeshLambertMaterial({color:'#56676a'});
  const seams=new THREE.InstancedMesh(seamsGeo,seamsMat,420);
  const seamDummy=new THREE.Object3D();
  const faces=[{w:48,d:48,t:0,depth:11,x:0,z:0},{w:34,d:34,t:2.5,depth:2.5,x:-2,z:-2},{w:20,d:20,t:5,depth:2.5,x:-5,z:-5}];
  for(let i=0;i<420;i++){
    const f=faces[i%3],face=Math.floor(rand()*4),along=(rand()-.5);
    const yy=f.t-.45-rand()*(f.depth-.7);
    let xx=f.x,zz=f.z,rotation=0;
    if(face===0){xx+=along*f.w;zz-=f.d/2+.09;}
    if(face===1){xx+=along*f.w;zz+=f.d/2+.09;}
    if(face===2){xx-=f.w/2+.09;zz+=along*f.d;rotation=Math.PI/2;}
    if(face===3){xx+=f.w/2+.09;zz+=along*f.d;rotation=Math.PI/2;}
    seamDummy.position.set(xx,yy,zz);seamDummy.rotation.set(0,rotation,0);
    seamDummy.scale.set(.55+rand()*1.9,.6+rand()*.9,1);
    seamDummy.updateMatrix();seams.setMatrixAt(i,seamDummy.matrix);
    seams.setColorAt(i,new THREE.Color(choice(['#465667','#576671','#9d9a8c','#74846c','#4e5d68'])));
  }
  seams.instanceMatrix.needsUpdate=true;island.add(seams);
  // Surface dressing uses instanced meshes: few draw calls on iPad.
  // Keep the buildable terraces and their geometry unchanged.
  const plateaus=[
    {w:48,d:48,x:0,z:0,y:0},
    {w:34,d:34,x:-2,z:-2,y:2.5},
    {w:20,d:20,x:-5,z:-5,y:5}
  ];
  const occupiedByHigher=(x,z,level)=>{
    for(let j=level+1;j<plateaus.length;j++){
      const p=plateaus[j];
      if(Math.abs(x-p.x)<p.w/2+.35 && Math.abs(z-p.z)<p.d/2+.35)return true;
    }
    return false;
  };
  const grassBladeMat=new THREE.MeshLambertMaterial({color:'#6d9e48',side:THREE.DoubleSide});
  const bladeGeo=new THREE.PlaneGeometry(.16,.38);
  const bladeCount=1450;
  const blades=new THREE.InstancedMesh(bladeGeo,grassBladeMat,bladeCount);
  const dummy=new THREE.Object3D();
  for(let i=0;i<bladeCount;i++){
    let p,x,z,level,attempts=0;
    do{
      level=Math.floor(rand()*3);p=plateaus[level];
      x=p.x+(rand()-.5)*(p.w-.8);
      z=p.z+(rand()-.5)*(p.d-.8);
    }while(occupiedByHigher(x,z,level)&&++attempts<30);
    dummy.position.set(x,p.y+.17,z);
    dummy.rotation.set(0,rand()*Math.PI*2,(rand()-.5)*.45);
    dummy.scale.setScalar(.65+rand()*.85);
    dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);
    blades.setColorAt(i,new THREE.Color(choice(['#a8c964','#d2db83','#6e9d4e','#bdd16f'])));
  }
  blades.instanceMatrix.needsUpdate=true;blades.castShadow=false;island.add(blades);
  // Low-cost rocky edge outcrops, distributed on terrace rims.
  const rockGeo=new THREE.DodecahedronGeometry(1,0);
  const rockMat=new THREE.MeshLambertMaterial({color:'#92918c',flatShading:true});
  const rockCount=125,rocks=new THREE.InstancedMesh(rockGeo,rockMat,rockCount);
  for(let i=0;i<rockCount;i++){
    const level=Math.floor(rand()*3),p=plateaus[level];
    const edge=rand()<.5,side=rand()<.5?-1:1;
    const x=edge?p.x+side*(p.w/2-1.1-rand()*1.8):p.x+(rand()-.5)*(p.w-2);
    const z=edge?p.z+(rand()-.5)*(p.d-2):p.z+side*(p.d/2-1.1-rand()*1.8);
    dummy.position.set(x,p.y+.15,z);
    dummy.rotation.set(rand()*.2,rand()*6.28,rand()*.2);
    dummy.scale.set(.22+rand()*.58,.22+rand()*.5,.24+rand()*.55);
    dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
    rocks.setColorAt(i,new THREE.Color(choice(['#a69f91','#8c9290','#777d86','#b5a68d'])));
  }
  rocks.instanceMatrix.needsUpdate=true;rocks.castShadow=true;island.add(rocks);
  // Grass overhangs, in coherent green tufts, visually join turf and cliff.
  const lipMat=new THREE.MeshLambertMaterial({color:'#83ab55'});
  const lipGeo=new THREE.BoxGeometry(.62,.26,.35);
  const lips=new THREE.InstancedMesh(lipGeo,lipMat,360);
  for(let i=0;i<360;i++){
    const level=i%3,p=plateaus[level],side=Math.floor(rand()*4);
    const along=(rand()-.5);
    let x=p.x,z=p.z,angle=0;
    if(side===0){x+=along*p.w;z-=p.d/2;angle=0;}
    if(side===1){x+=along*p.w;z+=p.d/2;angle=0;}
    if(side===2){x-=p.w/2;z+=along*p.d;angle=Math.PI/2;}
    if(side===3){x+=p.w/2;z+=along*p.d;angle=Math.PI/2;}
    dummy.position.set(x,p.y-.13-rand()*.17,z);
    dummy.rotation.set(0,angle,0);dummy.scale.set(.6+rand()*1.1,.5+rand()*1.3,1);
    dummy.updateMatrix();lips.setMatrixAt(i,dummy.matrix);
    lips.setColorAt(i,new THREE.Color(choice(['#6b9c4d','#8db95b','#b0ce69','#729d4b'])));
  }
  lips.instanceMatrix.needsUpdate=true;island.add(lips);
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
  status.textContent='Three.js · WORLD-002.3';
  let last=performance.now(),clock=0;
  function frame(now){
    const dt=Math.min(80,now-last);last=now;if(!bridge.getPaused())clock+=dt;
    const night=bridge.getNight();
    scene.background=night?nightSky:daySky;
    ambient.intensity=night?.55:1.55;sun.intensity=night?.4:3.4;
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
