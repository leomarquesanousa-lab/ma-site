type Data = Record<string, unknown>;
export function automaticSlug(value: unknown) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
}
const plain = (value: unknown) => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
function shorten(value: string, limit: number) {
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit - 1);
  return cut.slice(0, cut.lastIndexOf(" ") > limit / 2 ? cut.lastIndexOf(" ") : cut.length) + "…";
}
export function metadataSuggestions(data: Data) {
  const name = plain(data.name), description = plain(data.shortDescription) || plain(data.description);
  const words = automaticSlug(name).split("-").filter(w => w.length > 2 && !["para", "com", "das", "dos", "uma"].includes(w));
  return { slug: automaticSlug(name), seoTitle: name ? shorten(name, 163) + " | MA Confecções" : "", seoDescription: shorten(description || name, 160), keywords: [...new Set(words)].join(", "), imageAlt: shorten(name, 180) };
}
export function updateAutomaticMetadata(data: Data, key: string, value: unknown, locked: ReadonlySet<string>): Data {
  const next = { ...data, [key]: value };
  const suggestions = metadataSuggestions(next);
  for (const field of ["slug", "seoTitle", "seoDescription"] as const) {
    if (!locked.has(field)) next[field] = suggestions[field];
  }
  return next;
}
export function publicMetadata(data: Data) {
  const suggestions = metadataSuggestions(data);
  return { title: { absolute: plain(data.seoTitle) || suggestions.seoTitle }, description: plain(data.seoDescription) || suggestions.seoDescription };
}
