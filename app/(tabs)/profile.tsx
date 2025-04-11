import Loader from "@/components/Loader";
import UserProfile from "@/components/UserProfile";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export default function Profile() {
  const { userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId
      ? {
          clerkId: userId,
        }
      : "skip"
  );
  const posts = useQuery(api.posts.getPostsByUserId, {});
  const updateProfile = useMutation(api.users.updateUser);

  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
  };

  if (!currentUser || posts === undefined || !userId) return <Loader />;

  return <UserProfile currentUser={currentUser} />;
}
