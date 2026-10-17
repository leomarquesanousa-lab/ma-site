import { whatsapp } from "@/app/collections";

export type Banner = {
  id: string; name: string; active: boolean; order: number; image: string;
  title1: string; title2: string; description: string;
  color1: string; color2: string; descriptionColor: string;
  button: string; destination: "WHATSAPP" | "CATEGORY" | "PRODUCT" | "INTERNAL" | "EXTERNAL";
  target: string; message: string;
};
const content = [
  ["Uniformes", "/herohome-ma.png", "Uniformes que vestem", "a força da sua marca.", "Uniformes profissionais que traduzem a identidade da sua empresa. Produtos personalizados que levam essa identidade mais longe."],
  ["Almofadas personalizadas", "/hero_almofadas.png", "Sua criatividade merece", "um lugar de destaque.", "Transforme suas fotos, frases e momentos especiais em almofadas personalizadas, feitas para surpreender e encantar."],
  ["Camisetas personalizadas", "/hero-camiseta.png", "Sua ideia, sua camiseta,", "seu estilo.", "Personalize camisetas com suas fotos, frases e artes favoritas. Crie peças exclusivas para presentear, celebrar ou expressar sua personalidade."],
  ["Canecas personalizadas", "/hero-caneca.png", "Momentos especiais merecem", "uma caneca única.", "Transforme fotos, mensagens e ideias em canecas personalizadas. Um presente cheio de significado para qualquer ocasião."],
  ["Azulejos personalizados", "/hero-azulejo.png", "Transforme suas lembranças", "em arte.", "Eternize fotos, mensagens e momentos especiais em azulejos personalizados que dão um toque único à decoração."],
];
export function initialBanners(): Banner[] {
  return content.map(([name,image,title1,title2,description],i)=>({id:`initial-${i}`,name,image,title1,title2,description,active:true,order:i,color1:"",color2:"",descriptionColor:"",button:i===0?"Solicitar orçamento":"Personalize",destination:i===0?"WHATSAPP":"INTERNAL",target:i===0?whatsapp:"/catalogo",message:i===0?"Olá! Gostaria de solicitar um orçamento de uniformes.":""}));
}
export function bannerHref(b: Banner) {
  if(b.destination!=="WHATSAPP")return b.target;
  const u=new URL(whatsapp);u.searchParams.set("text",b.message);return u.href;
}
export function publicHttps(value: string) {
  try {const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)&&!/(^|\.)(localhost|local|internal|test|invalid)$/i.test(u.hostname);}catch{return false;}
}
export function parseBanners(value: unknown): Banner[] {
  const fail=()=>{throw Error("Confira os banners: limite de 10, campos obrigatórios, cores e destinos válidos.");};
  if(!Array.isArray(value)||value.length>10) return fail();
  const ids=new Set<string>();
  return value.map((raw,i)=>{
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return fail();
    const r=raw as Record<string,unknown>;
    const field=(key:string,max:number,required=false)=>{if(typeof r[key]!=="string")return fail();const s=(r[key] as string).trim();if(s.length>max||(required&&!s))return fail();return s;};
    const id=field("id",80,true);if(!/^[a-zA-Z0-9-]+$/.test(id)||ids.has(id)||typeof r.active!=="boolean")return fail();ids.add(id);
    const destination=field("destination",20) as Banner["destination"];
    if(!["WHATSAPP","CATEGORY","PRODUCT","INTERNAL","EXTERNAL"].includes(destination))return fail();
    const color=(key:string)=>{const c=field(key,7);if(c&&!/^#[0-9a-f]{6}$/i.test(c))return fail();return c;};
    const b:Banner={id,name:field("name",100,true),active:r.active,order:i,image:field("image",1000),title1:field("title1",100,r.active),title2:field("title2",100),description:field("description",500),color1:color("color1"),color2:color("color2"),descriptionColor:color("descriptionColor"),button:field("button",45,r.active),destination,target:field("target",1000),message:field("message",600)};
    if(b.image&&!/^\/api\/arquivos\/[a-zA-Z0-9-]+$/.test(b.image)&&!content.some(x=>x[1]===b.image)&&!publicHttps(b.image))return fail();
    if(b.active&&!b.image)return fail();
    if(destination==="WHATSAPP")b.target=whatsapp;
    else if(b.target){if(destination==="EXTERNAL"?!publicHttps(b.target):!/^\/(?:[a-z0-9-]+\/?)*(?:#[a-z0-9-]+)?$/i.test(b.target))return fail();}
    else if(b.active)return fail();
    return b;
  });
}
