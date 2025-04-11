import React from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Loader from "@/components/Loader";
import { styles } from "@/styles/profile.styles";
import AppHeader from "@/components/AppHeader";
import UserProfile from "@/components/UserProfile";

export default function UserProfilePage() {
  const { id } = useLocalSearchParams();

  const profile = useQuery(api.users.getUserProfile, { id: id as Id<"users"> });
  const posts = useQuery(api.posts.getPostsByUserId, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });

  const toggleFollow = useMutation(api.users.toggleFollow);

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;

  return (
    <UserProfile
      currentUser={profile}
      isFollowing={isFollowing}
      onFollowButtonClick={toggleFollow}
    />
  );
}
