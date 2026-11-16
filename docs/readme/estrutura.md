```text
├── app/          rotas do Next (App Router): layout, uma pasta por tela, robots e sitemap;
│                 a tela de cada rota fica ao lado do page.tsx (componentes de cliente)
├── components/   interface reutilizável (log-form, rest-timer, progress-chart…) e StoreProvider (o estado do app, lido com useStore())
├── hooks/        use-workout-store, use-persisted-state (lê e grava o localStorage), use-store, use-theme, use-now
├── lib/
│   ├── schema.ts     validação dos dados e formato do backup
│   ├── storage.ts    chaves e leitura validada dos dados salvos
│   ├── defaults.ts   exercícios e treinos de exemplo
│   ├── stats.ts      recordes, 1RM e série histórica
│   ├── cardio.ts     calorias, FC estimada, zonas, comparação e dicas da esteira
│   ├── format.ts     datas, durações e cargas
│   ├── paths.ts      rotas centralizadas
│   └── router.tsx    Link, useNavigate e useParams sobre o roteador do Next
└── types/        modelos e metadados dos tipos de carga
public/           ícones, manifest, service worker e imagem Open Graph
```
> [!NOTE]
> O estado vive em um único hook (`useWorkoutStore`), servido por Context e persistido por
> `usePersistedState`.
