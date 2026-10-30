import { test } from 'node:test';
import { strict as assert } from 'node:assert';
// The bundled runtime is tested directly; Three.js types are not a runtime dependency.
// @ts-ignore
import { PerspectiveCamera, Vector3 } from '../src/vendor/three/three.module.min.js';
import { setGardenCamera } from '../src/walk-three';
import { panels } from '../src/walk-domain';
test('Three camera aligns with panel and vertex projection at walking and tablet viewpoints', () => {
 const w=1100,h=640,f=Math.min(h*.86,w*.9);
 for (const view of [{x:0,y:1.65,z:8,yaw:.3,pitch:.12},{x:2.65,y:1.65,z:-3.7,yaw:0,pitch:0}]) {
  const camera=new PerspectiveCamera();setGardenCamera(camera,view,w,h);
  for (const p of panels) for(const [gx,gy] of [[0,0],[1,1],[2,2]]) {
   const x=p.x-.78+gx*1.56/p.puzzle.size,y=2.43-gy*1.56/p.puzzle.size,z=p.z+.19;
   const dx=x-view.x,dy=y-view.y,dz=z-view.z,forward=dx*Math.sin(view.yaw)-dz*Math.cos(view.yaw),depth=dy*Math.sin(view.pitch)+forward*Math.cos(view.pitch);
   if(depth<=.08)continue;
   const expectedX=w/2+(dx*Math.cos(view.yaw)+dz*Math.sin(view.yaw))*f/depth,expectedY=h/2-(dy*Math.cos(view.pitch)-forward*Math.sin(view.pitch))*f/depth;
   const projected=new Vector3(x,y,z).project(camera);assert.ok(Math.abs((projected.x+1)*w/2-expectedX)<1e-6);assert.ok(Math.abs((1-projected.y)*h/2-expectedY)<1e-6);
  }
 }
});

test('tablet visibility respects intervening solid geometry', async () => {
 // @ts-ignore Bundled runtime has no separate type package.
 const { Mesh, BoxGeometry, MeshBasicMaterial } = await import('../src/vendor/three/three.module.min.js');
 const { isPanelVisible } = await import('../src/walk-three');
 const camera=new PerspectiveCamera();camera.position.set(0,1.65,8);camera.updateMatrixWorld();
 const wall=new Mesh(new BoxGeometry(4,4,.5),new MeshBasicMaterial());wall.position.set(0,1.65,4);wall.updateMatrixWorld();
 assert.equal(isPanelVisible(camera,{x:0,z:0},[wall]),false);
 assert.equal(isPanelVisible(camera,{x:6,z:0},[wall]),true);
});
