import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE } from "@aigne/aigne-hub";
import { stringify } from "yaml";
import yargs from "yargs";
import { createHubCommand } from "../../src/commands/hub.js";
import { createHonoServer } from "../_mocks_/server.js";

const mockOpen = mock(() => {});
const mockInquirerPrompt = mock(() => {}) as any;

describe("hub command", () => {
  afterEach(async () => {
    mockInquirerPrompt.mockClear();
  });

  mock.module("open", () => ({ default: mockOpen }));
  mock.module("inquirer", () => ({ default: { prompt: mockInquirerPrompt } }));
  mock.module("../../src/utils/aigne-hub-user.ts", () => ({
    getUserInfo: async () => ({
      user: {
        fullName: "test",
        email: "test@test.com",
        did: "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ",
      },
      creditBalance: { balance: 100, total: 100 },
      paymentLink: "https://test.com",
      profileLink: "https://test.com/profile",
      enableCredit: true,
    }),
  }));

  describe("createHubCommand", () => {
    test("should create hub command with all subcommands", () => {
      const command = createHubCommand();

      expect(command.command).toBe("hub <command>");
      expect(command.describe).toBe("Manage AIGNE Hub connections");
      expect(command.builder).toBeDefined();
      expect(command.handler).toBeDefined();
    });

    test("should handle connect command", async () => {
      mockInquirerPrompt.mockResolvedValue({ isOfficial: true });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "connect"]);

      expect(mockInquirerPrompt).toHaveBeenCalled();
    });

    test("should handle list command", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "list"]);
    });

    test("should handle use command", async () => {
      mockInquirerPrompt.mockResolvedValue({ hubApiKey: "https://hub.aigne.io/ai-kit" });
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "use"]);
    });

    test("should handle status command", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);
    });

    test("should handle info command", async () => {
      mockInquirerPrompt.mockResolvedValue({ hubApiKey: "https://hub.aigne.io/ai-kit" });
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "info"]);
    });

    test("should handle remove command", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "remove"]);
    });
  });

  describe("hub command integration", () => {
    test("should connect to aigne hub successfully", async () => {
      const { close } = await createHonoServer();

      try {
        // Mock inquirer to return official hub choice
        mockInquirerPrompt.mockResolvedValue({ isOfficial: true });

        const command = yargs().command(createHubCommand());
        await command.parseAsync(["hub", "connect"]);

        // Verify that the connection was attempted
        expect(mockInquirerPrompt).toHaveBeenCalled();
      } finally {
        close();
      }
    });

    test("should handle custom hub URL input", async () => {
      // Mock inquirer to return custom hub choice
      mockInquirerPrompt
        .mockResolvedValueOnce({ isOfficial: false })
        .mockResolvedValueOnce({ customUrl: "https://custom.aigne.io" });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "connect"]);

      expect(mockInquirerPrompt).toHaveBeenCalledTimes(2);
    });

    test("should list hubs when no hubs configured", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "list"]);
    });

    test("should show status when no active hub", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);
    });
  });

  describe("hub command with existing configuration", () => {
    beforeEach(async () => {
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          "hub.aigne.io": {
            AIGNE_HUB_API_KEY: "test-key",
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
          "test.example.com": {
            AIGNE_HUB_API_KEY: "another-key",
            AIGNE_HUB_API_URL: "https://test.example.com/ai-kit",
          },
          default: {
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
        }),
      );
    });

    test("should list existing hubs", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "list"]);
    });

    test("should show current status", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);
    });

    test("should allow switching between hubs", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "connect", "https://hub.aigne.io/ai-kit"]);
    });

    test("should allow switching between hubs", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://test.example.com/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "use"]);

      expect(mockInquirerPrompt).toHaveBeenCalled();
    });

    test("should allow removing hubs", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://test.example.com/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "remove"]);

      expect(mockInquirerPrompt).toHaveBeenCalled();
    });

    test("should show hub info", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://hub.aigne.io/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "info"]);

      expect(mockInquirerPrompt).toHaveBeenCalled();
    });
  });

  describe("hub command with existing configuration with empty env", () => {
    beforeEach(async () => {
      await writeFile(AIGNE_ENV_FILE, stringify({}));
    });

    test("should list existing hubs", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "list"]);
    });

    test("should show current status", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);
    });

    test("should allow switching between hubs", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://test.example.com/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "use"]);
    });

    test("should allow removing hubs", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://test.example.com/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "remove"]);
    });

    test("should show hub info", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://hub.aigne.io/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "info"]);
    });
  });
});
