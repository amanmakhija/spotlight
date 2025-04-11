import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/profile.styles";
import { Image } from "expo-image";

type PostItemProps = {
  postImage: string;
  onPress: () => void;
};

export default function PostItem({ postImage, onPress }: PostItemProps) {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
      <Image
        source={postImage}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    </TouchableOpacity>
  );
}
