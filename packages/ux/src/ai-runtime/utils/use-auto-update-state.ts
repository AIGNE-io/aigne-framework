import { useUpdate } from "ahooks";
import {
  type DependencyList,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from "react";

export function useAutoUpdateState<S>(
  initialState: S | (() => S),
  deps: DependencyList,
): [S, Dispatch<SetStateAction<S>>] {
  const update = useUpdate();

  const state = useMemo<S>(
    () =>
      typeof initialState === "function"
        ? (initialState as Function)()
        : initialState,
    deps,
  );

  const prevInitialState = useRef<S>(state);

  const current = useRef<S>(state);

  if (prevInitialState.current !== state) {
    current.current = state;
    prevInitialState.current = state;
  }

  const setState = useCallback<Dispatch<SetStateAction<S>>>((n) => {
    current.current =
      typeof n === "function" ? (n as Function)(current.current) : n;
    update();
  }, []);

  return [current.current, setState];
}
