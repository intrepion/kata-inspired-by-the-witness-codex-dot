import * as THREE from './vendor/three/three.module.min.js';
import { panels, trees } from './walk-domain';
/** Matches GardenRenderer's screen projection exactly for panel interaction. */
export function setGardenCamera(camera, view, width, height) {
 const focal=Math.min(height*.86,width*.9),s=Math.sin(view.yaw),c=Math.cos(view.yaw),sp=Math.sin(view.pitch),cp=Math.cos(view.pitch);
 camera.fov=2*Math.atan(height/(2*focal))*180/Math.PI;camera.aspect=width/height;camera.near=.08;camera.far=1000;camera.updateProjectionMatrix();
 camera.position.set(view.x,view.y,view.z);
 camera.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(c,0,s),new THREE.Vector3(-s*sp,cp,c*sp),new THREE.Vector3(-s*cp,-sp,c*cp)));
 camera.updateMatrixWorld();
}
export function isPanelVisible(camera, point, blockers) {
 const origin=camera.position, target=new THREE.Vector3(point.x,1.65,point.z+.19), direction=target.clone().sub(origin), distance=direction.length();
 const ray=new THREE.Raycaster(origin,direction.normalize(),.08,Math.max(.08,distance-.03));
 return ray.intersectObjects(blockers,true).length===0;
}
export function createGardenThree(canvas) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b6d4cc');scene.fog=new THREE.Fog('#b6d4cc',55,180);scene.add(new THREE.HemisphereLight('#fff3cf','#587864',2));
 const camera=new THREE.PerspectiveCamera();const mat=color=>new THREE.MeshLambertMaterial({color});
 function box(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);scene.add(m);return m;}
 box(0,-.9,-10,1000,.1,1000,'#77a7a6');box(0,-.55,-10,15,1,42,'#a9b59c');box(0,-.01,-10,14,.04,40,'#94a47c');
 for(let z=9;z>-29;z-=1.7)box(0,.02,z,2.6,.035,1.55,'#d5d2b3');
 const gates=[];for(const p of panels){box(p.x/2,.024,p.z+1.3,Math.abs(p.x)+2.5,.04,1.3,'#d5d2b3');for(const x of [-4.4,4.4])box(x,.59,p.gateZ,5.2,1.18,.65,'#b5baa3');for(const x of [-1.8,1.8])box(x,1.4,p.gateZ,.35,2.8,.55,'#65796a');const g=new THREE.Group();scene.add(g);for(let x=-1.5;x<=1.51;x+=.375){const bar=new THREE.Mesh(new THREE.BoxGeometry(.11,2.3,.16),mat('#517466'));bar.position.set(x,0,0);g.add(bar);}g.position.set(0,1.2,p.gateZ);gates.push(g);}
 for(const t of trees){box(t.x,(t.height-1.1)/2,t.z,.42,t.height-1.1,.42,'#827c61');for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(1.65-i*.28,1.7,7),mat(['#638b6b','#779773','#8da57a'][i]));m.position.set(t.x,t.height-1+i*.65,t.z);scene.add(m);}}
 box(0,.25,-27.5,1.6,.5,1.6,'#b9bda4');for(const x of [-.48,.48])box(x,1.45,-27.5,.12,2.2,.12,'#435f54');box(0,2.64,-27.5,1.45,.18,1.15,'#456858');const lantern=box(0,1.78,-27.5,.65,.9,.65,'#d9c99c');
 function render(view,state,w,h){renderer.setSize(w,h,false);setGardenCamera(camera,view,w,h);gates.forEach((g,i)=>g.position.y=1.2+state.gate[i]*2.8);lantern.material.color.set(state.save.arrived?'#ffe5a2':'#d9c99c');scene.updateMatrixWorld(true);renderer.render(scene,camera);return new Set(panels.filter(p=>isPanelVisible(camera,p,scene.children)).map(p=>p.puzzle.id));}
 return {render,dispose:()=>renderer.dispose()};
}
