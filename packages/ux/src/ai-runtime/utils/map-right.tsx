export default function mapRight<T, R>(
  array: T[],
  fn: (value: T, index: number, arr: T[]) => R,
): R[] {
  const result = new Array(array.length);

  for (let i = array.length - 1; i >= 0; i--) {
    result.push(fn(array[i]!, i, array));
  }

  return result;
}
