import { FlatList } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import AppHeader from "@/components/AppHeader";
import PostItem from "@/components/PostItem";
import { NoDataFound } from "@/components/NoDataFound";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;

  return (
    <AppHeader headerText="Bookmarks">
      <FlatList
        contentContainerStyle={{
          padding: 8,
        }}
        numColumns={3}
        data={bookmarkedPosts}
        renderItem={({ item }) => (
          <PostItem postImage={item!.imageUrl} postId={item!._id} />
        )}
        keyExtractor={(item, index) => (item ? item._id : `${index}`)}
        ListEmptyComponent={
          <NoDataFound
            iconName="bookmark-outline"
            text="No bookmarked posts yet"
          />
        }
      />
    </AppHeader>
  );
}
