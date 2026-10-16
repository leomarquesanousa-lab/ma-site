"use client";

import { useId, useRef, useState } from "react";
import { categoryImageUrl } from "@/lib/commerce/validation";
import { uploadImage } from "./client";
import styles from "./CategoryImageField.module.css";

export default function CategoryImageField({ value, onChange, onUploadStateChange, disabled = false, purpose = "catalog", productId, showPreview = true }: {
  value: unknown;
  onChange: (value: string) => void;
  onUploadStateChange: (busy: boolean) => void;
  disabled?: boolean;
  purpose?: "catalog" | "mockup";
  productId?: string;
  showPreview?: boolean;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [failedUrl, setFailedUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const dragDepth = useRef(0);
  const current = typeof value === "string" ? value : "";
  let preview = "", urlError = "";
  if (current.trim()) {
    try { preview = categoryImageUrl(current); }
    catch (e) { urlError = e instanceof Error ? e.message : "Referência de imagem inválida."; }
  }
  const locked = disabled || busy;

  async function upload(files: File[]) {
    if (disabled || inFlight.current || !files.length) return;
    setError(""); setStatus("");
    if (files.length !== 1) { setError("Selecione apenas uma imagem por vez."); return; }
    const file = files[0];
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || !file.size || file.size > 5242880) {
      setError("Selecione uma imagem PNG, JPEG ou WebP de até 5 MB."); return;
    }
    inFlight.current = true; setBusy(true); onUploadStateChange(true);
    setProgress(null); setStatus("Enviando imagem…");
    try {
      const asset = await uploadImage(file, purpose, productId, percent => {
        setProgress(percent);
        setStatus(percent === 100 ? "Arquivo enviado. Confirmando armazenamento…" : "Enviando imagem…");
      });
      onChange(asset.url); setFailedUrl("");
      setStatus(purpose === "mockup" ? "Mockup enviado. Salve o produto para aplicar." : "Imagem enviada. Salve a categoria para aplicar.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente."); setStatus("");
    } finally {
      inFlight.current = false; setBusy(false); onUploadStateChange(false);
    }
  }

  return <div className={styles.field} aria-busy={busy}>
    <div className={styles.dropZone} data-dragging={dragging} data-disabled={locked} role="group" aria-label={purpose === "mockup" ? "Enviar imagem-base de personalização" : "Enviar imagem da categoria"}
      onDragEnter={event => { event.preventDefault(); if (!locked && event.dataTransfer.types.includes("Files")) { dragDepth.current++; setDragging(true); } }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = locked ? "none" : "copy"; }}
      onDragLeave={event => { event.preventDefault(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }}
      onDrop={event => { event.preventDefault(); event.stopPropagation(); dragDepth.current = 0; setDragging(false); void upload(Array.from(event.dataTransfer.files)); }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" /></svg>
      <strong>{busy ? "Enviando imagem…" : dragging ? "Solte a imagem aqui" : "Arraste e solte sua imagem"}</strong>
      <button type="button" disabled={locked} onClick={() => fileInput.current?.click()}>{current ? "Substituir imagem / Escolher arquivo" : "Escolher arquivo"}</button>
      <input ref={fileInput} hidden id={`${id}-file`} type="file" accept="image/png,image/jpeg,image/webp" disabled={locked} aria-label={purpose === "mockup" ? "Escolher imagem-base" : "Escolher imagem da categoria"} aria-describedby={`${id}-help`}
        onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void upload(files); }} />
      <small id={`${id}-help`}>PNG, JPEG ou WebP • até 5 MB</small>
    </div>
    <button type="button" className={styles.urlToggle} disabled={locked} aria-expanded={showUrl} aria-controls={`${id}-url-panel`} onClick={() => setShowUrl(open => !open)}>{showUrl ? "Ocultar URL externa" : "Usar URL externa"}</button>
    <div id={`${id}-url-panel`} className={styles.urlPanel} hidden={!showUrl && !urlError}>
    <label htmlFor={`${id}-url`}>URL externa (HTTPS) ou referência existente</label>
    <input id={`${id}-url`} type="text" inputMode="url" maxLength={2000} placeholder="https://exemplo.com/imagem.jpg"
      value={current} disabled={locked} aria-invalid={!!urlError} aria-describedby={urlError ? `${id}-url-error` : `${id}-url-help`}
      ref={input => { input?.setCustomValidity(urlError); }}
      onChange={event => { onChange(event.target.value); setFailedUrl(""); setError(""); setStatus(""); }} />
    <small id={`${id}-url-help`}>Uploads preenchem este campo automaticamente. Imagens externas dependem do site de origem.</small>
    </div>
    {urlError && <p id={`${id}-url-error`} className={styles.error} role="alert">{urlError}</p>}
    {showPreview && preview && failedUrl !== preview && <img key={preview} className={styles.preview} src={preview} alt={purpose === "mockup" ? "Prévia da imagem-base" : "Prévia da imagem da categoria"} referrerPolicy="no-referrer" onError={() => setFailedUrl(preview)} />}
    {preview && failedUrl === preview && <p className={styles.error} role="alert">Não foi possível carregar a prévia. Confira a URL e se o site permite exibir a imagem.</p>}
    {current && <button type="button" disabled={locked} onClick={() => { onChange(""); setFailedUrl(""); setError(""); setStatus("Imagem desvinculada. Salve o cadastro para aplicar."); }}>Remover imagem</button>}
    <small>A imagem anterior só é substituída ao salvar o cadastro. Remover não apaga o arquivo armazenado.</small>
    {busy && <div className={styles.progress}><progress max={100} value={progress ?? undefined} aria-label="Transferência da imagem" />{progress !== null && <span>{progress}% enviado</span>}</div>}
    <span role="status" aria-live="polite">{status}</span>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}
