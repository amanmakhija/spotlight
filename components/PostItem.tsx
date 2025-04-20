import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/profile.styles";
import { Image } from "expo-image";
import { Link } from "expo-router";

type PostItemProps = {
  postImage: string;
  postId: string;
};

export default function PostItem({ postImage, postId }: PostItemProps) {
  return (
    <Link href={`/post/${postId}`} asChild>
      <TouchableOpacity style={styles.gridItem}>
        <Image
          source={postImage}
          style={styles.gridImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    </Link>
  );
}
