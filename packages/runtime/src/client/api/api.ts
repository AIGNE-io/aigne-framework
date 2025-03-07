import { checkFetchResponse } from "@aigne/core";
import { createFetch } from "@blocklet/js-sdk";

const fetch = createFetch();

export const fetchApi: typeof fetch = (...args) => fetch(...args).then(checkFetchResponse);
