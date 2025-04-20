import AppHeader from "@/components/AppHeader";
import Loader from "@/components/Loader";
import { NoDataFound } from "@/components/NoDataFound";
import Post from "@/components/Post";
import Stories from "@/components/Stories";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { FlatList } from "react-native";

export default function Index() {
  const posts = useQuery(api.posts.getFeedPosts);
  if (posts === undefined) return <Loader />;

  return (
    <AppHeader showChatButton>
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<Stories />}
        ListEmptyComponent={
          <NoDataFound iconName="images-outline" text="No posts yet" />
        }
      />
    </AppHeader>
  );
}
