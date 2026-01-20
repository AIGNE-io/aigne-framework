import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { writeFile } from "node:fs/promises";
import { stringify } from "yaml";
import yargs from "yargs";
import { createHubCommand, formatNumber } from "../../src/commands/hub.js";
import { AIGNE_ENV_FILE } from "../../src/utils/aigne-hub/constants.js";
import { createHonoServer } from "../_mocks_/server.js";

const mockOpen = mock(() => {});
const mockInquirerPrompt = mock(() => {}) as any;
const mockCheckModelAvailability = mock(() => {}) as any;
const mockFetchHubModels = mock(() => {}) as any;

describe("hub command", () => {
  afterEach(async () => {
    mockInquirerPrompt.mockClear();
    mockCheckModelAvailability.mockClear();
    mockFetchHubModels.mockClear();
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
      creditBalance: { balance: 10, total: 1000 },
      paymentLink: "https://test.com",
      profileLink: "https://test.com/profile",
      enableCredit: true,
    }),
  }));
  mock.module("../../src/utils/aigne-hub-models.ts", () => ({
    checkModelAvailability: mockCheckModelAvailability,
    fetchHubModels: mockFetchHubModels,
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

    test("should show hub status", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://hub.aigne.io/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);

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

    test("should show hub status", async () => {
      mockInquirerPrompt.mockResolvedValue({
        hubApiKey: "https://hub.aigne.io/ai-kit",
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "status"]);
    });
  });

  describe("hub models command", () => {
    beforeEach(async () => {
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          "hub.aigne.io": {
            AIGNE_HUB_API_KEY: "test-key",
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
          default: {
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
        }),
      );
    });

    test("should handle models check command", async () => {
      mockCheckModelAvailability.mockResolvedValue({
        model: "openai/gpt-4o",
        available: true,
      });

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "check", "openai/gpt-4o"]);

      expect(mockCheckModelAvailability).toHaveBeenCalled();
    });

    test("should handle models list command", async () => {
      mockFetchHubModels.mockResolvedValue([
        {
          id: "openai/gpt-4o",
          provider: "openai",
          model: "gpt-4o",
          type: "chat",
          available: true,
        },
      ]);

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "list"]);

      expect(mockFetchHubModels).toHaveBeenCalled();
    });

    test("should handle models list with type filter", async () => {
      mockFetchHubModels.mockResolvedValue([]);

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "list", "--type", "chat"]);

      expect(mockFetchHubModels).toHaveBeenCalledWith(expect.objectContaining({ type: "chat" }));
    });

    test("should handle models list with search filter", async () => {
      mockFetchHubModels.mockResolvedValue([]);

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "list", "--search", "gpt"]);

      expect(mockFetchHubModels).toHaveBeenCalledWith(expect.objectContaining({ search: "gpt" }));
    });

    test("should handle models list with limit", async () => {
      mockFetchHubModels.mockResolvedValue([]);

      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "list", "--limit", "10"]);

      expect(mockFetchHubModels).toHaveBeenCalledWith(expect.objectContaining({ limit: 10 }));
    });
  });

  describe("hub models command without configuration", () => {
    beforeEach(async () => {
      await writeFile(AIGNE_ENV_FILE, stringify({}));
    });

    test("should show warning when no hub connected for check", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "check", "openai/gpt-4o"]);

      // Should not call the API
      expect(mockCheckModelAvailability).not.toHaveBeenCalled();
    });

    test("should show warning when no hub connected for list", async () => {
      const command = yargs().command(createHubCommand());
      await command.parseAsync(["hub", "models", "list"]);

      // Should not call the API
      expect(mockFetchHubModels).not.toHaveBeenCalled();
    });
  });
});

describe("formatNumber", () => {
  test("should correctly format pure numeric strings", () => {
    expect(formatNumber("112345670")).toBe("112,345,670");
    expect(formatNumber("1112345670")).toBe("1,112,345,670");
    expect(formatNumber("12345670")).toBe("12,345,670");
    expect(formatNumber("1234567")).toBe("1,234,567");
    expect(formatNumber("100000")).toBe("100,000");
    expect(formatNumber("10000")).toBe("10,000");
    expect(formatNumber("1000")).toBe("1,000");
    expect(formatNumber("100")).toBe("100");
    expect(formatNumber("10")).toBe("10");
    expect(formatNumber("1")).toBe("1");
  });

  test("should handle numeric strings that already contain commas", () => {
    expect(formatNumber("400,000")).toBe("400,000");
    expect(formatNumber("1,234,567")).toBe("1,234,567");
    expect(formatNumber(",400,000")).toBe("400,000");
  });

  test("should handle numbers with decimal points", () => {
    expect(formatNumber("400000.50")).toBe("400,000");
    expect(formatNumber("1234567.99")).toBe("1,234,567");
    expect(formatNumber("1000.0")).toBe("1,000");
  });

  test("should handle strings containing other characters", () => {
    expect(formatNumber("$400,000")).toBe("400,000");
    expect(formatNumber("USD 1,234,567")).toBe("1,234,567");
    expect(formatNumber("Balance: 1000")).toBe("1,000");
  });

  test("should handle empty strings and invalid input", () => {
    expect(formatNumber("")).toBe("0");
    expect(formatNumber("abc")).toBe("0");
    expect(formatNumber("!@#$%")).toBe("0");
    expect(formatNumber("0")).toBe("0");
  });

  test("should handle numeric type input", () => {
    expect(formatNumber("400000")).toBe("400,000");
    expect(formatNumber("0")).toBe("0");
  });

  test("should handle edge cases", () => {
    expect(formatNumber("999")).toBe("999");
    expect(formatNumber("1000")).toBe("1,000");
    expect(formatNumber("999999")).toBe("999,999");
    expect(formatNumber("1000000")).toBe("1,000,000");
  });
});
