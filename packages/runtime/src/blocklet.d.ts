declare const blocklet: import("@blocklet/sdk").WindowBlocklet | undefined;

namespace Express {
  interface Request {
    user?: import("@blocklet/sdk/lib/util/login").SessionUser;
  }
}
