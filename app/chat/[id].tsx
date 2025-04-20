import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Text,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/chat.styles";
import ChatMessage from "@/components/ChatMessage";
import { formatDistanceToNow } from "date-fns";

export default function ChatPage() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const chatMessages = useQuery(api.chat.getChatMessages, {
    id: id as Id<"chats">,
  });
  const chatDetails = useQuery(api.chat.getUserDetailsByChatId, {
    id: id as Id<"chats">,
  });
  const readReceipt = useQuery(api.chat.getReadReceipts, {
    chatId: id as Id<"chats">,
  });
  const typingStatus = useQuery(api.chat.getTypingStatus, {
    chatId: id as Id<"chats">,
  });
  const sendMessageMutation = useMutation(api.chat.sendMessage);
  const setReadReceipt = useMutation(api.chat.createOrUpdateReadReceipt);
  const setTyping = useMutation(api.chat.setTypingStatus);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      flatListRef.current?.scrollToEnd();
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!chatMessages || !chatDetails) return;

    const otherUserId = chatDetails.otherUser._id;

    const lastOtherUserMessage = [...chatMessages]
      .reverse()
      .find((msg) => msg.senderId === otherUserId);

    if (!lastOtherUserMessage) return;

    const alreadySeen =
      readReceipt?.lastReadMessageId === lastOtherUserMessage._id;

    if (!alreadySeen) {
      setReadReceipt({
        chatId: id as Id<"chats">,
        messageId: lastOtherUserMessage._id,
      });
    }
  }, [chatMessages, chatDetails, readReceipt]);

  const sendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation({
      content: message,
      chatId: id as Id<"chats">,
    });
    setMessage("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 100);
  };

  const handleTyping = (text: string) => {
    setMessage(text);
    setTyping({
      chatId: id as Id<"chats">,
      isTyping: true,
    });

    setTimeout(() => {
      setTyping({
        chatId: id as Id<"chats">,
        isTyping: false,
      });
    }, 2000);
  };

  return (
    <AppHeader showLeftButton headerText={chatDetails?.otherUser?.username}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        {chatMessages === undefined ||
        chatDetails === undefined ||
        readReceipt === undefined ? (
          <Loader />
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={({ item, index }) => {
              const isCurrentUser = chatDetails?.me?._id === item.senderId;
              const current = chatMessages[index];
              const next = chatMessages[index + 1];
              const prev = chatMessages[index - 1];

              const isSameAsNext = next?.senderId === current.senderId;
              const isSameAsPrev = prev?.senderId === current.senderId;

              let groupPosition: "single" | "first" | "middle" | "last";

              if (!isSameAsPrev && !isSameAsNext) {
                groupPosition = "single";
              } else if (!isSameAsPrev && isSameAsNext) {
                groupPosition = "first";
              } else if (isSameAsPrev && isSameAsNext) {
                groupPosition = "middle";
              } else {
                groupPosition = "last";
              }

              const showAvatar =
                groupPosition === "last" || groupPosition === "single";

              const isSeen =
                index === chatMessages.length - 1 &&
                item._id === readReceipt?.lastReadMessageId;

              return (
                <View>
                  <ChatMessage
                    message={item.content}
                    isCurrentUser={isCurrentUser}
                    userId={item.senderId}
                    profileImage={
                      isCurrentUser
                        ? chatDetails.me?.image!
                        : chatDetails?.otherUser?.image!
                    }
                    showAvatar={showAvatar}
                    groupPosition={groupPosition}
                  />
                  {isSeen && (
                    <View style={styles.statusContainer}>
                      <Text style={styles.seenText}>
                        Seen{" "}
                        {formatDistanceToNow(
                          readReceipt?.lastReadMessageTime!,
                          {
                            addSuffix: true,
                          }
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContainer, { padding: 0 }]}
          />
        )}

        <View style={styles.messageInput}>
          <TextInput
            style={styles.input}
            placeholder="Write something..."
            placeholderTextColor={COLORS.grey}
            value={message}
            onChangeText={handleTyping}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={!message.trim() && styles.hideButton}
          >
            <Ionicons name="send" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppHeader>
  );
}
