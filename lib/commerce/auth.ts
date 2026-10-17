import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const permissions = {
  CUSTOMER: [],
  OPERATOR: ["dashboard", "orders", "quotes", "inventory", "customers"],
  MANAGER: ["dashboard", "orders", "quotes", "inventory", "customers", "products", "categories"],
  ADMIN: ["dashboard", "orders", "quotes", "inventory", "customers", "products", "categories", "settings", "payments", "audit"],
  DEVELOPER: ["dashboard", "orders", "quotes", "inventory", "customers", "products", "categories", "settings", "payments", "audit"],
} as const;
export type Permission = (typeof permissions.ADMIN)[number];
import { CommerceError } from "./errors";
export { CommerceError } from "./errors";
export async function currentUser() {
  const token = (await cookies()).get("ma_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, select: { expiresAt: true, user: { select: { id: true, name: true, email: true, role: true, mustChangePassword: true } } } });
  return session && session.expiresAt > new Date() ? session.user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new CommerceError("Faça login para continuar.", 401);
  if (user.mustChangePassword) throw new CommerceError("Altere sua senha antes de continuar.", 403);
  return user;
}
export function allowed(role: keyof typeof permissions, permission: Permission) {
  return (permissions[role] as readonly string[]).includes(permission);
}
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!allowed(user.role, permission)) throw new CommerceError("Acesso não autorizado.", 403);
  return user;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if(process.env.MA_HOSTED_PRODUCTION==='1'&&process.env.MA_RUNTIME==='production'&&process.env.NODE_ENV==='production'){
    // TLS terminates at the hosting proxy. Authorize the configured public
    // origin, never a client-controlled Host or X-Forwarded-* header.
    let expected:URL;
    try{expected=new URL(process.env.NEXT_PUBLIC_SITE_URL??'');}
    catch{throw new CommerceError('Configure NEXT_PUBLIC_SITE_URL com a URL HTTPS oficial.',503);}
    if(expected.protocol!=='https:'||expected.username||expected.password)throw new CommerceError('NEXT_PUBLIC_SITE_URL precisa ser a URL HTTPS oficial.',503);
    if(origin!==expected.origin)throw new CommerceError('Origem não autorizada.',403);
    return;
  }
  if (!origin || origin !== new URL(request.url).origin) throw new CommerceError("Origem não autorizada.", 403);
}
