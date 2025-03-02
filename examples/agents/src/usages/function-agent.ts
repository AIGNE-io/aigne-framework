import { FunctionAgent } from "@aigne/core";

const plus = FunctionAgent.from({
  function: ({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }),
});

const result = await plus.run({ a: 10, b: 1 });

console.log(result);

// output:
// {
//   sum: 11
// }
