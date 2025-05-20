import camelize from "camelize-ts";

export function customCamelize<T extends Record<string, unknown>, K extends KeyofUnion<T> = never>(
  obj: T,
  { shallowKeys = [] }: { shallowKeys?: K[] } = {},
): CustomCamelize<T, K> {
  const shallow = Object.fromEntries(
    shallowKeys?.filter((key) => key in obj).map((key) => [key, obj[key as keyof T]]) ?? [],
  );
  const deep = Object.fromEntries(
    Object.entries(obj).filter(([key]) => !shallowKeys?.includes(key as K)),
  );

  return {
    ...camelize(shallow, true),
    ...camelize(deep),
  } as ReturnType<typeof customCamelize<T, K>>;
}

type KeyofUnion<U> = U extends Record<string, unknown> ? keyof U : never;

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S;

const _unique: unique symbol = Symbol();
type _never = typeof _unique;

type ExtractTypeFromUnion<T, U> = Extract<T, U> extends never
  ? _never
  : Extract<T, U> extends Array<infer E>
    ? Array<E>
    : U;

type ExtractTypeWithConstFromUnion<T, U> = Exclude<T, Exclude<T, U>>;

export type CustomCamelize<
  T,
  ShallowKeys extends KeyofUnion<T> | undefined = undefined,
> = ExtractTypeFromUnion<T, never> extends never
  ? never
  : ExtractTypeFromUnion<T, Date> extends Date
    ? ExtractTypeWithConstFromUnion<T, Date> | CustomCamelize<Exclude<T, Date>>
    : ExtractTypeFromUnion<T, RegExp> extends RegExp
      ? ExtractTypeWithConstFromUnion<T, RegExp> | CustomCamelize<Exclude<T, RegExp>>
      : ExtractTypeFromUnion<T, Array<unknown>> extends Array<infer U>
        ? Array<CustomCamelize<U>> | CustomCamelize<Exclude<T, Array<U>>>
        : // biome-ignore lint/complexity/noBannedTypes: <explanation>
          ExtractTypeFromUnion<T, Function> extends Function
          ? // biome-ignore lint/complexity/noBannedTypes: <explanation>
              | ExtractTypeWithConstFromUnion<T, Function>
              // biome-ignore lint/complexity/noBannedTypes: <explanation>
              | CustomCamelize<Exclude<T, Function>>
          : ExtractTypeFromUnion<T, object> extends object
            ? {
                [K in keyof T as Uncapitalize<CamelCase<string & K>>]: K extends Exclude<
                  ShallowKeys,
                  undefined
                >
                  ? T[K]
                  : CustomCamelize<T[K]>;
              }
            : T;
