import { useState, useCallback, useRef } from "react";

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialPresent: T, options: { maxHistory?: number } = {}) {
  const maxHistory = options.maxHistory ?? 50;

  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  // Ref to track if we're currently undoing/redoing to avoid pushing to history
  const isTimeTraveling = useRef(false);

  const setPresent = useCallback(
    (updater: T | ((prev: T) => T)) => {
      if (isTimeTraveling.current) {
        // During undo/redo, just update present without pushing to history
        setState((prev) => ({
          ...prev,
          present: typeof updater === "function" ? (updater as (p: T) => T)(prev.present) : updater,
        }));
        return;
      }

      setState((prev) => {
        const nextPresent = typeof updater === "function" ? (updater as (p: T) => T)(prev.present) : updater;
        // Don't push if state is identical (shallow compare for objects)
        if (nextPresent === prev.present) return prev;

        const nextPast = [...prev.past, prev.present];
        if (nextPast.length > maxHistory) {
          nextPast.shift();
        }

        return {
          past: nextPast,
          present: nextPresent,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback(
    (newPresent: T) => {
      setState({
        past: [],
        present: newPresent,
        future: [],
      });
    },
    []
  );

  return {
    state: state.present,
    setState: setPresent,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    historyLength: state.past.length,
    reset,
  };
}
