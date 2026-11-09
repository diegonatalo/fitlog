### 🧩 Como adicionar um novo tipo de carga

1. Inclua o valor em `LoadType` e uma entrada em `LOAD_TYPES`, em `types.ts` (rótulo, unidade, passo e se tem repetições).
2. Associe um ícone em `ICONS`, em `components/LoadTypeToggle.tsx`.
3. Se a unidade tiver formato especial, trate-a em `loadParts`, em `lib/format.ts`.
4. O validador em `lib/schema.ts` já aceita qualquer valor de `LOAD_TYPES`.
