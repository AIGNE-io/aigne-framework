declare module "bun:test" {
  export function spyOn<T extends object, K extends keyof T | string | symbol>(
    obj: T,
    methodOrPropertyValue: K,
  ): Mock<Extract<T[K], (...args: any[]) => any>>;
}
