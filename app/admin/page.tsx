import { redirect } from "next/navigation";
import { allowed, currentUser, type Permission } from "@/lib/commerce/auth";
import AdminWorkspace from "@/components/commerce/AdminWorkspace";
import styles from "@/app/commerce.module.css";
import adminStyles from "./admin.module.css";
export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/alterar-senha");
  if (!allowed(user.role, "dashboard")) redirect("/minha-conta");
  const permissions: Permission[] = ["dashboard", "products", "categories", "orders", "quotes", "inventory", "customers", "settings", "audit"];
  return <main className={`${styles.shell} ${adminStyles.admin}`}><header className={adminStyles.heading}><div><span>Operação M.A.</span><h1>Administração</h1><p>Seu catálogo e sua operação, em um só lugar.</p></div><div className={adminStyles.identity}><span>Conta conectada</span><p>{user.name ?? user.email} · {user.role}</p></div></header><AdminWorkspace permissions={permissions.filter(p => allowed(user.role, p))} /></main>;
}
