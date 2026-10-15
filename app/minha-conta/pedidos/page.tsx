import {redirect} from "next/navigation";
import {currentUser} from "@/lib/commerce/auth";
import CustomerWorkspace from "@/components/commerce/CustomerWorkspace";
import styles from "@/app/commerce.module.css";
export default async function OrdersPage(){const user=await currentUser();if(!user)redirect("/login");if(user.mustChangePassword)redirect("/alterar-senha");return <main className={styles.shell}><a href="/minha-conta">Minha conta</a><header className={styles.heading}><h1>Meus pedidos</h1></header><CustomerWorkspace module="orders"/></main>;}
