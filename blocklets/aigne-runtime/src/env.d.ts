declare var blocklet:
  | {
      prefix: string;
      appName: string;
      appDescription: string;
      logo: string;
      componentMountPoints: {
        did: string;
        title: string;
        mountPoint: string;
      }[];
    }
  | undefined;

declare module "*.svg";

declare module "@arcblock/*";

declare module "@blocklet/*";

declare module "@ocap/*";

declare module "*.css";

declare module "*.png?url";
