import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock the database functions
vi.mock("./db", () => ({
  getChatById: vi.fn(),
  getMessagesByChatId: vi.fn(),
  createMessage: vi.fn(),
}));

// Mock the LLM helper
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return ctx;
}

describe("chat.sendMessage with real LLM", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create user message and call LLM with multi-turn context", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Mock chat data
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      model: "gpt-5",
      systemPrompt: "You are a helpful assistant.",
      agentId: null,
      projectId: null,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock message history (previous conversation)
    const mockMessages = [
      {
        id: 1,
        chatId: 1,
        role: "user" as const,
        content: "Hello",
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        chatId: 1,
        role: "assistant" as const,
        content: "Hi! How can I help?",
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: 3,
        chatId: 1,
        role: "user" as const,
        content: "What is AI?",
        metadata: null,
        createdAt: new Date(),
      },
    ];

    // Mock the database calls
    vi.mocked(db.getChatById).mockResolvedValue(mockChat);
    vi.mocked(db.getMessagesByChatId).mockResolvedValue(mockMessages);
    vi.mocked(db.createMessage).mockImplementation(async (data) => ({
      id: Math.random(),
      ...data,
      createdAt: new Date(),
    }));

    // Mock the LLM response
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValue({
      id: "chatcmpl-123",
      created: Date.now(),
      model: "gpt-5",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "AI stands for Artificial Intelligence. It refers to computer systems designed to perform tasks that typically require human intelligence.",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80,
      },
    });

    // Call the procedure
    const result = await caller.chat.sendMessage({
      chatId: 1,
      content: "Tell me more about AI",
    });

    // Verify the result
    expect(result).toBeDefined();
    expect(result.role).toBe("assistant");
    expect(result.content).toContain("Artificial Intelligence");

    // Verify database was called correctly
    expect(db.getChatById).toHaveBeenCalledWith(1);
    expect(db.getMessagesByChatId).toHaveBeenCalledWith(1);

    // Verify createMessage was called twice (user + assistant)
    expect(db.createMessage).toHaveBeenCalledTimes(2);

    // Verify the LLM was called with multi-turn context
    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user", content: "Hello" }),
          expect.objectContaining({ role: "assistant", content: "Hi! How can I help?" }),
          expect.objectContaining({ role: "user", content: "What is AI?" }),
        ]),
      })
    );
  });

  it("should handle LLM errors gracefully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      model: "gpt-5",
      systemPrompt: "You are a helpful assistant.",
      agentId: null,
      projectId: null,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getChatById).mockResolvedValue(mockChat);
    vi.mocked(db.getMessagesByChatId).mockResolvedValue([]);
    vi.mocked(db.createMessage).mockImplementation(async (data) => ({
      id: Math.random(),
      ...data,
      createdAt: new Date(),
    }));

    // Mock LLM error
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM API error"));

    // Call should throw error
    await expect(
      caller.chat.sendMessage({
        chatId: 1,
        content: "Test message",
      })
    ).rejects.toThrow();

    // Verify error message was saved to database
    expect(db.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "assistant",
        content: expect.stringContaining("error"),
      })
    );
  });

  it("should preserve system prompt in multi-turn conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const systemPrompt = "You are a Python expert. Always provide code examples.";
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      model: "gpt-5",
      systemPrompt,
      agentId: null,
      projectId: null,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getChatById).mockResolvedValue(mockChat);
    vi.mocked(db.getMessagesByChatId).mockResolvedValue([]);
    vi.mocked(db.createMessage).mockImplementation(async (data) => ({
      id: Math.random(),
      ...data,
      createdAt: new Date(),
    }));

    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValue({
      id: "chatcmpl-456",
      created: Date.now(),
      model: "gpt-5",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Here's a Python example: def hello(): print('Hello, World!')",
          },
          finish_reason: "stop",
        },
      ],
    });

    await caller.chat.sendMessage({
      chatId: 1,
      content: "Write a hello world program",
    });

    // Verify system prompt was included in LLM call
    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: systemPrompt,
          }),
        ]),
      })
    );
  });
});
