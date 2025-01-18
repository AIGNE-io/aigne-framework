/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import type { DatasetObject, OpenAPIObject } from "../types";

function flattenApiStructure(apiStructure: OpenAPIObject) {
  const flattened: DatasetObject[] = [];

  const paths = apiStructure?.paths || {};
  for (const path in paths) {
    for (const method in paths[path]) {
      const endpoint = (paths[path] as any)?.[method];

      flattened.push({
        id: endpoint["x-id"],
        name: endpoint["x-did"],
        path: endpoint["x-path"],
        method: endpoint["x-method"],
        did: endpoint["x-did"],
        ...endpoint,
      });
    }
  }

  return flattened;
}

export default flattenApiStructure;
