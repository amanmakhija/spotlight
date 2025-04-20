import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

type AppHeaderProps = {
  headerText?: string;
  showLogoutButton?: boolean;
  headerStyle?: object;
  showLeftButton?: boolean;
  showChatButton?: boolean;
  children: React.ReactNode;
};

export default function AppHeader({
  headerText,
  showLogoutButton,
  headerStyle,
  showLeftButton,
  showChatButton,
  children,
}: AppHeaderProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showLeftButton && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.headerTitle,
            headerStyle,
            {
              flex: 1,
              textAlign: showLeftButton ? "center" : "left",
            },
          ]}
        >
          {headerText || "spotlight"}
        </Text>

        {showLogoutButton ? (
          <TouchableOpacity onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          showChatButton && (
            <TouchableOpacity onPress={() => router.push("/chat")}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          )
        )}
      </View>

      {children}
    </View>
  );
}
