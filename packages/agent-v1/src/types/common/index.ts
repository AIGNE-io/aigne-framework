export interface ModelInfoBase {
  brand: string;
  model: string;
  name?: string;
  disabled?: boolean;
}

export interface TextModelInfo extends ModelInfoBase {
  temperatureMin?: number;
  temperatureMax?: number;
  temperatureDefault?: number;
  topPMin?: number;
  topPMax?: number;
  topPDefault?: number;
  presencePenaltyMin?: number;
  presencePenaltyMax?: number;
  presencePenaltyDefault?: number;
  frequencyPenaltyMin?: number;
  frequencyPenaltyMax?: number;
  frequencyPenaltyDefault?: number;
  maxTokensMin?: number;
  maxTokensMax?: number;
  maxTokensDefault?: number;
}

export type ServiceMode = "single" | "multiple";
export type ServiceModePermissionMap = {
  ensureViewAllProjectsRoles: string[] | undefined;
  ensurePromptsEditorRoles: string[] | undefined;
  ensurePromptsAdminRoles: string[] | undefined;
};

export interface ImageModelInfo extends ModelInfoBase {
  brand: string;
  model: string;
  nMin?: number;
  nMax?: number;
  nDefault?: number;
  disabled?: boolean;
  quality?: string[];
  qualityDefault?: "standard" | "hd";
  responseFormat?: string[];
  responseFormatDefault?: "url" | "b64_json";
  size?: string[];
  sizeDefault?: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024";
  style?: string[];
  styleDefault?: "vivid" | "natural";
}
