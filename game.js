/* Stand 12 — procedural A350 and apron. No external models or image assets. */
'use strict';
(() => {
if (!window.THREE) {
  document.getElementById('loading').textContent='3Dライブラリを取得できません。インターネット接続を確認して再読み込みしてください。';
  document.getElementById('start').disabled=true; return;
}
const $=id=>document.getElementById(id), clamp=THREE.MathUtils.clamp;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xaab9c2);
scene.fog=new THREE.Fog(0xaab9c2,200,470);
const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.3,650);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
$('scene').appendChild(renderer.domElement);
// Lock native page gestures without delaying pointer-driven signals.
for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,e=>e.preventDefault(),{passive:false});
for(const surface of [renderer.domElement,$('controls')]){
 surface.addEventListener('touchmove',e=>{if(e.cancelable)e.preventDefault();},{passive:false});
 surface.addEventListener('dblclick',e=>e.preventDefault());
}

scene.add(new THREE.HemisphereLight(0xd8eaff,0x79755f,2.0));
const sun=new THREE.DirectionalLight(0xfff2d7,3.0);sun.position.set(-75,110,-65);sun.castShadow=true;
const shadowSize=innerWidth<=900||matchMedia('(pointer:coarse)').matches?1024:2048;sun.shadow.mapSize.set(shadowSize,shadowSize);Object.assign(sun.shadow.camera,{left:-85,right:85,top:85,bottom:-110,near:1,far:300});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;sun.shadow.radius=3;sun.target.position.set(0,0,-20);scene.add(sun,sun.target);
// A small synthetic sky environment gives the paint and inlet lips soft reflections.
const envScene=new THREE.Scene();envScene.background=new THREE.Color(0xb7cbd7);
const envGround=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:0x7e817a}));envGround.rotation.x=-Math.PI/2;envGround.position.y=-35;envScene.add(envGround);
const envPanel=new THREE.Mesh(new THREE.PlaneGeometry(180,80),new THREE.MeshBasicMaterial({color:0xf7fbff}));envPanel.position.set(-80,100,-100);envPanel.lookAt(0,0,0);envScene.add(envPanel);
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.08).texture;pmrem.dispose();
const mat=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const white=mat(0xf4f4ef,.25,.16),wingWhite=mat(0xd6d9d8,.38,.2),navy=mat(0x121e2a,.32,.2),rubber=mat(0x15191b,.87),steel=mat(0xabb4b8,.25,.75),red=mat(0xc52d42,.32,.17);
function mesh(geo,m,parent=scene,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,m,p,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);}
function ball(r,m,p,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=mesh(new THREE.SphereGeometry(r,20,14),m,p,x,y,z);o.scale.set(sx,sy,sz);return o;}
function cylinder(a,b,r,m,p){const v=new THREE.Vector3().subVectors(b,a);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),12),m,p);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
// Deterministic apron noise: aggregate, hairline cracks, expansion joints and rubber deposits.
let seed=8261;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const concrete=canvasTexture(2048,2048,(c,w,h)=>{
 const im=c.createImageData(w,h);for(let i=0;i<im.data.length;i+=4){const n=(random()-.5)*18;im.data[i]=147+n;im.data[i+1]=148+n;im.data[i+2]=140+n;im.data[i+3]=255;}c.putImageData(im,0,0);
 for(let a=0;a<8;a++)for(let b=0;b<8;b++){c.fillStyle=`rgba(${random()>.5?'226,221,203':'75,78,72'},${.025+random()*.055})`;c.fillRect(a*256+2,b*256+2,252,252);}
 c.strokeStyle='#52595270';c.lineWidth=2;for(let i=0;i<=8;i++){c.beginPath();c.moveTo(i*256,0);c.lineTo(i*256,h);c.moveTo(0,i*256);c.lineTo(w,i*256);c.stroke();}c.strokeStyle='#e0ddd128';c.lineWidth=2;for(let i=0;i<8;i++){c.beginPath();c.moveTo(i*256+3,0);c.lineTo(i*256+3,h);c.stroke();}
 for(let i=0;i<180;i++){let x=random()*w,y=random()*h;const g=c.createRadialGradient(x,y,0,x,y,15+random()*75);g.addColorStop(0,'rgba(50,47,40,.05)');g.addColorStop(1,'rgba(50,47,40,0)');c.fillStyle=g;c.fillRect(x-90,y-90,180,180);}
 for(let i=0;i<30;i++){c.beginPath();let x=random()*w,y=random()*h;c.moveTo(x,y);for(let j=0;j<5;j++){x+=(random()-.5)*25;y+=random()*23;c.lineTo(x,y);}c.strokeStyle='#55594e35';c.lineWidth=.7;c.stroke();}
});concrete.wrapS=concrete.wrapT=THREE.RepeatWrapping;concrete.repeat.set(5,5);
const apron=mesh(new THREE.PlaneGeometry(440,440),new THREE.MeshStandardMaterial({map:concrete,roughness:.96}),scene,0,-.025,-75);apron.rotation.x=-Math.PI/2;apron.castShadow=false;
const paintTexture=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#e99a39';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){c.fillStyle=`rgba(114,115,103,${random()*.45})`;c.fillRect(random()*w,random()*h,random()*3+1,random()*4+1);}});paintTexture.wrapS=paintTexture.wrapT=THREE.RepeatWrapping;paintTexture.repeat.set(1,3);
const orange=new THREE.MeshStandardMaterial({map:paintTexture,roughness:.95,polygonOffset:true,polygonOffsetFactor:-1});const blackPaint=mat(0x353a36,.95);
function marking(w,d,x,z,m=orange){const o=mesh(new THREE.PlaneGeometry(w,d),m,scene,x,.017,z);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;}
marking(.9,213,0,-53.5,blackPaint);marking(.40,213,0,-53.5);
for(const [z,w] of [[-55,3],[-25,2.5],[1,3.7],[14,3.2],[22,3.7],[28,4.7],[35,3.3],[39,3.3],[43,3.3]]){marking(w+.18,.7,w/2-.2,z,blackPaint);marking(w,.32,w/2-.2,z);}
marking(8.4,.9,0,49,blackPaint);marking(8,.4,0,49);
function groundLabel(text,x,z,width=4.2,height=1.35,color='#e4cc75',bg='#343b32',reverse=true){const t=canvasTexture(512,128,c=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,512,128);}c.fillStyle=color;c.font='bold 88px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,69);});const o=mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.9}),scene,x,.027,z);o.rotation.x=-Math.PI/2;if(reverse)o.rotation.z=Math.PI;o.castShadow=false;return o;}
groundLabel('A350',-4.5,28,4.9,1.5,'#f5d680','#383e34');groundLabel('A320',-4.1,43);groundLabel('MD90',-4.1,14);groundLabel('B737',-4.1,11.9);groundLabel('B777',-4.1,-25);groundLabel('12',0,51.5,6,4.2,'#e8a047',null,false);
// Faint stand safety lines, a distant curved taxiway and drainage covers.
const yellow=mat(0xc6aa66,.9);for(const x of [-42,42])marking(.12,170,x,-30,yellow);
function groundCurve(points,color,width=.12){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],.035,p[1])));const geo=new THREE.TubeGeometry(curve,80,width/2,5,false);const o=mesh(geo,mat(color,.9));o.castShadow=false;}
groundCurve([[0,-161],[0,-134],[1,-116],[10,-106],[34,-99],[49,-91],[51,-75],[42,-64]],0xd6a04f,.23);
groundCurve([[1,-161],[1,-134],[2,-117],[11,-107],[35,-100],[50,-92],[52,-75],[43,-63]],0x655d48,.1);
for(const [x,z,r] of [[-12,40,1.2],[10,16,.9],[13,16,.6],[-17,-20,1],[22,-49,1.2],[-29,15,.7],[8,-2,.8]]){const o=mesh(new THREE.CylinderGeometry(r,r,.025,40),mat(0x5e635d,.8),scene,x,.02,z);o.castShadow=false;const inner=mesh(new THREE.CylinderGeometry(r*.77,r*.77,.027,40),mat(0x8a8d83,.85),scene,x,.04,z);inner.castShadow=false;for(let a=0;a<3;a++)marking(r*1.05,.04,x,z+(a-1)*r*.27,blackPaint);}
for(let i=0;i<25;i++){const x=(random()-.5)*65,z=(random()-.5)*150;const t=canvasTexture(64,256,(c)=>{const g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#181a1600');g.addColorStop(.5,'#181a1620');g.addColorStop(1,'#181a1600');c.fillStyle=g;c.fillRect(10,0,44,256);});const o=mesh(new THREE.PlaneGeometry(.24+random()*.4,3+random()*13),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),scene,x,.04,z);o.rotation.x=-Math.PI/2;o.rotation.z=(random()-.5)*.5;o.castShadow=false;}
// Distant airport structures: understated, to leave the lead-in line visually dominant.
const terminalMat=mat(0x9da9ac,.7);for(let i=0;i<9;i++){box(25,7+random()*4,12,terminalMat,scene,-160+i*38,4,-225);box(24,1.6,.1,mat(0x536e7a,.4,.3),scene,-160+i*38,5,-218.9);}
for(const x of [-76,76]){cylinder(new THREE.Vector3(x,0,-60),new THREE.Vector3(x,19,-60),.16,steel);box(5,.4,.6,white,scene,x,19,-60);}
// Terminal roof / window ledge: fixed in the foreground, as in the reference Short.
const terminalLedge=new THREE.Group();scene.add(terminalLedge);
box(180,2,5,mat(0xe7e9e4,.66),terminalLedge,0,4,61);box(180,.16,1.1,mat(0xf7f8f1,.4,.15),terminalLedge,0,5.1,58.8);box(180,.3,.15,steel,terminalLedge,0,5.05,58.16);for(let x=-85;x<90;x+=7){box(.055,.04,4.5,mat(0xa8b0ac,.7),terminalLedge,x,5.025,61);}
// AIRCRAFT: dimensions in metres, local forward is +Z. Nose gear is z=27.5.
const plane=new THREE.Group();scene.add(plane);
const profile=[[-33.4,.18,6.3],[-31.5,.65,6.35],[-28.5,1.8,6.3],[-25,2.68,6.18],[-21,2.96,6.1],[17,2.96,6.1],[22,2.88,6.1],[25,2.6,6.08],[27,2.28,6.0],[29,1.83,5.87],[30.5,1.35,5.7],[32,.75,5.5],[33.1,.25,5.36],[33.4,.015,5.33]];
function hullAt(z){let i=1;while(i<profile.length-1&&profile[i][0]<z)i++;const a=profile[i-1],b=profile[i],u=clamp((z-a[0])/(b[0]-a[0]),0,1);return {r:THREE.MathUtils.lerp(a[1],b[1],u),y:THREE.MathUtils.lerp(a[2],b[2],u)};}
const pos=[],uv=[],idx=[],ringN=64,sections=172;
for(let j=0;j<=sections;j++){const z=-33.4+66.8*j/sections,{r,y}=hullAt(z);for(let i=0;i<=ringN;i++){const t=i/ringN*Math.PI*2;pos.push(Math.sin(t)*r,y+Math.cos(t)*r*.99,z);uv.push(i/ringN,j/sections);if(j<sections&&i<ringN){const a=j*(ringN+1)+i,b=a+ringN+1;idx.push(a,b,a+1,a+1,b,b+1);}}}
const hullGeo=new THREE.BufferGeometry();hullGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));hullGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));hullGeo.setIndex(idx);hullGeo.computeVertexNormals();mesh(hullGeo,white,plane);
// Soft grey belly and wing-root fairing.
ball(1,white,plane,0,3.77,-2,2.7,.9,12.5);
// A350 six-pane visor. Each outline is drawn in (hull azimuth, longitudinal Z),
// then tessellated onto the changing nose curvature. No equal cylindrical strips.
const visorMaskMat=new THREE.MeshPhysicalMaterial({color:0x080d10,roughness:.23,metalness:.28,clearcoat:1,clearcoatRoughness:.16,side:THREE.DoubleSide});
const visorGlassMat=new THREE.MeshPhysicalMaterial({color:0x203b35,roughness:.12,metalness:.48,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.2,side:THREE.DoubleSide});
const sealMat=mat(0xa9aca3,.35,.65),wiperMat=mat(0x1a2227,.48,.48);
function visorPoint(theta,z,lift=.04){const h=hullAt(z);return new THREE.Vector3(Math.sin(theta)*(h.r+lift),h.y+Math.cos(theta)*(h.r*.99+lift),z);}
function curvedVisorPatch(shape,side,material,lift,name){
 const outline=shape.getPoints(18),faces=THREE.ShapeUtils.triangulateShape(outline,[]),verts=[],normals=[];
 function vertex(t,z){const a=visorPoint(side*t,z,lift),tangent=visorPoint(side*t+.001,z,lift).sub(a),along=visorPoint(side*t,z+.001,lift).sub(a),normal=along.cross(tangent).normalize();verts.push(a.x,a.y,a.z);normals.push(normal.x,normal.y,normal.z);}
 // Barycentric subdivision keeps the surround genuinely flush with the sloping nose.
 for(const face of faces){const a=outline[face[0]],b=outline[face[1]],c=outline[face[2]],n=6;
  const sample=(i,j)=>({x:a.x+(b.x-a.x)*i/n+(c.x-a.x)*j/n,y:a.y+(b.y-a.y)*i/n+(c.y-a.y)*j/n});
  const emit=(p,q,r)=>{for(const v of [p,q,r])vertex(v.x,v.y);};
  for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){emit(sample(i,j),sample(i+1,j),sample(i,j+1));if(i+j<n-1)emit(sample(i+1,j),sample(i+1,j+1),sample(i,j+1));}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));const o=mesh(g,material,plane);o.name=name;return o;
}
const visorOutline=new THREE.Shape();
visorOutline.moveTo(0,28.17);visorOutline.bezierCurveTo(.28,28.16,.54,27.98,.66,27.55);
visorOutline.lineTo(.81,26.56);visorOutline.bezierCurveTo(.87,26.18,.80,25.25,.90,24.73);
visorOutline.bezierCurveTo(1.02,24.14,1.34,24.48,1.46,24.98);
visorOutline.bezierCurveTo(1.63,25.68,1.49,27.05,1.28,28.15);
visorOutline.quadraticCurveTo(1.22,28.52,1.08,28.83);visorOutline.lineTo(.81,29.88);
visorOutline.quadraticCurveTo(.39,30.62,0,30.54);visorOutline.closePath();
function frontPane(){const p=new THREE.Shape();p.moveTo(.028,28.48);p.bezierCurveTo(.18,28.43,.36,28.37,.49,28.32);p.quadraticCurveTo(.60,28.92,.716,29.70);p.quadraticCurveTo(.42,30.16,.028,30.27);p.quadraticCurveTo(.014,29.40,.028,28.48);return p;}
function obliquePane(){const p=new THREE.Shape();p.moveTo(.565,28.19);p.lineTo(.852,26.83);p.quadraticCurveTo(.915,26.74,.966,26.99);p.lineTo(1.193,27.98);p.quadraticCurveTo(1.205,28.15,1.09,28.42);p.lineTo(.782,29.54);p.quadraticCurveTo(.69,29.11,.565,28.19);return p;}
function slidingPane(){const p=new THREE.Shape();p.moveTo(.972,24.95);p.bezierCurveTo(.894,25.18,.926,26.12,.955,26.54);p.quadraticCurveTo(.969,26.69,1.04,26.83);p.lineTo(1.28,27.35);p.bezierCurveTo(1.405,26.94,1.50,25.74,1.38,25.21);p.bezierCurveTo(1.29,24.77,1.075,24.60,.972,24.95);return p;}
for(const side of [-1,1]){
 curvedVisorPatch(visorOutline,side,visorMaskMat,.045,'a350-visor-surround');
 for(const [label,shape] of [['forward',frontPane()],['oblique',obliquePane()],['sliding',slidingPane()]]){
  curvedVisorPatch(shape,side,visorGlassMat,.063,`a350-glass-${side}-${label}`);
  const points=shape.getPoints(26).map(p=>visorPoint(side*p.x,p.y,.075));points.push(points[0].clone());
  const seal=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,false,'centripetal'),points.length*2,.013,5,false),sealMat,plane);seal.name='windscreen-seal';seal.castShadow=false;
 }
 // Paired parked wipers, including pivots, slender arms and the longer rubber blades.
 const pivot=visorPoint(side*.105,30.31,.115),knuckle=visorPoint(side*.34,30.09,.115),bladeStart=visorPoint(side*.30,30.00,.13),bladeEnd=visorPoint(side*.66,29.69,.13);
 cylinder(pivot,knuckle,.022,wiperMat,plane);cylinder(knuckle,bladeEnd,.016,wiperMat,plane);cylinder(bladeStart,bladeEnd,.030,wiperMat,plane);ball(.046,wiperMat,plane,pivot.x,pivot.y,pivot.z);
}
// Fine central windshield mullion, radome seam and sensors.
const radomePoints=[];for(let i=0;i<=80;i++){const t=i/80*Math.PI*2,{r,y}=hullAt(30.7);radomePoints.push(new THREE.Vector3(Math.sin(t)*(r+.007),y+Math.cos(t)*(r*.99+.007),30.7));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(radomePoints),80,.012,4,false),mat(0x9fa9aa,.6),plane);
// Passenger windows (shared geometry), doors and airline titles on both sides.
const windowGeo=new THREE.SphereGeometry(1,8,8),windowMat=mat(0x26343e,.2,.35);
for(const side of [-1,1]){
 for(let z=-23;z<25;z+=.86){if([20,6,-10,-22].some(d=>Math.abs(z-d)<.72))continue;const h=hullAt(z),y=h.y+.65;const x=Math.sqrt(Math.max(0,h.r*h.r-.65*.65));const w=mesh(windowGeo,windowMat,plane,side*(x+.015),y,z);w.scale.set(.038,.235,.15);w.castShadow=false;}
 const title=canvasTexture(2048,256,c=>{c.fillStyle='#101921';c.font='italic 900 164px Arial';c.textBaseline='middle';c.textAlign='center';c.fillText('JAPAN AIRLINES',1024,133);});
 const decalPos=[],decalUV=[],decalIndex=[];
 for(let iy=0;iy<=4;iy++)for(let iz=0;iz<=36;iz++){
  const u=iz/36,v=iy/4,z=10.7+side*(10-u*20),y=7.04+v*1.13,h=hullAt(z);
  decalPos.push(side*(Math.sqrt(Math.max(.01,h.r*h.r-(y-h.y)*(y-h.y)))+.025),y,z);decalUV.push(u,v);
  if(iy<4&&iz<36){const k=iy*37+iz;decalIndex.push(k,k+1,k+37,k+1,k+38,k+37);}
 }
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.Float32BufferAttribute(decalPos,3));dg.setAttribute('uv',new THREE.Float32BufferAttribute(decalUV,2));dg.setIndex(decalIndex);dg.computeVertexNormals();
 mesh(dg,new THREE.MeshStandardMaterial({map:title,transparent:true,roughness:.4,depthWrite:false,side:THREE.DoubleSide}),plane);
 for(const z of [21,5.5,-10,-22]){const h=hullAt(z);const doorTex=canvasTexture(128,256,c=>{c.strokeStyle='#8f9999';c.lineWidth=3;c.beginPath();c.roundRect(25,12,78,227,14);c.stroke();c.fillStyle='#2d3b42';c.fillRect(49,41,31,27);c.fillStyle='#b84141';c.fillRect(84,113,10,4);c.fillStyle='#9b9f9c';c.fillRect(76,124,18,4);});const d=mesh(new THREE.PlaneGeometry(.92,2.55),new THREE.MeshStandardMaterial({map:doorTex,transparent:true,roughness:.6,depthWrite:false}),plane,side*(h.r+.025),5.9,z);d.rotation.y=side*Math.PI/2;}
 const reg=canvasTexture(512,128,c=>{c.fillStyle='#313d43';c.font='bold 60px Arial';c.textAlign='center';c.fillText('JA01XJ',256,90);});const rp=mesh(new THREE.PlaneGeometry(3.5,.7),new THREE.MeshStandardMaterial({map:reg,transparent:true}),plane,side*2.73,5.7,-25);rp.rotation.y=side*Math.PI/2;
}
// Airfoil-ish swept wings, built with closed upper/lower skins.
function liftingSurface(stations,parent,material){const p=[],indices=[];for(const s of stations){const [x,y,lead,trail,thick]=s;p.push(x,y,lead,x,y+.07,trail,x,y-thick,lead,x,y-thick*.35,trail);}for(let i=0;i<stations.length-1;i++){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}indices.push(0,1,2,1,3,2);const a=(stations.length-1)*4;indices.push(a,a+2,a+1,a+1,a+2,a+3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();const m=material.clone();m.side=THREE.DoubleSide;return mesh(g,m,parent);}
for(const side of [-1,1]){
 liftingSurface([[side*2,5.0,7,-12,1.05],[side*8,5.1,3,-13,.75],[side*18,5.7,-4,-16,.45],[side*28,6.8,-12,-19,.19],[side*31,8.0,-16.6,-20.5,.11],[side*32.375,10.2,-19.3,-21.0,.06]],plane,wingWhite);
 // Segmented flap lines and metallic leading edge strips.
 for(let k=0;k<2;k++){const a=new THREE.Vector3(side*(7+k*7),5.18+k*.4,-10.7-k*2.2),b=new THREE.Vector3(side*(15+k*7),5.55+k*.6,-13.1-k*2.7);cylinder(a,b,.025,mat(0x69757b,.6),plane);}
 liftingSurface([[side*29.7,7.45,-15.4,-20.2,.14],[side*31,8.02,-16.6,-20.5,.11],[side*32.375,10.22,-19.3,-21,.06]],plane,red);
 for(const x of [8,13,18]){const o=ball(1,wingWhite,plane,side*x,4.85+(x-8)*.055,-13.6-(x-8)*.28,.25,.3,1.6);o.rotation.y=side*-.15;}
 const navColor=side>0?0xff2828:0x3affc1;ball(.16,new THREE.MeshBasicMaterial({color:navColor}),plane,side*32.35,10.16,-20,.7,.65,1.1);
 // Horizontal stabilizers, conventional tail.
 liftingSurface([[side*1.0,7.5,-23,-32,.45],[side*6,8.2,-27,-33.5,.2],[side*10,8.7,-31.3,-34.2,.04]],plane,wingWhite);
}
// Tail fin: a swept extruded polygon, with a procedural crane-in-circle insignia.
const finShape=new THREE.Shape();finShape.moveTo(-31,6);finShape.lineTo(-19.5,7);finShape.lineTo(-29.5,17.0);finShape.quadraticCurveTo(-30,17.3,-30.65,17.0);finShape.lineTo(-33.6,6.8);finShape.closePath();
const finGeo=new THREE.ExtrudeGeometry(finShape,{depth:.48,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.13,bevelThickness:.1});
// Shape coordinates are (local Z, Y), extrusion becomes aircraft X.
finGeo.rotateY(-Math.PI/2);mesh(finGeo,white,plane,.24,0,0);
const craneTexture=canvasTexture(512,512,c=>{
 c.translate(256,256);c.fillStyle='#c9253e';c.beginPath();c.arc(0,0,211,0,Math.PI*2);c.fill();
 // Original stylised tsurumaru: open white wing feathers surrounding a red crane silhouette.
 c.fillStyle='#fff';c.beginPath();c.ellipse(0,35,155,151,0,0,Math.PI*2);c.fill();
 c.fillStyle='#c9253e';for(const s of [-1,1]){c.save();c.scale(s,1);for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,70);c.quadraticCurveTo(80,-55,184-i*9,-139+i*27);c.quadraticCurveTo(146-i*10,27+i*13,13,115);c.fill();}c.restore();}
 c.beginPath();c.moveTo(-28,112);c.quadraticCurveTo(9,22,7,-62);c.quadraticCurveTo(-3,-107,32,-125);c.lineTo(66,-101);c.lineTo(31,-102);c.quadraticCurveTo(10,-68,34,-31);c.quadraticCurveTo(62,64,35,112);c.fill();
 c.fillStyle='#fff';c.font='italic bold 65px Arial';c.textAlign='center';c.fillText('JAL',0,172);
});
for(const s of [-1,1]){const logo=mesh(new THREE.PlaneGeometry(5.6,5.6),new THREE.MeshStandardMaterial({map:craneTexture,transparent:true,roughness:.35,depthWrite:false}),plane,s*.48,11.5,-29.0);logo.rotation.y=s*Math.PI/2;}
// Rolls-Royce Trent XWB-inspired engines. The inlet is an actual open annulus, not a black sphere.
function engine(side){const e=new THREE.Group();plane.add(e);e.position.set(side*10.2,3.45,0.0);
 const stations=[[-3.1,1.23],[-2.5,1.61],[-1.2,1.86],[1.3,1.90],[2.4,1.79],[2.73,1.62]];const p=[],ind=[];const n=56;
 for(let j=0;j<stations.length;j++)for(let i=0;i<=n;i++){const t=i/n*Math.PI*2; p.push(Math.cos(t)*stations[j][1],Math.sin(t)*stations[j][1],stations[j][0]);if(j<stations.length-1&&i<n){const a=j*(n+1)+i,b=a+n+1;ind.push(a,a+1,b,a+1,b+1,b);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ind);g.computeVertexNormals();mesh(g,white,e);
 const lip=mesh(new THREE.TorusGeometry(1.62,.105,12,64),steel,e,0,0,2.72);
 const inner=mesh(new THREE.CylinderGeometry(1.52,1.38,1.0,48,1,true),mat(0x65747b,.35,.7),e,0,0,2.15);inner.rotation.x=Math.PI/2;
 const fanGroup=new THREE.Group();fanGroup.position.z=1.65;e.add(fanGroup);
 const disk=mesh(new THREE.CircleGeometry(1.43,48),mat(0x17232c,.65,.4),fanGroup);disk.rotation.y=0;
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const shape=new THREE.Shape();shape.moveTo(.25,0);shape.quadraticCurveTo(.8,.0,1.40,.28);shape.lineTo(1.40,.42);shape.quadraticCurveTo(.75,.2,.25,.12);shape.closePath();const b=mesh(new THREE.ShapeGeometry(shape),mat(0x52616a,.35,.65),fanGroup);b.rotation.z=a;b.position.z=.015;}
 ball(.35,steel,e,0,0,1.87,1,1,1.55);
 const exhaust=mesh(new THREE.CylinderGeometry(.95,1.25,.9,40,1,true),mat(0x505963,.4,.8),e,0,0,-3.18);exhaust.rotation.x=Math.PI/2;ball(.63,navy,e,0,0,-3.5,1,1,1.5);
 const pylon=box(.62,2.1,4,wingWhite,plane,side*10.2,4.7,-1.2);pylon.rotation.x=-.13;
 return fanGroup;
}
const fans=[engine(-1),engine(1)];
// Landing gear: dual nose wheels, four-wheel main bogies and exposed oleos.
function wheel(parent,x,y,z,r=.53,width=.35){const tire=mesh(new THREE.CylinderGeometry(r,r,width,24),rubber,parent,x,y,z);tire.rotation.z=Math.PI/2;for(const side of [-1,1]){const hub=mesh(new THREE.CylinderGeometry(r*.48,r*.48,.025,16),steel,parent,x+side*width*.51,y,z);hub.rotation.z=Math.PI/2;}return tire;}
const noseGear=new THREE.Group();noseGear.position.set(0,0,27.5);plane.add(noseGear);
cylinder(new THREE.Vector3(0,.65,0),new THREE.Vector3(0,4.4,-.25),.105,steel,noseGear);cylinder(new THREE.Vector3(0,1.9,0),new THREE.Vector3(0,3.8,-1),.07,steel,noseGear);box(.75,.09,.35,steel,noseGear,0,.64,0);wheel(noseGear,-.40,.53,0);wheel(noseGear,.40,.53,0);box(.45,1.7,.08,white,plane,.35,3.3,27.5);
for(const side of [-1,1]){const gear=new THREE.Group();gear.position.set(side*5.3,0,-3.0);plane.add(gear);cylinder(new THREE.Vector3(0,.9,0),new THREE.Vector3(0,4.8,.25),.19,steel,gear);cylinder(new THREE.Vector3(0,1.2,0),new THREE.Vector3(side*1.0,4.5,-1.1),.10,steel,gear);box(1.8,.21,2.6,steel,gear,0,.82,0);for(const x of [-.74,.74])for(const z of [-.88,.88])wheel(gear,x,.73,z,.73,.47);box(1.15,1.8,.10,white,gear,side*.5,3.6,.5);}
// Beacon, dorsal aerials, and bright forward taxi lights.
const beacon=ball(.12,new THREE.MeshBasicMaterial({color:0xff5545}),plane,0,9.08,-1);
for(const z of [13,-6,-17]){const a=box(.12,.48,.7,white,plane,0,9.1,z);a.rotation.x=-.25;}
for(const x of [-.45,.45]){ball(.095,new THREE.MeshBasicMaterial({color:0xfff4d7}),plane,x,2.8,28.1);}
// MARSHALLER: 1.78m human, back toward the terminal, articulated shoulders/elbows/wrists.
const marshaller=new THREE.Group();marshaller.name='marshaller';marshaller.position.set(0,0,44);marshaller.rotation.y=Math.PI;scene.add(marshaller);
const cloth=mat(0x152431,.9),vest=new THREE.MeshStandardMaterial({color:0xc8ee24,roughness:.7,emissive:0x667500,emissiveIntensity:.10}),skin=mat(0xcba280,.8),reflective=mat(0xe7eee1,.32,.3),wandMat=new THREE.MeshStandardMaterial({color:0xff4c16,emissive:0xff4b0d,emissiveIntensity:.65,roughness:.4}),gloveMat=mat(0xe9e8df,.8);
const torso=mesh(new THREE.CylinderGeometry(.205,.165,.53,14),vest,marshaller,0,1.145,0);torso.scale.z=.66;
ball(.17,cloth,marshaller,0,.88,0,1.1,.65,.75);
for(const side of [-1,1]){
 cylinder(new THREE.Vector3(side*.105,.86,0),new THREE.Vector3(side*.13,.49,.015),.085,cloth,marshaller);
 ball(.085,cloth,marshaller,side*.13,.49,.015,1,1,.9);
 cylinder(new THREE.Vector3(side*.13,.49,.015),new THREE.Vector3(side*.15,.14,0),.071,cloth,marshaller);
 ball(.1,rubber,marshaller,side*.15,.075,.04,.84,.75,1.5);
 for(const face of [-1,1]){box(.052,.47,.022,reflective,marshaller,side*.115,1.16,face*.131);box(.41,.065,.025,reflective,marshaller,0,1.04,face*.133);}
}
cylinder(new THREE.Vector3(0,1.39,0),new THREE.Vector3(0,1.51,0),.064,skin,marshaller);
ball(.133,skin,marshaller,0,1.575,0,1,1.16,.92);ball(.137,cloth,marshaller,0,1.60,-.025,1,.58,.8);
ball(.165,white,marshaller,0,1.698,0,1,.53,1.08);mesh(new THREE.CylinderGeometry(.184,.184,.024,28),white,marshaller,0,1.675,.005);
box(.025,.065,.28,white,marshaller,0,1.738,-.005);
// Separate bones, with the elbow parented to its shoulder and the wrist to its forearm.
const arms=[],UPPER=.29,FORE=.28;
for(const side of [-1,1]){
 const shoulder=new THREE.Group();shoulder.position.set(side*.215,1.395,0);marshaller.add(shoulder);
 ball(.082,cloth,shoulder,0,0,0);cylinder(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-UPPER,0),.061,cloth,shoulder);
 const elbow=new THREE.Group();elbow.position.y=-UPPER;shoulder.add(elbow);ball(.065,cloth,elbow,0,0,0);cylinder(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-FORE,0),.051,cloth,elbow);
 const wrist=new THREE.Group();wrist.position.y=-FORE;elbow.add(wrist);ball(.059,gloveMat,wrist,0,0,0,.85,1.05,.85);
 cylinder(new THREE.Vector3(0,0,0),new THREE.Vector3(0,.11,0),.029,rubber,wrist);
 const wand=cylinder(new THREE.Vector3(0,.11,0),new THREE.Vector3(0,.52,0),.035,wandMat,wrist);wand.name='signal-wand';ball(.036,wandMat,wrist,0,.52,0);
 arms.push({side,shoulder,elbow,wrist});
}
const marshallerFill=new THREE.PointLight(0xfff8df,5,9,2);marshallerFill.position.set(0,3.5,47);scene.add(marshallerFill);
function poseArm(arm,x,y,wandAngle,beckon=0){
 const dx=x-arm.side*.215,dy=y-1.395,d=clamp(Math.hypot(dx,dy),.035,UPPER+FORE-.003);
 const heading=Math.atan2(dy,dx),bend=Math.acos(clamp((UPPER*UPPER+d*d-FORE*FORE)/(2*UPPER*d),-1,1)),upperAngle=heading-arm.side*bend;
 const ex=Math.cos(upperAngle)*UPPER,ey=Math.sin(upperAngle)*UPPER;
 const foreAngle=Math.atan2(Math.sin(heading)*d-ey,Math.cos(heading)*d-ex);
 arm.shoulder.rotation.z=upperAngle+Math.PI/2;arm.elbow.rotation.z=foreAngle-upperAngle;
 arm.wrist.rotation.z=wandAngle-(foreAngle+Math.PI/2);arm.wrist.rotation.x=beckon;
}
// Parked chocks and a small headset pouch beside the guide.
box(.6,.14,.22,mat(0xd8b43a,.8),scene,1.8,.1,44.1);box(.6,.14,.22,mat(0xd8b43a,.8),scene,2.05,.1,44.6);
// Subtle contact shadow under the aircraft in addition to the real sun shadow.
const blobTex=canvasTexture(128,128,c=>{const g=c.createRadialGradient(64,64,3,64,64,64);g.addColorStop(0,'#15232c55');g.addColorStop(1,'#15232c00');c.fillStyle=g;c.fillRect(0,0,128,128);});
const blob=mesh(new THREE.PlaneGeometry(16,70),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}),scene,0,.035,0);blob.rotation.x=-Math.PI/2;blob.castShadow=false;
// Pilot / taxi model. Signals are delayed, steering is rate limited and braking is inertial.
const TARGET=28,NOSE=27.5,REACTION=.35,DECEL=.55;
let mode='intro',signal='idle',pilotSignal='idle',stopLatched=false,commands=[],held=new Set(),elapsed=0,settleTime=0,hintTime=0,stopPressAt=0;
const state={x:.7,z:-66,yaw:-.005,speed:1.72,steer:0};
const names={idle:'待機',forward:'前進',slow:'遅らせ',left:'左へ',right:'右へ',stop:'止まれ'};
const notes={idle:'機体は慣性で進み続けます',forward:'低速を維持して接近',slow:'両腕を下げ、減速を指示',left:'パイロットから見て左へ（画面の右）',right:'パイロットから見て右へ（画面の左）',stop:'機体が止まるまで、バトンをゆっくり交差'};
function nosePosition(){return {x:state.x+Math.sin(state.yaw)*NOSE,z:state.z+Math.cos(state.yaw)*NOSE};}
function setSignal(next){if(mode!=='playing')return;if(stopLatched&&next!=='stop')return;if(next==='stop'){if(!stopLatched)stopPressAt=elapsed;stopLatched=true;held.clear();}if(next===signal)return;signal=next;commands.push({at:elapsed+REACTION,signal:next});$('signal-note').querySelector('strong').textContent=names[next];$('signal-note').querySelector('small').textContent=notes[next];document.querySelectorAll('[data-signal]').forEach(b=>{b.classList.toggle('active',b.dataset.signal===next);b.setAttribute('aria-pressed',String(b.dataset.signal===next));});}
function refreshSignal(){if(stopLatched)return;let next='idle';for(const k of ['forward','slow','left','right'])if(held.has(k))next=k;setSignal(next);}
function press(s){if(s==='stop')setSignal('stop');else{held.add(s);refreshSignal();}}
function release(s){held.delete(s);refreshSignal();}
const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'slow',ArrowDown:'slow',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'stop'};
addEventListener('keydown',e=>{if(keyMap[e.code]){e.preventDefault();if(!e.repeat)press(keyMap[e.code]);}if(e.code==='Enter'&&mode!=='playing')start();});
addEventListener('keyup',e=>{if(keyMap[e.code]){e.preventDefault();release(keyMap[e.code]);}});
addEventListener('blur',()=>{held.clear();refreshSignal();});
document.querySelectorAll('[data-signal]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(b.dataset.signal);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>release(b.dataset.signal));});
function start(){mode='playing';elapsed=0;settleTime=0;hintTime=0;stopPressAt=0;commands=[];held.clear();signal='idle';pilotSignal='idle';stopLatched=false;state.x=.65+(random()-.5)*.55;state.z=-66;state.yaw=-.004;state.speed=1.72;state.steer=0;if(new URLSearchParams(location.search).has('near')){state.z=-10;state.speed=1.1;}document.body.classList.add('playing');document.body.classList.remove('result');$('intro').hidden=true;$('result').hidden=true;$('retry').hidden=true;$('target-hint').style.opacity='1';document.querySelectorAll('[data-signal]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});setSignal('forward');initAudio();}
$('start').addEventListener('click',start);$('retry').addEventListener('click',start);$('close-result').addEventListener('click',()=>{if(mode==='result')$('result').hidden=true;});$('result').addEventListener('click',e=>{if(e.target===$('result')&&mode==='result')$('result').hidden=true;});if(new URLSearchParams(location.search).has('autostart'))setTimeout(start,400);
function finish(danger=false){if(mode!=='playing')return;mode='result';state.speed=0;held.clear();document.body.classList.remove('playing');document.body.classList.add('result');$('retry').hidden=false;const nose=nosePosition(),err=nose.z-TARGET,lat=Math.abs(nose.x);let grade,copy,tip;
 if(danger){grade='誘導中止';copy='安全限界を超えたため、緊急停止。';tip='停止線の手前で「止まれ」を。機首の前には十分な安全距離が必要です。';}
 else if(Math.abs(err)<=.4&&lat<=.28){grade='ピタリ！';copy='美しい誘導。A350が正確にスポットイン。';tip='機首輪が目標停止位置にぴったり。お見事です。';}
 else if(Math.abs(err)<=.85&&lat<=.5){grade='優秀';copy='落ち着いた合図で、精度の高い停止。';tip='あと少しのタイミング調整で「ピタリ！」が狙えます。';}
 else if(Math.abs(err)<=1.7&&lat<=.85){grade='良好';copy='無事に停止しました。';tip='中心線と停止位置の両方に意識を向けてみましょう。';}
 else if(err>1.7){grade='行き過ぎ';copy='停止位置を通過してしまいました。';tip='制動距離と0.35秒の反応遅れを見越して、少し早めに停止信号を。';}
 else if(err< -1.7){grade='早すぎ';copy='目標停止位置まで距離が残っています。';tip='速度が低いと制動距離も短くなります。次はもう少し近づいてから合図を。';}
 else{grade='もう少し';copy='停止できましたが、中心線から外れています。';tip='左右の合図は早めに、短く。曲がり始めたら合図を戻して様子を見ましょう。';}
 const pleased=!danger&&(grade==='ピタリ！'||grade==='優秀'||grade==='良好');const react=$('pilot-react-img');react.src=pleased?'pilot-good.jpg?v=20261107g':'pilot-bad.jpg?v=20261107g';react.alt=pleased?'満足そうな機長':'残念がる機長';$('pilot-react').classList.toggle('good',pleased);$('pilot-react').classList.toggle('bad',!pleased);$('grade').textContent=grade;$('grade').style.color=danger?'#ff967e':'#ffc676';$('result-copy').textContent=copy;$('result-long').textContent=`${err>=0?'+':''}${err.toFixed(2)} m`;$('result-lat').textContent=`${nose.x>=0?'+':''}${nose.x.toFixed(2)} m`;$('result-tip').textContent=tip;setTimeout(()=>{if(mode==='result')$('result').hidden=false;},800);
}
function physics(dt){elapsed+=dt;hintTime+=dt;while(commands.length&&commands[0].at<=elapsed)pilotSignal=commands.shift().signal;
 const desiredSteer=pilotSignal==='left'?.34:pilotSignal==='right'?-.34:0;
 state.steer+=clamp(desiredSteer-state.steer,-.22*dt,.22*dt);
 let acceleration=-.012;
 if(pilotSignal==='forward')acceleration=state.speed<1.72?.13:-.07;
 if(pilotSignal==='slow')acceleration=-.18;
 if(pilotSignal==='stop')acceleration=-DECEL;
 state.speed=clamp(state.speed+acceleration*dt,0,1.9);
 state.yaw+=state.speed/25.8*Math.tan(state.steer)*dt;
 state.x+=Math.sin(state.yaw)*state.speed*dt;
 state.z+=Math.cos(state.yaw)*state.speed*dt;
 const nose=nosePosition();
 if(nose.z>TARGET+5.7||Math.abs(nose.x)>8||Math.abs(state.yaw)>.32){finish(true);return;}
 if(state.speed<.025){state.speed=0;settleTime+=dt;if(settleTime>.75)finish(false);}else settleTime=0;
 if(hintTime>12)$('target-hint').style.opacity='0';
}
function stopCloseAmount(){
 // 0 at the instant the player signals stop, 1 when the aircraft actually reaches 0.
 if(!stopLatched)return 0;
 const pending=commands.find(c=>c.signal==='stop');
 const wait=pilotSignal==='stop'?0:Math.max(0,(pending?pending.at:elapsed)-elapsed);
 const remain=wait+state.speed/DECEL;
 const gone=Math.max(0,elapsed-stopPressAt);
 const total=gone+remain;
 const p=total<.04?1:Math.max(0,Math.min(1,gone/total));
 return p*p*(3-2*p);
}
function animateMarshaller(t){
 // Animation reads the player's signal directly, never the reaction-delayed pilotSignal.
 const wave=Math.sin(t*4.6);
 const close=signal==='stop'?stopCloseAmount():0;
 for(const arm of arms){const s=arm.side;let x=s*.40,y=1.02,angle=-s*Math.PI/2,beckon=0;
  switch(signal){
   case 'forward':x=s*(.49+.025*wave);y=1.73+.055*wave;angle=-s*(.53+.15*wave);beckon=.18+.35*Math.sin(t*4.6+.8);break;
   case 'stop':{
    const x0=s*.46,y0=1.74,a0=-s*.18;
    const x1=s*.10,y1=1.96,a1=s*.82;
    x=x0+(x1-x0)*close;y=y0+(y1-y0)*close;angle=a0+(a1-a0)*close;
    break;
   }
   case 'slow':x=s*.51;y=.99-.07*Math.sin(t*3.6);angle=-s*(2.19+.16*Math.sin(t*3.6));break;
   case 'left':case 'right':{
    const directing=signal==='left'?s===-1:s===1;
    if(directing){x=s*.39;y=1.88;angle=-s*(.25+.23*wave);beckon=.2+.22*wave;}
    else{x=s*.70;y=1.38;angle=-s*Math.PI/2;}
    break;
   }
  }
  poseArm(arm,x,y,angle,beckon);
 }
}
function updatePlane(){plane.position.set(state.x,0,state.z);plane.rotation.y=state.yaw;noseGear.rotation.y=state.steer;blob.position.set(state.x,.035,state.z-1);blob.rotation.z=-state.yaw;}
let viewWidth=innerWidth,viewHeight=innerHeight;
function hud(){const n=nosePosition(),d=TARGET-n.z;$('speed').innerHTML=`${(state.speed*3.6).toFixed(1)}<em>km/h</em>`;$('distance').innerHTML=`${d.toFixed(1)}<em>m</em>`;$('distance').style.color=d<0?'#ffa080':d<6?'#ffce8a':'';$('offset').textContent=`中心線 ${n.x>=0?'+':''}${n.x.toFixed(2)} m`;$('braking').textContent=`制動距離 ${(state.speed*REACTION+state.speed*state.speed/(2*DECEL)).toFixed(1)} m`;
 const align=$('alignment');if(align)align.style.left=`${clamp(50+n.x*17,2,97)}%`;
 const projected=new THREE.Vector3(0,.05,TARGET).project(camera);$('target-hint').style.left=`${(projected.x*.5+.5)*viewWidth-15}px`;$('target-hint').style.top=`${(-projected.y*.5+.5)*viewHeight-6}px`;
 const sceneRect=$('scene').getBoundingClientRect();
 const mid=new THREE.Vector3(0,.12,(n.z+44)/2).project(camera);
 let y=sceneRect.top+(-mid.y*.5+.5)*viewHeight;
 y=clamp(y,sceneRect.top+58,Math.max(sceneRect.top+58,sceneRect.bottom-72));
 const speedEl=$('read-speed'),distEl=$('read-distance');
 if(speedEl)speedEl.style.top=`${y}px`;
 if(distEl)distEl.style.top=`${y}px`;
}
// Audio is generated locally and only starts after user interaction.
let audio,engineGain,engineFilter,muted=false;
function initAudio(){try{if(audio){audio.resume();return;}audio=new (window.AudioContext||window.webkitAudioContext)();engineGain=audio.createGain();engineGain.gain.value=0;engineGain.connect(audio.destination);engineFilter=audio.createBiquadFilter();engineFilter.type='lowpass';engineFilter.frequency.value=220;engineFilter.Q.value=.6;engineFilter.connect(engineGain);const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=.97*smooth+.03*(random()*2-1);data[i]=smooth*3;}const noise=audio.createBufferSource();noise.buffer=buffer;noise.loop=true;noise.connect(engineFilter);noise.start();for(const hz of [36,71,108]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=hz;g.gain.value=.035;o.connect(g);g.connect(engineGain);o.start();}}catch(e){$('mute').textContent='音声なし';}}
$('mute').addEventListener('click',()=>{muted=!muted;$('mute').textContent=muted?'音声 切':'音声 入';if(!audio)initAudio();});
function audioUpdate(){if(!audio)return;const proximity=clamp((state.z+85)/90,.08,1);engineGain.gain.setTargetAtTime(muted||mode!=='playing'?0:.22+proximity*.42,audio.currentTime,.4);engineFilter.frequency.setTargetAtTime(150+proximity*170+state.speed*25,audio.currentTime,.4);}
function resize(){
 const rect=$('scene').getBoundingClientRect();viewWidth=Math.max(1,rect.width||innerWidth);viewHeight=Math.max(1,rect.height||innerHeight);
 const portrait=innerWidth<innerHeight&&innerWidth<=1000,shortTouch=innerHeight<=520&&matchMedia('(pointer:coarse)').matches;
 camera.aspect=viewWidth/viewHeight;
 if(shortTouch){camera.fov=45;camera.position.set(0,15,63);camera.lookAt(0,0,35);terminalLedge.position.z=-5;}
 else if(portrait){camera.fov=44;camera.position.set(0,14,70);camera.lookAt(0,0,30);terminalLedge.position.z=1;}
 else{camera.fov=43;camera.position.set(0,17,73);camera.lookAt(0,0,31);terminalLedge.position.z=1.3;}
 camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setSize(viewWidth,viewHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,portrait?1.6:1.7));
}
addEventListener('resize',resize);if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);resize();updatePlane();hud();$('loading').remove();
let previous=performance.now(),visualTime=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;visualTime+=dt;
 if(mode==='playing'){// substeps keep the steering and brake behaviour stable on slower devices.
  const steps=Math.max(1,Math.ceil(dt/.016));for(let i=0;i<steps&&mode==='playing';i++)physics(dt/steps);
 }
 updatePlane();animateMarshaller(visualTime);fans.forEach(f=>f.rotation.z+=dt*(4+state.speed*3));beacon.visible=Math.sin(visualTime*6)>-.15;hud();audioUpdate();renderer.render(scene,camera);
}
requestAnimationFrame(frame);
// Expose a read-only diagnostic snapshot for local QA; it cannot manipulate the run.
window.marshallerStatus=()=>({mode,signal,pilotSignal,speed:state.speed,nose:nosePosition(),target:TARGET});
})();
