import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-20";

const linkClass = "font-semibold text-accent underline underline-offset-2";

const Header = () => (
  <div className="mb-10 flex items-center justify-between gap-3">
    <BrandLink />
    <LandingThemeToggle />
  </div>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-full flex-col bg-background text-foreground">
    {children}
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);

const Contact = () => (
  <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
    {PRIVACY_EMAIL}
  </a>
);

export const PrivacyPage = () => (
  <Shell>
    <LegalPage
      header={<Header />}
      title="Privacidade"
      summary="O FitLog guarda seus treinos só no seu aparelho. Nada do que você registra vai para um servidor."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                Seus treinos, a agenda da semana, as séries registradas (carga e repetições), o histórico das sessões,
                as sessões de cardio e o tempo de descanso. Se você preencher o perfil do cardio, também{" "}
                <strong>peso, idade e sexo</strong>, usados só para estimar calorias e frequência cardíaca. E a sua
                escolha de tema claro ou escuro.
              </p>
              <p>
                Tudo fica no armazenamento do navegador (localStorage), neste aparelho. Para funcionar sem internet, o
                app também guarda uma cópia das próprias telas no navegador. Nós não temos acesso a nada disso.
              </p>
            </>
          ),
        },
        {
          id: "terceiros",
          title: "Quem mais recebe dados",
          content: (
            <p>
              Só a <strong>Vercel</strong>, a hospedagem do site, que registra dados técnicos de acesso (como IP e
              navegador) para entregar as páginas. Não usamos cookies, estatísticas de visita nem propaganda.
            </p>
          ),
        },
        {
          id: "backup",
          title: "Backup",
          content: (
            <p>
              O backup (em Ajustes) leva treinos, séries, histórico, agenda e o perfil do cardio, com peso, idade e
              sexo. Depois de baixado, o arquivo fica sob o seu cuidado: guarde em lugar seguro.
            </p>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Em Ajustes, use &quot;Apagar todos os dados&quot;, ou limpe os dados deste site nas configurações do
              navegador. Depois disso, não há como recuperar, a não ser por um backup.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              Dúvidas sobre esta página: <Contact />.
            </p>
          ),
        },
      ]}
    />
  </Shell>
);

export const TermsPage = () => (
  <Shell>
    <LegalPage
      header={<Header />}
      title="Termos de uso"
      summary="As regras para usar o FitLog. Ao usar o app, você concorda com elas."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-e",
          title: "O que é o FitLog",
          content: (
            <p>
              Um diário de treino gratuito, mantido por Diego Natalo como projeto pessoal. O código é aberto, no{" "}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                GitHub
              </a>
              .
            </p>
          ),
        },
        {
          id: "nao-e-orientacao",
          title: "Não é orientação médica nem de treino",
          content: (
            <p>
              O FitLog só registra o que você faz. As estimativas de calorias e de frequência cardíaca do cardio são
              aproximadas e não servem para diagnóstico. Antes de começar ou mudar um treino, procure um médico e um
              profissional de educação física.
            </p>
          ),
        },
        {
          id: "seus-dados",
          title: "Seus dados",
          content: (
            <p>
              Os dados ficam só no seu aparelho, e fazer backup é responsabilidade sua: limpar o navegador, trocar de
              aparelho ou usar uma aba anônima pode apagar tudo. Detalhes em{" "}
              <Link href="/privacidade" className={linkClass}>
                Privacidade
              </Link>
              .
            </p>
          ),
        },
        {
          id: "disponibilidade",
          title: "Disponibilidade",
          content: (
            <p>
              O FitLog é oferecido &quot;como está&quot;, sem garantia de que vai funcionar sempre ou sem erros. Ele pode
              mudar ou sair do ar.
            </p>
          ),
        },
        {
          id: "contato",
          title: "Contato",
          content: (
            <p>
              <Contact />
            </p>
          ),
        },
      ]}
    />
  </Shell>
);
