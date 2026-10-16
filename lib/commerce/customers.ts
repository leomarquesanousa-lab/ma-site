import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CommerceError } from "./errors";
import { text } from "./validation";
const summary={id:true,name:true,email:true,createdAt:true,_count:{select:{orders:true,quotes:true}}} satisfies Prisma.UserSelect;
export async function customerListing(params:URLSearchParams){
 const id=params.get('id');
 if(id){const customer=await db.user.findFirst({where:{id:text(id,'Cliente',100),role:'CUSTOMER'},select:{...summary,orders:{select:{id:true,createdAt:true,status:true,totalCents:true},orderBy:{createdAt:'desc'},take:10},quotes:{select:{id:true,createdAt:true,status:true},orderBy:{createdAt:'desc'},take:10}}});if(!customer)throw new CommerceError('Cliente não encontrado.',404);return customer;}
 const q=(params.get('q')??'').trim();if(q.length>180)throw new CommerceError('Busca: máximo de 180 caracteres.');
 const sort=params.get('sort')??'newest',orders=params.get('orders')??'all';
 if(!['newest','oldest','nameAsc','nameDesc'].includes(sort)||!['all','with','without'].includes(orders))throw new CommerceError('Filtro inválido.');
 const raw=params.get('page')??'1';if(!/^[1-9]\d{0,5}$/.test(raw))throw new CommerceError('Página inválida.');
 const where:Prisma.UserWhereInput={role:'CUSTOMER',...(q?{OR:[{name:{contains:q,mode:'insensitive'}},{email:{contains:q,mode:'insensitive'}}]}:{}),...(orders==='with'?{orders:{some:{}}}:orders==='without'?{orders:{none:{}}}:{})};
 const total=await db.user.count({where}),pageSize=20,pages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(Number(raw),pages);
 const orderBy:Prisma.UserOrderByWithRelationInput=sort==='nameAsc'?{name:'asc'}:sort==='nameDesc'?{name:'desc'}:{createdAt:sort==='oldest'?'asc':'desc'};
 const items=await db.user.findMany({where,select:summary,orderBy:[orderBy,{id:'asc'}],skip:(page-1)*pageSize,take:pageSize});
 return {items,total,page,pages,pageSize};
}
