import { isAgentResponseDelta, isAgentResponseProgress } from "@aigne/core";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { useLocaleContext } from "@arcblock/ux/lib/Locale/context";
import { Box, Container, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { joinURL } from "ufo";
import { v4 as uuidv4 } from "uuid";
import ChatInput from "../components/chat-input.tsx";
import MessageBubble from "../components/message-bubble.tsx";
import TextLoading from "../components/text-loading.tsx";
import TypingIndicator from "../components/typing-indicator.tsx";
import { useSessionContext } from "../contexts/session.ts";
import type { Message as DBMessage } from "../libs/db.ts";

type Message = DBMessage & { taskTitle?: string };

function Chat() {
  const { locale } = useLocaleContext();
  const { session } = useSessionContext();
  const [aiChatting, setAiChatting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiResponseRef = useRef("");
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>(undefined);
  const isWaitingToLoadRef = useRef(false);
  const prefix = window?.blocklet?.prefix || "/";

  const scrollToBottom = useCallback((instant = false) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
    }, 100);
  }, []);

  // 新消息到来时滚动到底部
  useEffect(() => {
    // 只有在不是加载历史消息且不是初始加载时才自动滚动到底部
    if (
      messages.length > 0 &&
      !isWaitingToLoadRef.current &&
      messages[messages.length - 1]?.isUser
    ) {
      const container = document.querySelector(".messages-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, messages.length]);

  // 移除旧的滚动处理
  useEffect(() => {
    const container = document.querySelector(".messages-container");
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && !isScrolling.current) {
        isScrolling.current = true;
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // eslint-disable-next-line consistent-return
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const run = useCallback(
    async (question: string, userId: string, sessionId: string) => {
      setAiChatting(true);
      aiResponseRef.current = "";
      setStreamingMessage(null);

      try {
        const agent = await fetch(joinURL(window.location.origin, prefix, "/api/chat/agent"))
          .then((res) => res.json())
          .catch(() => null);
        const client = new AIGNEHTTPClient({
          url: joinURL(window.location.origin, prefix, "/api/chat"),
        });
        const chatbot = await client.getAgent<any, { message: string }>({
          name: (agent?.data || "").replace(".yaml", ""),
        });
        const stream = await client.invoke(
          chatbot,
          { message: question },
          { streaming: true, returnProgressChunks: true, userContext: { sessionId } },
        );

        let fullText = "";
        const json: any = {};

        const message: Message = {
          id: "streaming",
          text: fullText,
          isUser: false,
          timestamp: Date.now(),
          userId,
          sessionId,
        };

        // Safari compatibility: use reader instead of for await...of
        try {
          let previousTaskTitleAgent: string | undefined;

          // @ts-ignore
          for await (const chunk of stream) {
            if (isAgentResponseDelta(chunk)) {
              // @ts-ignore
              const text = chunk.delta?.text?.message;
              if (text) {
                fullText += text;
                message.text = fullText;
              }
              if (chunk.delta?.json) {
                Object.assign(json, chunk.delta.json);
              }
            }

            if (isAgentResponseProgress(chunk)) {
              const { progress } = chunk;

              if (progress.event === "agentStarted" && progress.taskTitle) {
                previousTaskTitleAgent = progress.agent.name;
                message.taskTitle = progress.taskTitle;
              }

              if (progress.event === "agentSucceed" || progress.event === "agentFailed") {
                if (previousTaskTitleAgent === progress.agent.name) {
                  message.taskTitle = undefined;
                  previousTaskTitleAgent = undefined;
                }
              }
            }

            setStreamingMessage({ ...message });
          }
        } catch (iteratorError) {
          console.error("Stream iteration error:", iteratorError);
          throw iteratorError;
        }

        const aiMessage = {
          ...message,
          id: uuidv4(),
          isUser: false,
          timestamp: Date.now(),
          userId,
          sessionId,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setStreamingMessage(null);
        setAiChatting(false);
      } catch (error) {
        console.error("Error during streaming:", error);
        setAiChatting(false);
        setStreamingMessage(null);
      }
    },
    [locale],
  );

  // 只在有新消息时滚动到底部
  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage, scrollToBottom]);

  // 监听窗口高度变化并滚动到底部
  useEffect(() => {
    const handleResize = () => {
      scrollToBottom(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(
    async (message: string, userId: string, sessionId: string) => {
      const newUserMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: Date.now(),
        userId,
        sessionId,
      };
      setMessages((prev) => [...prev, newUserMessage]);
      run(message, userId, sessionId);
    },
    [run],
  );

  useEffect(() => {
    if (!session.user) {
      session.login();
    }
  }, [session.user]);

  if (!session) {
    return null;
  }

  return (
    <Box
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        className="messages-container"
        sx={{
          flex: 1,
          overflow: "auto",
          py: 1.5,
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            flex: 1,
            px: { xs: 1, sm: 2 },
            mx: "auto",
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px" },
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Box>
            {messages.map((message, index) => (
              <Box key={message.id}>
                {message.text && (
                  <MessageBubble
                    id={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    isLast={index === messages.length - 1}
                    links={message.links}
                    images={message.images}
                  />
                )}
              </Box>
            ))}

            {aiChatting && (
              <>
                {streamingMessage && (
                  <Box>
                    {streamingMessage.text && (
                      <MessageBubble
                        id="streaming"
                        key="streaming"
                        message={streamingMessage.text}
                        isUser={false}
                        isLast={false}
                        images={streamingMessage.images}
                      />
                    )}
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TypingIndicator />
                  {streamingMessage && !streamingMessage?.text && streamingMessage?.taskTitle && (
                    <Typography variant="caption" color="grey">
                      <TextLoading>{streamingMessage?.taskTitle}</TextLoading>
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <div ref={messagesEndRef} />
          </Box>
        </Container>
      </Box>

      <Box sx={{ pt: 1, pb: 1.5, px: { xs: 1, sm: 2 } }}>
        <Container
          maxWidth="md"
          sx={{
            px: { xs: 1, sm: 2 },
            mx: "auto",
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px" },
          }}
        >
          <ChatInput
            onSend={(message) => handleSendMessage(message, session?.user?.did, "")}
            disabled={aiChatting}
          />
        </Container>
      </Box>
    </Box>
  );
}

export default Chat;
