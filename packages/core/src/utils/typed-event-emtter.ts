type EventMap<T> = Record<keyof T, unknown[]>;

export type Args<K, T> = K extends keyof T ? T[K] : never;
export type Listener<K, T> = K extends keyof T
  ? T[K] extends unknown[]
    ? (...args: T[K]) => void
    : never
  : never;

export interface TypedEventEmitter<T extends EventMap<T>, E extends EventMap<E> = T> {
  emit<K extends keyof E>(eventName: K, ...args: Args<K, E>): boolean;
  on<K extends keyof T>(eventName: K, listener: Listener<K, T>): this;
  once<K extends keyof T>(eventName: K, listener: Listener<K, T>): this;
  off<K extends keyof T>(eventName: K, listener: Listener<K, T>): this;
}
