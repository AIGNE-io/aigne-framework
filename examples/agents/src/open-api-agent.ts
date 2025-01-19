import "core-js";
import "reflect-metadata";

import { OpenAPIAgent, Runtime } from "@aigne/core";

const context = new Runtime();
// eg: https://open-meteo.com/
const agent = OpenAPIAgent.create({
  context,
  inputs: {
    version: {
      type: "string",
      required: true,
      in: "path",
    },
    latitude: {
      type: "number",
      in: "query",
    },
    longitude: {
      type: "number",
      in: "query",
    },
    current: {
      type: "string",
      in: "query",
    },
    hourly: {
      type: "string",
      in: "query",
    },
  },
  outputs: {
    $text: {
      type: "string",
      required: true,
    },
  },
  url: "https://api.open-meteo.com/{version}/forecast",
  method: "get",
});

const result = await agent.run({
  version: "v1",
  latitude: 52.52,
  longitude: 13.41,
  current: "temperature_2m",
  hourly: "temperature_2m",
});
console.log(result);
