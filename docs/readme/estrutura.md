```text
src/
├── components/   interface reutilizável (LogForm, RestTimer, ProgressChart…)
├── context/      StoreProvider: o estado do app, lido com useStore()
├── hooks/        useWorkoutStore, usePersistedState, useTheme, useNow
├── lib/
│   ├── schema.ts     validação dos dados e formato do backup
│   ├── storage.ts    persistência e migrações versionadas
│   ├── defaults.ts   exercícios e treinos de exemplo
│   ├── stats.ts      recordes, 1RM e série histórica
│   ├── cardio.ts     calorias, FC estimada, zonas, comparação e dicas da esteira
│   ├── format.ts     datas, durações e cargas
│   └── paths.ts      rotas centralizadas
├── pages/        uma tela por rota
└── types.ts      modelos e metadados dos tipos de carga
public/           ícones, manifest, service worker e imagem Open Graph
```
> [!NOTE]
> O estado vive em um único hook (`useWorkoutStore`), servido por Context e persistido por
> `usePersistedState`. O React Compiler está ligado, então o código evita memoização manual.
