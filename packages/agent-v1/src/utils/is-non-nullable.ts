import isNil from "lodash/isNil";

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}

export function isPropsNonNullable<T, K extends keyof T>(
  ...props: (K | K[])[]
): (value: T) => value is T & Required<Pick<T, K>> {
  return (value: T): value is T & Required<Pick<T, K>> => {
    for (const prop of props.flat()) {
      if (isNil(value?.[prop as K])) return false;
    }
    return true;
  };
}
