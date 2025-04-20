import React from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Loader from "@/components/Loader";
import Post from "@/components/Post";
import AppHeader from "@/components/AppHeader";

export default function UserProfilePage() {
  const { id } = useLocalSearchParams();

  const post = useQuery(api.posts.getPostById, {
    postId: id as Id<"posts">,
  });

  if (post === undefined) return <Loader />;

  return (
    <AppHeader showLeftButton={true} headerText="Post">
      <Post post={post} />
    </AppHeader>
  );
}
