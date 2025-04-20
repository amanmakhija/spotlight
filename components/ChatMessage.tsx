import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/chat.styles";

interface ChatMessageProps {
  message: string;
  isCurrentUser: boolean;
  profileImage: string;
  userId: string;
  showAvatar: boolean;
  groupPosition: "single" | "first" | "middle" | "last";
}

export default function ChatMessage({
  message,
  isCurrentUser,
  profileImage,
  userId,
  showAvatar,
  groupPosition,
}: ChatMessageProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push(`/user/${userId}`);
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      {!isCurrentUser && (
        <TouchableOpacity onPress={handleProfileClick}>
          <Image
            source={{ uri: profileImage }}
            style={[
              styles.avatar,
              styles.chatAvatar,
              !showAvatar && styles.hidden,
            ]}
          />
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.myMessage : styles.otherMessage,
          groupPosition === "single"
            ? styles.bubbleSingle
            : groupPosition === "first"
              ? isCurrentUser
                ? styles.myFirstBubble
                : styles.otherUserFirstBubble
              : groupPosition === "middle"
                ? isCurrentUser
                  ? styles.myMiddleBubble
                  : styles.otherUserMiddleBubble
                : isCurrentUser
                  ? styles.myLastBubble
                  : styles.otherUserLastBubble,
        ]}
      >
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {isCurrentUser && (
        <TouchableOpacity onPress={handleProfileClick}>
          <Image
            source={{ uri: profileImage }}
            style={[
              styles.avatar,
              styles.chatAvatar,
              !showAvatar && styles.hidden,
            ]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
