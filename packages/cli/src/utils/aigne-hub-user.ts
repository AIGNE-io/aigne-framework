import { fetch } from "@aigne/core/utils/fetch.js";
import { joinURL } from "ufo";

export interface UserInfoResult {
  user: Record<string, any>;
  enableCredit: boolean;
  creditBalance: {
    balance: string;
    total: string;
    grantCount: number;
    pendingCredit: string;
  } | null;
  paymentLink: string | null;
  profileLink: string;
}

export async function getUserInfo({
  baseUrl,
  apiKey,
}: {
  baseUrl: string;
  apiKey: string;
}): Promise<UserInfoResult> {
  const response = await fetch(joinURL(baseUrl, "/api/user/info"), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();

  return data;
}
