import { describe, expect, it } from "bun:test";
import { camelize, snakelize } from "@aigne/afs-utils/zod/camelize.js";

describe("camelize", () => {
  describe("Basic type handling", () => {
    it("should handle empty object", () => {
      expect(camelize({})).toEqual({});
    });

    it("should handle empty array", () => {
      expect(camelize([])).toEqual([]);
    });
  });

  describe("Object processing", () => {
    it("should convert object keys to camelCase", () => {
      const input = {
        user_name: "John",
        first_name: "Doe",
        email_address: "john@example.com",
      };
      const expected = {
        userName: "John",
        firstName: "Doe",
        emailAddress: "john@example.com",
      };
      expect(camelize(input)).toEqual(expected);
    });

    it("should handle already camelCase keys", () => {
      const input = {
        userName: "John",
        firstName: "Doe",
      };
      expect(camelize(input)).toEqual(input);
    });

    it("should handle underscore separated keys", () => {
      const input = {
        api_key: "secret",
        access_token: "token123",
      };
      const expected = {
        apiKey: "secret",
        accessToken: "token123",
      };
      expect(camelize(input)).toEqual(expected);
    });
  });

  describe("Array processing", () => {
    it("should handle string arrays", () => {
      const input = ["hello", "world"];
      expect(camelize(input)).toEqual(input);
    });

    it("should handle object arrays", () => {
      const input = [
        { user_name: "John", first_name: "Doe" },
        { user_name: "Jane", first_name: "Smith" },
      ];
      const expected = [
        { userName: "John", firstName: "Doe" },
        { userName: "Jane", firstName: "Smith" },
      ];
      expect(camelize(input)).toEqual(expected);
    });

    it("should handle nested arrays", () => {
      const input = [[{ user_name: "John" }], [{ user_name: "Jane" }]];
      const expected = [[{ userName: "John" }], [{ userName: "Jane" }]];
      expect(camelize(input)).toEqual(expected);
    });
  });

  describe("Nested object processing", () => {
    it("should recursively convert nested objects", () => {
      const input = {
        user_info: {
          first_name: "John",
          last_name: "Doe",
          contact_details: {
            email_address: "john@example.com",
            phone_number: "123-456-7890",
          },
        },
        account_settings: {
          notification_preferences: {
            email_notifications: true,
            sms_notifications: false,
          },
        },
      };
      const expected = {
        userInfo: {
          firstName: "John",
          lastName: "Doe",
          contactDetails: {
            emailAddress: "john@example.com",
            phoneNumber: "123-456-7890",
          },
        },
        accountSettings: {
          notificationPreferences: {
            emailNotifications: true,
            smsNotifications: false,
          },
        },
      };
      expect(camelize(input)).toEqual(expected);
    });

    it("should handle nested objects with arrays", () => {
      const input = {
        user_list: [
          { first_name: "John", last_name: "Doe" },
          { first_name: "Jane", last_name: "Smith" },
        ],
        settings: {
          theme_options: ["dark", "light"],
        },
      };
      const expected = {
        userList: [
          { firstName: "John", lastName: "Doe" },
          { firstName: "Jane", lastName: "Smith" },
        ],
        settings: {
          themeOptions: ["dark", "light"],
        },
      };
      expect(camelize(input)).toEqual(expected);
    });
  });

  describe("Shallow conversion", () => {
    it("should only convert top-level keys", () => {
      const input = {
        user_info: {
          first_name: "John",
          last_name: "Doe",
        },
        account_settings: {
          email_notifications: true,
        },
      };
      const expected = {
        userInfo: {
          first_name: "John",
          last_name: "Doe",
        },
        accountSettings: {
          email_notifications: true,
        },
      };
      expect(camelize(input, true)).toEqual(expected);
    });
  });

  describe("Edge cases", () => {
    it("should handle keys starting with numbers", () => {
      const input = {
        "1st_name": "John",
        "2nd_name": "Doe",
      };
      const expected = {
        "1stName": "John",
        "2ndName": "Doe",
      };
      expect(camelize(input)).toEqual(expected);
    });

    it("should handle keys starting with uppercase letters", () => {
      const input = {
        User_name: "John",
        Email_address: "john@example.com",
      };
      const expected = {
        userName: "John",
        emailAddress: "john@example.com",
      };
      expect(camelize(input)).toEqual(expected);
    });
  });

  describe("Type safety", () => {
    it("should preserve original types", () => {
      const input = {
        user_name: "John",
        age: 30,
        is_active: true,
      };
      const result = camelize(input);
      expect(typeof result.userName).toBe("string");
      expect(typeof result.age).toBe("number");
      expect(typeof result.isActive).toBe("boolean");
    });
  });
});

describe("snakelize", () => {
  describe("Basic type handling", () => {
    it("should handle string input", () => {
      expect(snakelize("helloWorld")).toBe("hello_world");
    });

    it("should handle empty object", () => {
      expect(snakelize({})).toEqual({});
    });

    it("should handle empty array", () => {
      expect(snakelize([])).toEqual([]);
    });
  });

  describe("Object processing", () => {
    it("should convert object keys to snake_case", () => {
      const input = {
        userName: "John",
        firstName: "Doe",
        emailAddress: "john@example.com",
      };
      const expected = {
        user_name: "John",
        first_name: "Doe",
        email_address: "john@example.com",
      };
      expect(snakelize(input)).toEqual(expected);
    });
  });

  describe("Shallow conversion", () => {
    it("should only convert top-level keys", () => {
      const input = {
        userInfo: {
          firstName: "John",
          lastName: "Doe",
        },
        accountSettings: {
          emailNotifications: true,
        },
      };
      const expected = {
        user_info: {
          firstName: "John",
          lastName: "Doe",
        },
        account_settings: {
          emailNotifications: true,
        },
      };
      expect(snakelize(input, true)).toEqual(expected);
    });
  });

  describe("Edge cases", () => {
    it("should handle keys starting with numbers", () => {
      const input = {
        "1stName": "John",
        "2ndName": "Doe",
      };
      const expected = {
        "1st_name": "John",
        "2nd_name": "Doe",
      };
      expect(snakelize(input)).toEqual(expected);
    });

    it("should handle keys starting with uppercase letters", () => {
      const input = {
        UserName: "John",
        EmailAddress: "john@example.com",
      };
      const expected = {
        user_name: "John",
        email_address: "john@example.com",
      };
      expect(snakelize(input)).toEqual(expected);
    });
  });

  describe("Type safety", () => {
    it("should preserve original types", () => {
      const input = {
        userName: "John",
        age: 30,
        isActive: true,
      };
      const result = snakelize(input);
      expect(typeof result.user_name).toBe("string");
      expect(typeof result.age).toBe("number");
      expect(typeof result.is_active).toBe("boolean");
    });
  });
});
