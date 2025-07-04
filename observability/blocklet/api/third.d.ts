declare module "vite-plugin-blocklet";

declare namespace Express {
  interface Request {
    user?: import("@blocklet/sdk/lib/util/login").SessionUser;
  }
}
