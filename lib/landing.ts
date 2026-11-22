/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Diário de treino",
  title: "O caderninho da academia, no bolso e mais esperto.",
  subtitle:
    "Registre cada série em poucos toques, veja o que você fez no treino passado e saiba na hora quando bateu um recorde. Funciona no celular e no computador, com tudo salvo na sua conta.",
  note: "Grátis. Crie sua conta com e-mail e senha em poucos segundos.",
};

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Monte seus treinos",
    text: "Escolha os exercícios da biblioteca, organize a semana na agenda e deixe tudo pronto antes de chegar na academia.",
  },
  {
    title: "Registre as séries",
    text: "Carga e repetições em poucos toques, com o treino anterior ao lado e o descanso cronometrado entre as séries.",
  },
  {
    title: "Acompanhe a evolução",
    text: "Recordes marcados na hora, histórico de cada sessão e gráficos de progresso por exercício.",
  },
];

export type FeatureIcon = "log" | "record" | "calendar" | "timer" | "cardio" | "devices";

export type Feature = { icon: FeatureIcon; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "log",
    title: "Registro rápido",
    text: "Botões grandes, poucos toques e o último treino como referência, sem perder o ritmo.",
  },
  {
    icon: "record",
    title: "Recordes na hora",
    text: "Quando uma série supera a melhor marca do exercício, o FitLog avisa na hora.",
  },
  {
    icon: "calendar",
    title: "Agenda da semana",
    text: "Defina qual treino cai em cada dia e veja na tela inicial o treino de hoje.",
  },
  {
    icon: "timer",
    title: "Descanso cronometrado",
    text: "O cronômetro de descanso começa sozinho quando você salva uma série.",
  },
  {
    icon: "cardio",
    title: "Calculadora de cardio",
    text: "Estime calorias e frequência cardíaca na esteira a partir de velocidade, inclinação e tempo.",
  },
  {
    icon: "devices",
    title: "Em qualquer aparelho",
    text: "Entre com sua conta no celular ou no computador e encontre seus treinos do jeito que deixou.",
  },
];

export type Screenshot = { light: string; dark: string; alt: string };

/** Prints gerados por `e2e/screenshots.spec.ts` (nunca à mão). */
export const SCREENSHOT: Screenshot = {
  light: "/landing/treino-claro.webp",
  dark: "/landing/treino-escuro.webp",
  alt: "Tela de um treino no FitLog, no celular, com os exercícios e as séries registradas.",
};

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  { question: "É grátis?", answer: "É. Não tem plano pago nem anúncio; só pede uma conta com e-mail e senha." },
  {
    question: "Onde ficam os meus dados?",
    answer:
      "Na sua conta, num banco de dados em São Paulo, processado por um servidor nos Estados Unidos. No app, cada conta vê só os próprios dados. Quem mantém o FitLog administra o banco e tecnicamente consegue ler. Você pode apagar tudo quando quiser.",
  },
  {
    question: "Como uso em outro celular?",
    answer:
      "É só entrar com a mesma conta: seus treinos, séries e histórico aparecem lá.",
  },
  {
    question: "Substitui um profissional?",
    answer: "Não. O FitLog registra o que você faz; a orientação do treino é com um profissional de educação física.",
  },
];

export type Photo = { src: string; alt: string };

/** Fotos do Unsplash (licença livre), guardadas em `public/landing/`. */
export const PHOTOS = {
  hero: { src: "/landing/academia.webp", alt: "Mãos segurando dois halteres numa academia escura." },
  rack: { src: "/landing/halteres.webp", alt: "Fileira de halteres num suporte de academia." },
} satisfies Record<string, Photo>;

/** Fatos curtos da faixa logo abaixo do topo. */
export const FACTS = ["Poucos toques por série", "Descanso que começa sozinho", "Recordes na hora", "Salvo na sua conta"];
