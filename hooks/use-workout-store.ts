import { useCallback, useMemo } from "react";
import type {
  CardioProfile,
  CardioSession,
  Equipment,
  LoadType,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import type { BackupData } from "@/lib/schema";
import {
  STORAGE_KEYS,
  loadCardioProfile,
  loadCardioSessions,
  loadSessions,
  loadSets,
  loadWorkouts,
  saveCardioProfile,
  saveCardioSessions,
  saveSessions,
  saveSets,
  saveWorkouts,
  uid,
} from "@/lib/storage";
import { usePersistedState } from "./use-persisted-state";

export type Store = ReturnType<typeof useWorkoutStore>;

export function useWorkoutStore() {
  const [sets, setSets] = usePersistedState(
    STORAGE_KEYS.sets,
    loadSets,
    saveSets,
  );
  const [workouts, setWorkouts] = usePersistedState(
    STORAGE_KEYS.workouts,
    loadWorkouts,
    saveWorkouts,
  );
  const [sessions, setSessions] = usePersistedState(
    STORAGE_KEYS.sessions,
    loadSessions,
    saveSessions,
  );
  const [cardioSessions, setCardioSessions] = usePersistedState(
    STORAGE_KEYS.cardioSessions,
    loadCardioSessions,
    saveCardioSessions,
  );
  const [cardioProfile, setCardioProfile] = usePersistedState(
    STORAGE_KEYS.cardioProfile,
    loadCardioProfile,
    saveCardioProfile,
  );

  /* ---------- Sets ---------- */
  const addSet = useCallback(
    (
      exerciseId: string,
      equipment: Equipment,
      loadType: LoadType,
      load: number,
      reps: number,
      sessionId?: string,
    ) => {
      const set: WorkoutSet = {
        id: uid(),
        exerciseId,
        sessionId,
        equipment,
        loadType,
        load,
        reps,
        createdAt: Date.now(),
      };
      setSets((prev) => [set, ...prev]);
      return set;
    },
    [setSets],
  );

  const updateSet = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSet, "load" | "reps" | "note">>) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...patch, note: patch.note?.trim() || undefined }
            : s,
        ),
      );
    },
    [setSets],
  );

  const removeSet = useCallback(
    (id: string) => setSets((prev) => prev.filter((s) => s.id !== id)),
    [setSets],
  );

  /* ---------- Workouts ---------- */
  const addWorkout = useCallback(
    (name: string, exerciseIds: string[]) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const workout: Workout = {
        id: uid(),
        name: trimmed,
        exerciseIds,
        createdAt: Date.now(),
      };
      setWorkouts((prev) => [workout, ...prev]);
      return workout;
    },
    [setWorkouts],
  );

  const updateWorkout = useCallback(
    (id: string, patch: Partial<Pick<Workout, "name" | "exerciseIds">>) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, ...patch, name: (patch.name ?? w.name).trim() || w.name }
            : w,
        ),
      );
    },
    [setWorkouts],
  );

  const removeWorkout = useCallback(
    (id: string) => setWorkouts((prev) => prev.filter((w) => w.id !== id)),
    [setWorkouts],
  );

  /* ---------- Sessions ---------- */
  const activeSession = useMemo(
    () => sessions.find((s) => s.finishedAt === null) ?? null,
    [sessions],
  );

  /** Only one session can run at a time: starting again resumes the active one. */
  const startSession = useCallback(
    (workout: Workout | null) => {
      if (activeSession) return activeSession;
      const session: WorkoutSession = {
        id: uid(),
        workoutId: workout?.id ?? null,
        name: workout?.name ?? "Treino livre",
        startedAt: Date.now(),
        finishedAt: null,
      };
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [activeSession, setSessions],
  );

  const finishSession = useCallback(
    (id: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, finishedAt: Date.now() } : s)),
      );
    },
    [setSessions],
  );

  const updateSession = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSession, "note">>) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [setSessions],
  );

  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSets((prev) => prev.filter((s) => s.sessionId !== id));
    },
    [setSessions, setSets],
  );

  /* ---------- Cardio ---------- */
  const addCardioSession = useCallback(
    (data: Omit<CardioSession, "id" | "createdAt">) => {
      const session: CardioSession = {
        ...data,
        id: uid(),
        createdAt: Date.now(),
      };
      setCardioSessions((prev) => [session, ...prev]);
      return session;
    },
    [setCardioSessions],
  );

  const removeCardioSession = useCallback(
    (id: string) =>
      setCardioSessions((prev) => prev.filter((s) => s.id !== id)),
    [setCardioSessions],
  );

  /* ---------- Bulk ---------- */
  const replaceAll = useCallback(
    (data: BackupData) => {
      setSets(data.sets);
      setWorkouts(data.workouts);
      setSessions(data.sessions);
      setCardioSessions(data.cardioSessions);
      setCardioProfile(data.cardioProfile);
    },
    [
      setSets,
      setWorkouts,
      setSessions,
      setCardioSessions,
      setCardioProfile,
    ],
  );

  const clearAll = useCallback(
    () =>
      replaceAll({
        sets: [],
        workouts: [],
        sessions: [],
        cardioSessions: [],
        cardioProfile: null,
      }),
    [replaceAll],
  );

  /* ---------- Derived ---------- */
  const setsByExercise = useMemo(() => {
    const map = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => b.createdAt - a.createdAt);
    return map;
  }, [sets]);

  const setsBySession = useMemo(() => {
    const map = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      if (!s.sessionId) continue;
      const arr = map.get(s.sessionId) ?? [];
      arr.push(s);
      map.set(s.sessionId, arr);
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.createdAt - b.createdAt);
    return map;
  }, [sets]);

  const finishedSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.finishedAt !== null)
        .sort((a, b) => b.startedAt - a.startedAt),
    [sessions],
  );

  return {
    sets,
    workouts,
    sessions,
    setsByExercise,
    setsBySession,
    activeSession,
    finishedSessions,
    cardioSessions,
    cardioProfile,
    saveCardioProfile: (profile: CardioProfile) => setCardioProfile(profile),
    addCardioSession,
    removeCardioSession,
    addSet,
    updateSet,
    removeSet,
    addWorkout,
    updateWorkout,
    removeWorkout,
    startSession,
    finishSession,
    updateSession,
    removeSession,
    replaceAll,
    clearAll,
  };
}
