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
