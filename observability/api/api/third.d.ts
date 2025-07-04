declare namespace Express {
  interface Request {
    user?: {
      did: string;
      role: string | undefined;
      provider: string;
      fullName: string;
      walletOS: string;
      emailVerified?: boolean;
      phoneVerified?: boolean;
    };
  }
}
