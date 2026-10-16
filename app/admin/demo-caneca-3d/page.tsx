import { notFound, redirect } from 'next/navigation';
import MugDemo from '@/components/commerce/MugDemo';
export const dynamic='force-dynamic';
export const metadata={title:'Caneca 3D — Homologação | MA Confecções',robots:{index:false,follow:false}};
export default async function MugDemoPage(){
 if(process.env.MA_HOMOLOGATION!=='1'||process.env.MA_RUNTIME!=='homologation')notFound();
 // Import authentication only after the environment guard: no production connection on this route.
 const {currentUser,allowed}=await import('@/lib/commerce/auth');
 const user=await currentUser();if(!user)redirect('/login');if(user.mustChangePassword)redirect('/alterar-senha');if(!allowed(user.role,'products'))redirect('/minha-conta');
 return <MugDemo/>;
}
