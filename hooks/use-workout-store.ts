import { useCallback, useMemo, useState } from "react";
import type {
  CardioProfile,
  CardioSession,
  Equipment,
  LoadType,
  Plan,
  Schedule,
  Workout,
  WorkoutSession,
  WorkoutSet,
} from "@/types";
import type { AppData, BackupData } from "@/lib/schema";
import { EMPTY_BACKUP } from "@/lib/schema";
import { uid } from "@/lib/storage";
import { clampRest } from "@/lib/rest";
import {
  clearDay,
  removeWorkoutFromSchedule,
  setDayPlan,
  setRepeat,
  stopRepeat,
} from "@/lib/schedule";

export type Store = ReturnType<typeof useWorkoutStore>;

/** Where each change is saved. In the app these are the Server Actions. */
export type Persistence = {
  saveSet: (set: WorkoutSet) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  saveWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  saveSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  saveCardioSession: (session: CardioSession) => Promise<void>;
  deleteCardioSession: (id: string) => Promise<void>;
  saveSchedule: (schedule: Schedule) => Promise<void>;
  saveCardioProfile: (profile: CardioProfile) => Promise<void>;
  saveRestSeconds: (seconds: number) => Promise<void>;
  replaceAllData: (data: BackupData) => Promise<void>;
};

/**
 * The person's data, kept in memory and saved in the background: the screen
 * updates at once and each change goes to `persist`; `saving` stays on until
 * every change has arrived. If a save fails,
 * `syncError` turns on so the app can ask for a reload (the database is the
 * source of truth on the next visit).
 */
export function useWorkoutStore(initial: AppData, persist: Persistence) {
  const [sets, setSets] = useState(initial.sets);
  const [workouts, setWorkouts] = useState(initial.workouts);
  const [sessions, setSessions] = useState(initial.sessions);
  const [cardioSessions, setCardioSessions] = useState(initial.cardioSessions);
  const [cardioProfile, setCardioProfile] = useState(initial.cardioProfile);
  const [schedule, setSchedule] = useState(initial.schedule);
  const [restSeconds, setRestSecondsState] = useState(initial.restSeconds);
  const [syncError, setSyncError] = useState(false);
  const [pendingSaves, setPendingSaves] = useState(0);

  const sync = useCallback((save: Promise<void>) => {
    setPendingSaves((n) => n + 1);
    save
      .catch((error: unknown) => {
        console.error(error);
        setSyncError(true);
      })
      .finally(() => setPendingSaves((n) => n - 1));
  }, []);

  const setRestSeconds = useCallback(
    (seconds: number) => {
      const next = clampRest(seconds);
      setRestSecondsState(next);
      sync(persist.saveRestSeconds(next));
    },
    [persist, sync],
  );

  /** Applies a schedule change and saves the result. */
  const changeSchedule = useCallback(
    (change: (prev: Schedule) => Schedule) => {
      const next = change(schedule);
      setSchedule(next);
      sync(persist.saveSchedule(next));
    },
    [schedule, persist, sync],
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
      sync(persist.saveSet(set));
      return set;
    },
    [persist, sync],
  );

  const updateSet = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSet, "load" | "reps" | "note">>) => {
      const current = sets.find((s) => s.id === id);
      if (!current) return;
      const next: WorkoutSet = {
        ...current,
        ...patch,
        // only touch the note when the patch carries one
        note: "note" in patch ? patch.note?.trim() || undefined : current.note,
      };
      setSets((prev) => prev.map((s) => (s.id === id ? next : s)));
      sync(persist.saveSet(next));
    },
    [sets, persist, sync],
  );

  const removeSet = useCallback(
    (id: string) => {
      setSets((prev) => prev.filter((s) => s.id !== id));
      sync(persist.deleteSet(id));
    },
    [persist, sync],
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
      sync(persist.saveWorkout(workout));
      return workout;
    },
    [persist, sync],
  );

  const updateWorkout = useCallback(
    (id: string, patch: Partial<Pick<Workout, "name" | "exerciseIds">>) => {
      const current = workouts.find((w) => w.id === id);
      if (!current) return;
      const next: Workout = {
        ...current,
        ...patch,
        name: (patch.name ?? current.name).trim() || current.name,
      };
      setWorkouts((prev) => prev.map((w) => (w.id === id ? next : w)));
      sync(persist.saveWorkout(next));
    },
    [workouts, persist, sync],
  );

  const removeWorkout = useCallback(
    (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      sync(persist.deleteWorkout(id));
      changeSchedule((prev) => removeWorkoutFromSchedule(prev, id));
    },
    [persist, sync, changeSchedule],
  );

  /* ---------- Schedule ---------- */
  const planDay = useCallback(
    (date: string, plan: Plan, repeatWeekly: boolean) => {
      if (plan.type === "none") changeSchedule((prev) => clearDay(prev, date));
      else if (repeatWeekly) changeSchedule((prev) => setRepeat(prev, date, plan, uid()));
      else changeSchedule((prev) => setDayPlan(prev, date, plan));
    },
    [changeSchedule],
  );

  const stopRepeating = useCallback(
    (date: string) => changeSchedule((prev) => stopRepeat(prev, date, uid())),
    [changeSchedule],
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
      sync(persist.saveSession(session));
      return session;
    },
    [activeSession, persist, sync],
  );

  const changeSession = useCallback(
    (id: string, change: (s: WorkoutSession) => WorkoutSession) => {
      const current = sessions.find((s) => s.id === id);
      if (!current) return;
      const next = change(current);
      setSessions((prev) => prev.map((s) => (s.id === id ? next : s)));
      sync(persist.saveSession(next));
    },
    [sessions, persist, sync],
  );

  const finishSession = useCallback(
    (id: string) => changeSession(id, (s) => ({ ...s, finishedAt: Date.now() })),
    [changeSession],
  );

  const updateSession = useCallback(
    (id: string, patch: Partial<Pick<WorkoutSession, "note">>) =>
      changeSession(id, (s) => ({ ...s, ...patch })),
    [changeSession],
  );

  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSets((prev) => prev.filter((s) => s.sessionId !== id));
      sync(persist.deleteSession(id));
    },
    [persist, sync],
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
      sync(persist.saveCardioSession(session));
      return session;
    },
    [persist, sync],
  );

  const removeCardioSession = useCallback(
    (id: string) => {
      setCardioSessions((prev) => prev.filter((s) => s.id !== id));
      sync(persist.deleteCardioSession(id));
    },
    [persist, sync],
  );

  const saveCardioProfile = useCallback(
    (profile: CardioProfile) => {
      setCardioProfile(profile);
      sync(persist.saveCardioProfile(profile));
    },
    [persist, sync],
  );

  /* ---------- Bulk ---------- */
  const replaceAll = useCallback(
    (data: BackupData) => {
      setSets(data.sets);
      setWorkouts(data.workouts);
      setSessions(data.sessions);
      setCardioSessions(data.cardioSessions);
      setCardioProfile(data.cardioProfile);
      setSchedule(data.schedule);
      sync(persist.replaceAllData(data));
    },
    [persist, sync],
  );

  const clearAll = useCallback(() => replaceAll(EMPTY_BACKUP), [replaceAll]);

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
    schedule,
    planDay,
    stopRepeating,
    restSeconds,
    setRestSeconds,
    cardioSessions,
    cardioProfile,
    saveCardioProfile,
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
    syncError,
    /** true while a change is still on its way to the server */
    saving: pendingSaves > 0,
  };
}
