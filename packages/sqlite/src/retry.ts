export interface WithRetryOptions {
  max?: number;
  backoffBase?: number;
  backoffExponent?: number;
  backoffJitter?: number;
  shouldRetry?: (err: any) => boolean;
}

function isDBLockedError(error: any): boolean {
  let err = error;

  while (err) {
    if (!(err instanceof Error)) return false;

    if (typeof err.message !== "string") return false;

    const isLock = err.message.includes("SQLITE_BUSY");
    if (isLock) return true;

    err = err.cause;
  }

  return false;
}

export function withRetry<T extends object>(
  db: T,
  methods: (keyof T)[],
  {
    max = 20,
    backoffBase = 300,
    backoffExponent = 1.2,
    backoffJitter = 100,
    shouldRetry = isDBLockedError,
  }: WithRetryOptions = {},
): T {
  return new Proxy(db, {
    get(target, prop) {
      const val = (target as any)?.[prop];

      if (methods.includes(prop as keyof T) && typeof val === "function") {
        return async (...args: any[]) => {
          let attempt = 1;

          while (true) {
            try {
              return await val.apply(target, args);
            } catch (err) {
              if (!shouldRetry(err) || ++attempt > max) {
                throw err;
              }

              const exp = backoffExponent ** (attempt - 1);
              const expDelay = backoffBase * exp;
              const jitter = Math.random() * backoffJitter;
              const waitTime = Math.floor(expDelay + jitter);

              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        };
      }
      return val;
    },
  });
}
