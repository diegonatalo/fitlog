import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { LegalPage } from "@/components/legal-page";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_EMAIL, SOURCE_URL } from "@/lib/site";

/** Data da última mudança nos textos (`AAAA-MM-DD`). */
const UPDATED_AT = "2026-11-22";

const linkClass = "font-semibold text-accent-text underline underline-offset-2";

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
      summary="O FitLog guarda seus treinos na sua conta, num banco de dados, para você acessar de qualquer aparelho. Esta página diz o que é guardado, quem consegue ler e como apagar."
      updatedAt={UPDATED_AT}
      sections={[
        {
          id: "o-que-fica-guardado",
          title: "O que fica guardado",
          content: (
            <>
              <p>
                Da sua conta: <strong>nome e e-mail</strong>, e a senha, guardada só como hash (não dá para ler a senha
                a partir dele). Para manter você conectado, também o endereço IP e o navegador de cada sessão. Para
                limitar tentativas de login, um contador por endereço IP, que não fica ligado à conta.
              </p>
              <p>
                Do app: seus treinos, a agenda da semana, as séries registradas (carga e repetições), o histórico das
                sessões, as sessões de cardio e o tempo de descanso. Se você preencher o perfil do cardio, também{" "}
                <strong>peso, idade e sexo</strong>, usados só para estimar calorias e frequência cardíaca.
              </p>
              <p>
                Esses dados ficam num banco de dados Postgres, ligados à sua conta, e só são usados para o app
                funcionar. No seu navegador ficam apenas o cookie de sessão e a escolha de tema claro ou escuro.
              </p>
            </>
          ),
        },
        {
          id: "quem-consegue-ler",
          title: "Quem consegue ler",
          content: (
            <>
              <p>No app, cada conta vê só os próprios dados.</p>
              <p>
                Fora do app, <strong>quem mantém o FitLog</strong> (Diego Natalo) administra o banco e a hospedagem e
                tecnicamente consegue ler o que você registra, inclusive peso, idade e sexo. Os dados{" "}
                <strong>não têm criptografia de ponta a ponta</strong>.
              </p>
            </>
          ),
        },
        {
          id: "terceiros",
          title: "Quem mais recebe dados",
          content: (
            <>
              <p>
                A <strong>Vercel</strong>, a hospedagem do site, que registra dados técnicos de acesso (como IP e
                navegador) para entregar as páginas, e o <strong>Neon</strong>, onde fica o banco de dados. Os dois recebem
                os dados para o FitLog funcionar. O banco e o servidor que lê e grava ficam em{" "}
                <strong>São Paulo</strong>. Mas a Vercel e o Neon são empresas estrangeiras e{" "}
                <strong>podem tratar dados fora do Brasil</strong>, inclusive peso, idade e sexo, por exemplo em
                suporte, manutenção e registros técnicos (transferência internacional, LGPD, art. 33).
              </p>
              <p>
                O único cookie é o de sessão, necessário para manter você conectado. Não usamos estatísticas de
                visita, propaganda nem cookies de rastreamento, e não vendemos nem compartilhamos dados com mais
                ninguém.
              </p>
            </>
          ),
        },
        {
          id: "copia-dos-dados",
          title: "Cópia dos seus dados",
          content: (
            <p>
              Se quiser uma cópia de tudo o que está na sua conta, peça pelo contato abaixo, com o e-mail da conta.
              Enviamos os dados num arquivo para esse mesmo e-mail.
            </p>
          ),
        },
        {
          id: "como-apagar",
          title: "Como apagar",
          content: (
            <p>
              Em Ajustes, &quot;Apagar todos os dados&quot; apaga treinos, séries, histórico e cardio e mantém a conta.
              &quot;Excluir conta&quot; apaga a conta e tudo o que está nela. Nos dois casos você não consegue
              recuperar. Cópias podem continuar por um tempo no histórico de recuperação do Neon e em cópias de
              segurança feitas para manutenção. O contador de tentativas por IP não é apagado com a conta.
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
              Para usar o app você cria uma conta com e-mail e senha; guarde a senha com você e não a compartilhe. Seus
              dados ficam na sua conta, e você pode apagá-los ou excluir a conta a qualquer momento em Ajustes. O FitLog
              é um projeto pessoal, sem garantia de que os dados nunca se percam. Detalhes em{" "}
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
