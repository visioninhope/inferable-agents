import { useState, useCallback } from "react";

/**
 * A useState hook that only updates state if the new value is different from the current value.
 * T must be a reference type (object or array).
 */
export function useState2<T extends object>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const setState2 = useCallback(
    (newValue: T) => {
      const hasChanged =
        typeof newValue !== typeof state ||
        ("length" in newValue && "length" in state && newValue.length !== state.length) ||
        JSON.stringify(newValue) !== JSON.stringify(state);

      if (hasChanged) {
        setState(newValue);
      }
    },
    [state]
  );

  return [state, setState2] as const;
}
