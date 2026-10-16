import * as THREE from 'three';

/** Own procedural proof-of-concept; never automatically assigned to a catalog product. */
export function createDemoMug(texture:THREE.Texture,color='#f7f5f2',segments=96,wrap=false){
 const profile=[[0,-1.35],[.92,-1.35],[1,-1.3],[1.04,-1.2],[1.045,1.18],[1.03,1.3],[.99,1.34],[.94,1.31],[.93,1.23],[.93,-1.12],[.88,-1.2],[0,-1.2]].map(([x,y])=>new THREE.Vector2(x,y));
 const geometry=new THREE.LatheGeometry(profile,segments,wrap?Math.PI/2:-Math.PI,Math.PI*2),uv=geometry.getAttribute('uv');
 for(let i=0;i<=segments;i++)for(let j=0;j<profile.length;j++)uv.setXY(i*profile.length+j,i/segments,(profile[j].y+1.35)/2.69);
 geometry.clearGroups();
 for(let i=0;i<segments;i++)for(let j=0;j<profile.length-1;j++)geometry.addGroup((i*(profile.length-1)+j)*6,6,j===3?1:0);
 const ceramic=new THREE.MeshPhysicalMaterial({color,roughness:.23,metalness:0,clearcoat:.65,clearcoatRoughness:.2});
 const printed=new THREE.MeshPhysicalMaterial({map:texture,roughness:.28,metalness:0,clearcoat:.55,clearcoatRoughness:.23});
 const group=new THREE.Group(),body=new THREE.Mesh(geometry,[ceramic,printed]);body.castShadow=true;body.receiveShadow=true;group.add(body);
 class HandleCurve extends THREE.Curve<THREE.Vector3>{constructor(){super();}getPoint(t:number,target=new THREE.Vector3()){return target.set(.97+.77*Math.sin(t*Math.PI),.82*Math.cos(t*Math.PI),0);}}
 const handle=new THREE.Mesh(new THREE.TubeGeometry(new HandleCurve(),64,.145,16,false),ceramic);handle.castShadow=true;handle.receiveShadow=true;group.add(handle);
 return {group,ceramic,printed,dispose(){geometry.dispose();handle.geometry.dispose();ceramic.dispose();printed.dispose();}};
}
