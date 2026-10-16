"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './MugDemo.module.css';
const Viewer=dynamic(()=>import('./MugDemoViewer'),{ssr:false,loading:()=> <p role="status">Preparando visualizador 3D…</p>});
export default function MugDemo(){
 const [open,setOpen]=useState(false);
 return <main className={styles.page}><a href="/admin">← Administração</a><header><span>LABORATÓRIO · HOMOLOGAÇÃO</span><h1>Uma nova perspectiva.</h1><p>Caneca 3D · prova de conceito</p></header>{open?<Viewer/>:<section className={styles.intro}><div className={styles.emblem} aria-hidden="true">MA</div><h2>Explore a forma. Confira a aplicação.</h2><p>Modelo próprio de cerâmica com alça, interior e arte de demonstração aplicada à superfície.</p><button type="button" onClick={()=>setOpen(true)}>Abrir demonstração 3D</button></section>}<p className={styles.disclaimer}>Modelo experimental, sem associação a produtos cadastrados. Cores e proporções ilustrativas. Esta demonstração não salva projetos nem altera pedidos.</p></main>;
}
