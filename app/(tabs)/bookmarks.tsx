import { View, Text, FlatList } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import AppHeader from "@/components/AppHeader";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/feed.styles";
import PostItem from "@/components/PostItem";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarkedFound />;

  return (
    <AppHeader headerText="Bookmarks">
      <FlatList
        contentContainerStyle={{
          padding: 8,
        }}
        numColumns={3}
        data={bookmarkedPosts}
        renderItem={({ item }) => (
          <PostItem postImage={item!.imageUrl} onPress={() => {}} />
        )}
        keyExtractor={(item, index) => (item ? item._id : `${index}`)}
      />
    </AppHeader>
  );
}

function NoBookmarkedFound() {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="bookmarks-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>
        No bookmarked posts yet
      </Text>
    </View>
  );
}

function Bookmark({ post }: any) {
  return (
    <View style={{ width: "33.33%", padding: 1 }}>
      <Image
        source={post.imageUrl}
        style={{ width: "100%", aspectRatio: 1 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    </View>
  );
}
