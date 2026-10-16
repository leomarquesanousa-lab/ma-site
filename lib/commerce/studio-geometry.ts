import type { DesignElement, PrintArea } from './validation';
export type Point={x:number;y:number};
export function fitElement(e:DesignElement,a:PrintArea):DesignElement{
 const r=e.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));
 const factor=Math.min(1,a.width/(e.width*c+e.height*s),a.height/(e.width*s+e.height*c));
 const width=e.width*factor,height=e.height*factor,bw=width*c+height*s,bh=width*s+height*c;
 return {...e,width,height,x:Math.min(a.x+a.width-bw/2,Math.max(a.x+bw/2,e.x)),y:Math.min(a.y+a.height-bh/2,Math.max(a.y+bh/2,e.y))};
}
export type TransformHandle='n'|'s'|'e'|'w'|'nw'|'ne'|'sw'|'se';
export function transformElement(start:DesignElement,origin:Point,p:Point,mode:'move'|'resize'|'rotate',a:PrintArea,snap=false,handle:TransformHandle='se',proportional=false){
 let next={...start};
 if(mode==='move'){
  next.x+=p.x-origin.x;next.y+=p.y-origin.y;
  if(snap){for(const x of [a.x+start.width/2,a.x+a.width/2,a.x+a.width-start.width/2])if(Math.abs(next.x-x)<.008)next.x=x;for(const y of [a.y+start.height/2,a.y+a.height/2,a.y+a.height-start.height/2])if(Math.abs(next.y-y)<.008)next.y=y;}
 }else if(mode==='resize'){
  const r=start.rotation*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  const dx=(p.x-origin.x)*c+(p.y-origin.y)*s,dy=-(p.x-origin.x)*s+(p.y-origin.y)*c;
  const hx=handle.includes('e')?1:handle.includes('w')?-1:0,hy=handle.includes('s')?1:handle.includes('n')?-1:0;
  let width=hx?Math.max(.01,start.width+dx*hx):start.width,height=hy?Math.max(.01,start.height+dy*hy):start.height;
  if(proportional){const scale=hx&&hy?(Math.abs(width/start.width-1)>Math.abs(height/start.height-1)?width/start.width:height/start.height):hx?width/start.width:height/start.height;width=start.width*scale;height=start.height*scale;}
  // Keep the opposite edge/corner fixed, including after rotation. Stop at the printable boundary.
  const candidate=(t:number)=>{const w=start.width+(width-start.width)*t,h=start.height+(height-start.height)*t,lx=(w-start.width)*hx/2,ly=(h-start.height)*hy/2;return {...start,width:w,height:h,x:start.x+lx*c-ly*s,y:start.y+lx*s+ly*c};};
  const inside=(e:DesignElement)=>{const bw=e.width*Math.abs(c)+e.height*Math.abs(s),bh=e.width*Math.abs(s)+e.height*Math.abs(c);return e.x-bw/2>=a.x-1e-9&&e.x+bw/2<=a.x+a.width+1e-9&&e.y-bh/2>=a.y-1e-9&&e.y+bh/2<=a.y+a.height+1e-9;};
  if(inside(candidate(1)))return candidate(1);
  let lo=0,hi=1;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(inside(candidate(mid)))lo=mid;else hi=mid;}return candidate(lo);
 }else{
  let angle=start.rotation+(Math.atan2(p.y-start.y,p.x-start.x)-Math.atan2(origin.y-start.y,origin.x-start.x))*180/Math.PI;
  angle=((angle+180)%360+360)%360-180;
  if(snap&&Math.abs(angle-Math.round(angle/15)*15)<3)angle=Math.round(angle/15)*15;
  next.rotation=angle;
 }
 return fitElement(next,a);
}
export function cylindricalX(x:number){return .5+Math.sin((x-.5)*2.2)/(2*Math.sin(1.1));}
export function cylindricalY(x:number){return .028*(1-(2*x-1)**2);}
