import { mock } from "bun:test";

// Only mock in CI environment
let mockCredentials: Map<string, Map<string, string>> | undefined;
let mockKeyring: any;

if (process.env.CI) {
  mockCredentials = new Map<string, Map<string, string>>();

  mockKeyring = {
    getPassword: mock(async (service: string, account: string) => {
      const serviceMap = mockCredentials?.get(service);
      return serviceMap?.get(account) || null;
    }),
    setPassword: mock(async (service: string, account: string, password: string) => {
      if (!mockCredentials?.has(service)) {
        mockCredentials?.set(service, new Map());
      }
      const serviceMap = mockCredentials?.get(service);
      if (serviceMap) {
        serviceMap.set(account, password);
      }
    }),
    deletePassword: mock(async (service: string, account: string) => {
      const serviceMap = mockCredentials?.get(service);
      if (!serviceMap) return false;
      const existed = serviceMap.has(account);
      serviceMap.delete(account);
      if (serviceMap.size === 0) {
        mockCredentials?.delete(service);
      }
      return existed;
    }),
    findCredentials: mock(async (service: string) => {
      const serviceMap = mockCredentials?.get(service);
      if (!serviceMap || serviceMap.size === 0) return [];
      return Array.from(serviceMap.entries()).map(([account, password]) => ({
        account,
        password,
      }));
    }),
  };

  mock.module("@zowe/secrets-for-zowe-sdk", () => ({
    keyring: mockKeyring,
  }));
}

export { mockCredentials, mockKeyring };
