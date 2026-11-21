```text
├── app/          rotas do Next (App Router): landing (/), o app em app/app/ (uma pasta por tela), /entrar, /cadastro,
│                 /privacidade, /termos, a API do Better Auth (api/auth), robots e sitemap
├── components/   interface (log-form, rest-timer, progress-chart, auth-form…), SignedInApp (confere a sessão e carrega
│                 os dados) e StoreProvider (o estado do app, lido com useStore())
├── hooks/        use-workout-store (estado em memória, salvo por Server Actions), use-store, use-theme, use-now
├── lib/
│   ├── db/           schema do banco (Drizzle) e conexão com o Postgres
│   ├── data/         consultas, Server Actions e conversão entre linhas do banco e registros do app
│   ├── auth.ts       configuração do Better Auth (e-mail e senha)
│   ├── auth-form.ts  validação dos formulários de entrar e criar conta
│   ├── schema.ts     validação dos dados que chegam ao servidor
│   ├── defaults.ts   treinos de exemplo de cada conta nova
│   ├── stats.ts      recordes, 1RM e série histórica
│   ├── cardio.ts     calorias, FC estimada, zonas, comparação e dicas da esteira
│   ├── format.ts     datas, durações e cargas
│   ├── paths.ts      rotas centralizadas
│   └── router.tsx    Link, useNavigate e useParams sobre o roteador do Next
├── types/        modelos e metadados dos tipos de carga
└── proxy.ts      sem cookie de sessão, /app redireciona para /entrar
drizzle/          migrações SQL geradas pelo drizzle-kit
e2e/              testes de ponta a ponta (Playwright)
public/           ícones, manifest, service worker e imagem Open Graph
```
> [!NOTE]
> O estado vive em um único hook (`useWorkoutStore`), servido por Context. Ele começa com os dados
> que o servidor carregou e manda cada mudança para uma Server Action, que confere a sessão e valida a entrada.
