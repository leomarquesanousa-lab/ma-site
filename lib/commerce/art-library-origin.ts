import { CommerceError, sameOrigin } from './auth';

export function assertArtLibraryOrigin(request:Request){
 if(process.env.MA_HOSTED_PRODUCTION==='1'&&process.env.MA_RUNTIME==='production'&&process.env.NODE_ENV==='production'){
  // Hostinger terminates TLS before Next. Trust only server configuration,
  // never the request's Host or X-Forwarded-* headers, to authorize a write.
  let expected:URL;
  try{expected=new URL(process.env.NEXT_PUBLIC_SITE_URL??'');}
  catch{throw new CommerceError('Configure NEXT_PUBLIC_SITE_URL com a URL HTTPS oficial para sincronizar artes.',503);}
  if(expected.protocol!=='https:'||expected.username||expected.password)throw new CommerceError('NEXT_PUBLIC_SITE_URL precisa ser a URL HTTPS oficial.',503);
  if(request.headers.get('origin')!==expected.origin)throw new CommerceError('Origem não autorizada.',403);
  return;
 }
 sameOrigin(request);
}
