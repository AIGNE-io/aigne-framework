import { joinURL } from "ufo";

// User session response interface
export interface UserSessionResponse {
  user: {
    did: string;
    pk: string;
    fullName: string;
    email: string;
    avatar: string;
    role: string;
    remark: string;
    sourceProvider: string;
    locale: string;
    approved: boolean;
    firstLoginAt: string;
    lastLoginAt: string;
    lastLoginIp: string;
    createdAt: string;
    updatedAt: string;
    sourceAppPid: string | null;
    didSpace: {
      did: string;
      name: string;
      endpoint: string;
      url: string;
    };
    url: string;
    phone: string | null;
    inviter: string | null;
    generation: number;
    emailVerified: boolean;
    phoneVerified: boolean;
    passkeyCount: number;
    metadata: Record<string, unknown>;
    address: Record<string, unknown>;
    connectedAccounts: Array<Record<string, unknown>>;
    passports: Array<Record<string, unknown>>;
    permissions: Array<Record<string, unknown>>;
  };
  provider: string;
  $signature: string;
}

export async function getCurrentUser(input: {
  appUrl: string;
  accessToken: string;
}): Promise<UserSessionResponse> {
  const { appUrl, accessToken } = input;

  const url = new URL(appUrl);
  const sessionUrl = joinURL(url.origin, "/.well-known/service/api/did/session");

  const response = await fetch(sessionUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get current user: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
