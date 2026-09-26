import { useEffect, useSyncExternalStore } from "react";
import { persistSession, readSession, updateUser } from "./mock/api";
import type { StudentUser } from "./mock/types";

type State = { user: StudentUser | null; hydrated: boolean };

let state: State = { user: null, hydrated: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUser(user: StudentUser | null) {
  state = { ...state, user };
  persistSession(user);
  emit();
}

export function patchUser(patch: Partial<StudentUser>) {
  if (!state.user) return;
  const next = { ...state.user, ...patch };
  state = { ...state, user: next };
  updateUser(next);
  emit();
}

export function hydrateSession() {
  if (state.hydrated) return;
  state = { user: readSession(), hydrated: true };
  emit();
}

export function useSession(): State {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
  useEffect(() => {
    hydrateSession();
  }, []);
  return snapshot;
}
