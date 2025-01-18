import type { ResponseRole, UserInfo } from "@abtnode/client";
import AuthService from "@blocklet/sdk/lib/service/auth";

import { AIGNE_ISSUE_VC_PREFIX } from "../../constants";
import type { ExecutorContext } from "../../executor/base";

export async function issueVC({
  context: { entry },
  userDid,
  name,
  title,
  description,
  reissue = false,
  displayUrl,
  notify = true,
}: {
  context: ExecutorContext;
  userDid: string;
  name: string;
  title: string;
  description: string;
  reissue?: boolean;
  displayUrl?: string;
  notify?: boolean;
}): Promise<{ user: UserInfo; vc: object }> {
  // NOTE: ensure name starts with AIGNE_ISSUE_VC_PREFIX to avoid conflict with internal passports such as admin/owner
  if (!name.startsWith(AIGNE_ISSUE_VC_PREFIX))
    name = `${AIGNE_ISSUE_VC_PREFIX}${name}`;

  await createPassportIfNotExist({ name, title, description });

  const authService = new AuthService();

  const userResult = await authService.getUser(userDid, { includeTags: true });
  if (!userResult.user) throw new Error(`User not found ${userDid}`);

  if (!reissue) {
    const vc = userResult.user.passports.find((p) => p.role === name);
    if (vc) return { user: userResult.user, vc };
  }

  const issueResult = await authService.issuePassportToUser({
    userDid,
    role: name,
    display: displayUrl ? { type: "url", content: displayUrl } : undefined,
    notify,
    notification: JSON.stringify({
      title: `You just received a VC ${title}`,
      body: description,
      attachments: [
        {
          type: "image",
          data: {
            url: displayUrl,
            alt: title,
          },
        },
      ],
      appInfo: {
        title: entry.project.name,
        // logo: getProjectIconUrl(entry.project.id, {
        //   blockletDid: entry.blockletDid,
        //   working: entry.working,
        //   updatedAt: entry.project.updatedAt,
        // }),
        url: entry.appUrl,
        description: entry.project.description,
      },
      poweredBy: {
        name: "AIGNE",
        url: "https://www.aigne.io",
      },
      severity: "success",
    }),
  });

  if (issueResult.code !== ("ok" as any))
    throw new Error(`Issue VC failed got ${issueResult.code}`);

  const vc = issueResult.user.passports.findLast((p) => p.role === name);
  if (!vc) throw new Error("Issue VC got empty result");

  return { user: issueResult.user, vc };
}

const CREATE_PASSPORT_TASKS: { [name: string]: Promise<ResponseRole> } = {};

async function createPassportIfNotExist({
  name,
  title,
  description,
}: {
  name: string;
  title: string;
  description: string;
}) {
  const authService = new AuthService();

  CREATE_PASSPORT_TASKS[name] ??= (async () => {
    try {
      let result = await authService.getRole(name);

      if (!result.role) {
        // Create a role for custom display
        result = await authService.createRole({
          title,
          name,
          description,
          permissions: [],
          extra: JSON.stringify({
            display: "custom",
            types: [name],
          }),
        });
      }

      return result;
    } catch (error) {
      // NOTE: reset task if failed
      delete CREATE_PASSPORT_TASKS[name];
      throw error;
    }
  })();

  return CREATE_PASSPORT_TASKS[name]!;
}
