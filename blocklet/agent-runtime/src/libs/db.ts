import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export interface LinkData {
  position: number;
  title: string;
  link: string;
  domain: string;
  source: string;
  favicon: string;
  snippet: string;
}

export interface ImageData {
  position: number;
  title: string;
  source: string;
  link: string;
  thumbnail: string;
  original: string;
  width: number;
  height: number;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  userId: string;
  sessionId: string;
  links?: LinkData[];
  images?: ImageData[];
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  messageCount: number;
}

interface ChatDB extends DBSchema {
  messages: {
    key: string;
    value: Message;
    indexes: { "by-timestamp": number; "by-session": string };
  };
  sessions: {
    key: string;
    value: ChatSession;
    indexes: { "by-user": string; "by-timestamp": number };
  };
  counter: {
    key: string;
    value: {
      key: string;
      value: number;
    };
  };
}

const DB_NAME = "chat-history";
const DB_VERSION = 3;

let db: IDBPDatabase<ChatDB>;

const initDB = async () => {
  try {
    db = await openDB<ChatDB>(DB_NAME, DB_VERSION, {
      async upgrade(database, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          const messageStore = database.createObjectStore("messages", {
            keyPath: "id",
          });
          messageStore.createIndex("by-timestamp", "timestamp");
        }
        if (oldVersion < 2) {
          database.createObjectStore("counter", {
            keyPath: "key",
          });
        }
        if (oldVersion < 3) {
          // 创建 sessions store
          if (!database.objectStoreNames.contains("sessions")) {
            const sessionStore = database.createObjectStore("sessions", { keyPath: "id" });
            sessionStore.createIndex("by-user", "userId");
            sessionStore.createIndex("by-timestamp", "updatedAt");
          }
          // 如果 messages store 存在，先删除它
          if (database.objectStoreNames.contains("messages")) {
            const messages = transaction.objectStore("messages");
            messages.createIndex("by-session", "sessionId");
            const userId = localStorage.getItem("user_id") || localStorage.getItem("temp_user_id");
            if (userId) {
              // Create default session
              const defaultSessionId = `default-${userId}`;
              const now = Date.now();
              const defaultSession = {
                id: defaultSessionId,
                title: "New Chat",
                userId,
                createdAt: now,
                updatedAt: now,
                messageCount: 0,
              };
              const sessionStore = transaction.objectStore("sessions");
              await sessionStore.add(defaultSession);
              // Update existing messages with default session ID
              const messageStore = transaction.objectStore("messages");
              const existingMessages = await messageStore.getAll();
              for (const message of existingMessages) {
                if (message.userId === userId) {
                  message.sessionId = defaultSessionId;
                  await messageStore.put(message);
                }
              }
            }
          } else {
            // 重新创建 messages store 并添加所有索引
            const messageStore = database.createObjectStore("messages", { keyPath: "id" });
            messageStore.createIndex("by-timestamp", "timestamp");
            messageStore.createIndex("by-session", "sessionId");
          }
        }
      },
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// 确保在使用数据库前已经初始化
const getDB = async () => {
  if (!db) {
    await initDB();
  }
  return db;
};

export const saveMessage = async (message: Omit<Message, "timestamp">) => {
  const database = await getDB();
  const timestamp = Date.now();

  // Save message
  await database.add("messages", {
    ...message,
    timestamp,
  });
};

export const getAllMessages = async (
  userId?: string,
  limit?: number,
  beforeTimestamp?: number,
  sessionId?: string,
) => {
  const database = await getDB();
  let messages: Message[] = [];

  if (sessionId) {
    messages = await database.getAllFromIndex("messages", "by-session", sessionId);
  } else {
    messages = await database.getAllFromIndex("messages", "by-timestamp");
  }

  // 按用户 ID 过滤
  if (userId) {
    messages = messages.filter((message) => message.userId === userId);
  }

  // 按时间戳过滤
  if (beforeTimestamp) {
    messages = messages.filter((message) => message.timestamp < beforeTimestamp);
  }

  // 正序排序，最新的在底部
  messages.sort((a, b) => a.timestamp - b.timestamp);

  // 限制数量
  if (limit) {
    messages = messages.slice(-limit);
  }

  return messages;
};
