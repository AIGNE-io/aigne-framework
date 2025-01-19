import "core-js";
import "reflect-metadata";

import { OpenAPIAgent, Runtime } from "@aigne/core";

const context = new Runtime();

const agent = OpenAPIAgent.create({
  context,
  name: "weather_forecast",
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
  },
  outputs: {
    current_units: {
      type: "object",
      required: true,
      properties: {
        time: {
          type: "string",
          required: true,
        },
        temperature_2m: {
          type: "string",
          required: true,
        },
      },
    },
    current: {
      type: "object",
      required: true,
      properties: {
        time: {
          type: "string",
          required: true,
        },
        temperature_2m: {
          type: "number",
          required: true,
        },
      },
    },
  },
  url: "https://api.open-meteo.com/{version}/forecast?current=temperature_2m",
  method: "get",
});

const result = await agent.run({
  version: "v1",
  latitude: 24.8797,
  longitude: 102.8332,
});

console.log(result);
