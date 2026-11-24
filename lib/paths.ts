/** Central definition of every route in the app. The app lives under `/app`; `/` is the landing. */
export const paths = {
  home: "/app",
  schedule: "/app/agenda",
  workouts: "/app/treinos",
  library: "/app/biblioteca",
  history: "/app/historico",
  progress: "/app/progresso",
  cardio: "/app/cardio",
  settings: "/app/ajustes",
  exercise: (id: string) => `/app/exercicio/${id}`,
  newWorkout: "/app/treino/novo",
  workout: (id: string) => `/app/treino/${id}`,
  editWorkout: (id: string) => `/app/treino/${id}/editar`,
  session: (id: string) => `/app/sessao/${id}`,
  sessionDetail: (id: string) => `/app/historico/${id}`,
  signIn: "/entrar",
  signUp: "/cadastro",
} as const;

/** Query param that carries the page to return to after signing in. */
export const RETURN_PARAM = "de";

/** Sign-in link that brings the person back to `from` afterwards. */
export const signInPath = (from?: string) =>
  from && from !== paths.home
    ? `${paths.signIn}?${RETURN_PARAM}=${encodeURIComponent(from)}`
    : paths.signIn;

/** Route patterns, used for matching (header titles, active tab). */
export const patterns = {
  home: "/app",
  schedule: "/app/agenda",
  workouts: "/app/treinos",
  library: "/app/biblioteca",
  history: "/app/historico",
  progress: "/app/progresso",
  cardio: "/app/cardio",
  settings: "/app/ajustes",
  exercise: "/app/exercicio/:id",
  newWorkout: "/app/treino/novo",
  workout: "/app/treino/:id",
  editWorkout: "/app/treino/:id/editar",
  session: "/app/sessao/:id",
  sessionDetail: "/app/historico/:id",
} as const;

/** The bottom-nav tabs, which are the only screens without a back button. */
export const tabPatterns: string[] = [
  patterns.home,
  patterns.schedule,
  patterns.workouts,
  patterns.history,
  patterns.cardio,
];
