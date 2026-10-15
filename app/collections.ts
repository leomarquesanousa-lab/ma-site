export const whatsapp = "https://wa.me/5511947944345";

export const collections = [
  {
    slug: "uniformes", name: "Uniformes profissionais", shortName: "Uniformes",
    label: "Nossa especialidade", description: "A identidade da sua empresa começa por quem a representa.",
    image: "/MA-SITE-CONFECCOES.png", alt: "Polo e jaqueta com aplicação ilustrativa de marca",
    items: [
      { slug: "polos", name: "Polos", description: "Uma apresentação profissional para a sua equipe." },
      { slug: "camisetas", name: "Camisetas", description: "Identidade para equipes, eventos e projetos." },
      { slug: "jaquetas", name: "Jaquetas", description: "Mais uma possibilidade para compor o uniforme da sua empresa." },
    ],
  },
  {
    slug: "personalizados", name: "Produtos personalizados", shortName: "Personalizados",
    label: "Sua ideia, sua assinatura", description: "Produtos para transformar imagens, textos e ideias em presença.",
    image: "/ma-SITE-BRINDES.png", alt: "Composição ilustrativa de caneca e garrafa personalizadas",
    items: [
      { slug: "canecas", name: "Canecas", description: "Fotos, mensagens e identidade para o dia a dia." },
      { slug: "camisetas", name: "Camisetas", description: "A sua ideia em uma peça personalizada." },
      { slug: "potes", name: "Potes", description: "Uma linha de personalização em preparação." },
      { slug: "squeezes", name: "Squeezes", description: "Uma linha de personalização em preparação." },
    ],
  },
  {
    slug: "brindes", name: "Brindes corporativos", shortName: "Brindes",
    label: "Conexões que permanecem", description: "Sua marca em presentes, eventos e ações corporativas.",
    image: "/ma-SITE-BRINDES.png", alt: "Caneca e garrafa com marca ilustrativa",
    items: [
      { slug: "canecas", name: "Canecas corporativas", description: "Uma lembrança para clientes, parceiros e equipes." },
      { slug: "garrafas", name: "Garrafas", description: "Presença de marca em diferentes momentos." },
      { slug: "squeezes", name: "Squeezes", description: "Uma possibilidade em preparação para ações de marca." },
    ],
  },
];

export function collectionUrl(slug: string, item?: string) {
  return `/colecoes/${slug}${item ? `/${item}` : ""}`;
}
