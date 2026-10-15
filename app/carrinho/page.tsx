import { redirect } from "next/navigation";
import { currentUser } from "@/lib/commerce/auth";
import CartWorkspace from "@/components/commerce/CartWorkspace";
import styles from "@/app/commerce.module.css";
export default async function CartPage(){const user=await currentUser();if(!user)redirect("/login");if(user.mustChangePassword)redirect("/alterar-senha");return <main className={styles.shell}><header className={styles.heading}><span>Compra M.A.</span><h1>Seu carrinho</h1></header><CartWorkspace/></main>;}
