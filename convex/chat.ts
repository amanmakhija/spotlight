import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const getUserChats = query({
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chats = await ctx.db
      .query("chats")
      .filter((q) =>
        q.or(
          q.eq(q.field("userId"), currentUser._id),
          q.eq(q.field("otherUserId"), currentUser._id)
        )
      )
      .collect();

    const chatsWithUserAndLastMessageDetail = await Promise.all(
      chats.map(async (chat) => {
        const otherUser = (
          currentUser._id === chat.otherUserId
            ? await ctx.db.get(chat.userId)
            : await ctx.db.get(chat.otherUserId)
        )!;

        const lastMessage = await ctx.db
          .query("chatMessage")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        const lastReadMessage = await ctx.db
          .query("readReceipts")
          .withIndex("by_chat_and_user", (q) =>
            q.eq("chatId", chat._id).eq("userId", otherUser._id)
          )
          .first();

        const myLastReadMessage = await ctx.db
          .query("readReceipts")
          .withIndex("by_chat_and_user", (q) =>
            q.eq("chatId", chat._id).eq("userId", currentUser._id)
          )
          .first();

        const messagesSentByOtherUser = await ctx.db
          .query("chatMessage")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .order("asc")
          .filter((q) => q.eq(q.field("senderId"), otherUser._id))
          .collect();

        const numberOfUnreadMessages = messagesSentByOtherUser.slice(
          messagesSentByOtherUser.findIndex(
            (m) => m._id === myLastReadMessage?.lastReadMessageId
          ) + 1
        );

        return {
          ...chat,
          otherUser: {
            _id: otherUser._id,
            username: otherUser.username,
            image: otherUser.image,
          },
          lastMessage,
          lastMessageRead: {
            isRead: lastReadMessage
              ? lastReadMessage.lastReadMessageId === lastMessage?._id
              : false,
            readingTime: lastReadMessage?.lastReadMessageTime,
          },
          numberOfUnreadMessages: numberOfUnreadMessages.length,
        };
      })
    );

    return chatsWithUserAndLastMessageDetail;
  },
});

export const createChat = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const chatExists = await ctx.db
      .query("chats")
      .withIndex("by_both_user", (q) =>
        q.eq("userId", currentUser._id).eq("otherUserId", args.userId)
      )
      .first();

    if (chatExists) return chatExists._id;

    return await ctx.db.insert("chats", {
      userId: currentUser._id,
      otherUserId: args.userId,
    });
  },
});

export const getChatMessages = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chatExists = await ctx.db.get(args.id);
    if (!chatExists) throw new Error("Chat not found");

    if (
      chatExists.userId !== currentUser._id &&
      chatExists.otherUserId !== currentUser._id
    )
      throw new Error("Unauthorized");

    return await ctx.db
      .query("chatMessage")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .order("asc")
      .collect();
  },
});

export const getUserDetailsByChatId = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chatExists = await ctx.db.get(args.id);
    if (!chatExists) throw new Error("Chat not found");

    if (
      chatExists.userId !== currentUser._id &&
      chatExists.otherUserId !== currentUser._id
    )
      throw new Error("Unauthorized");

    const otherUser =
      chatExists.userId === currentUser._id
        ? await ctx.db.get(chatExists.otherUserId)
        : await ctx.db.get(chatExists.userId);

    const me = await ctx.db.get(currentUser._id);

    return {
      otherUser: {
        _id: otherUser?._id,
        image: otherUser?.image,
        username: otherUser?.username,
      },
      me: {
        _id: me?._id,
        image: me?.image,
      },
    };
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chatExists = await ctx.db.get(args.chatId);
    if (!chatExists) throw new Error("Chat not found");

    if (
      chatExists.userId !== currentUser._id &&
      chatExists.otherUserId !== currentUser._id
    )
      throw new Error("Unauthorized");

    return await ctx.db.insert("chatMessage", {
      chatId: args.chatId,
      content: args.content,
      senderId: currentUser._id,
    });
  },
});

export const createOrUpdateReadReceipt = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("chatMessage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chatExists = await ctx.db.get(args.chatId);
    if (!chatExists) throw new Error("Chat not found");

    if (
      chatExists.userId !== currentUser._id &&
      chatExists.otherUserId !== currentUser._id
    )
      throw new Error("Unauthorized");

    const readReceipt = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", currentUser._id)
      )
      .first();

    if (readReceipt)
      await ctx.db.patch(readReceipt._id, {
        lastReadMessageId: args.messageId,
        lastReadMessageTime: Date.now(),
      });
    else
      await ctx.db.insert("readReceipts", {
        chatId: args.chatId,
        userId: currentUser._id,
        lastReadMessageId: args.messageId,
        lastReadMessageTime: Date.now(),
      });
  },
});

export const getReadReceipts = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chatExists = await ctx.db.get(args.chatId);
    if (!chatExists) throw new Error("Chat not found");

    if (
      chatExists.userId !== currentUser._id &&
      chatExists.otherUserId !== currentUser._id
    )
      throw new Error("Unauthorized");

    return await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_and_user", (q) =>
        q
          .eq("chatId", args.chatId)
          .eq(
            "userId",
            currentUser._id === chatExists.userId
              ? chatExists.otherUserId
              : chatExists.userId
          )
      )
      .first();
  },
});

export const setTypingStatus = mutation({
  args: { chatId: v.id("chats"), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chat = await ctx.db.get(args.chatId);
    if (!chat) return;

    if (chat.userId !== currentUser._id && chat.otherUserId !== currentUser._id)
      throw new Error("Unauthorized");

    const newStatus = {
      ...(chat.typingStatus ?? {}),
      [currentUser._id]: args.isTyping,
    };

    await ctx.db.patch(args.chatId, {
      typingStatus: newStatus,
    });
  },
});

export const getTypingStatus = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    if (chat.userId !== currentUser._id && chat.otherUserId !== currentUser._id)
      throw new Error("Unauthorized");

    return {
      typingStatus: chat?.typingStatus ?? {},
    };
  },
});
