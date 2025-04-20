import { View, Text } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

type NoDataFoundProps = {
  iconName?: keyof typeof Ionicons.glyphMap;
  text: string;
};

export function NoDataFound({ iconName, text }: NoDataFoundProps) {
  return (
    <View style={[styles.container, styles.centered]}>
      {iconName && (
        <Ionicons name={iconName} size={48} color={COLORS.primary} />
      )}
      <Text style={{ fontSize: 20, color: COLORS.white, marginTop: 10 }}>
        {text}
      </Text>
    </View>
  );
}
