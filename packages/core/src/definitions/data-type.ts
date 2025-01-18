import type { OmitPropsFromUnion } from "../utils/omit";
import type { OrderedRecord } from "../utils/ordered-map";

export type DataType =
  | DataTypeString
  | DataTypeNumber
  | DataTypeBoolean
  | DataTypeObject
  | DataTypeArray;

export interface DataTypeBase {
  id: string;
  name?: string;
  description?: string;
  required?: boolean;
}

export interface DataTypeString extends DataTypeBase {
  type: "string";
  defaultValue?: string;
  multiline?: boolean;
}

export interface DataTypeNumber extends DataTypeBase {
  type: "number";
  defaultValue?: number;
}

export interface DataTypeBoolean extends DataTypeBase {
  type: "boolean";
  defaultValue?: boolean;
}

export interface DataTypeObject extends DataTypeBase {
  type: "object";
  defaultValue?: object;
  properties?: OrderedRecord<DataType>;
}

export interface DataTypeArray extends DataTypeBase {
  type: "array";
  defaultValue?: object[];
  items?: OmitPropsFromUnion<DataType, "id">;
}
