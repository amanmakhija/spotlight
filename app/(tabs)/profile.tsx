import Loader from "@/components/Loader";
import UserProfile from "@/components/UserProfile";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";

export default function Profile() {
  const { userId } = useAuth();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId
      ? {
          clerkId: userId,
        }
      : "skip"
  );
  const posts = useQuery(api.posts.getPostsByUserId, {});

  if (!currentUser || posts === undefined || !userId) return <Loader />;

  return <UserProfile currentUser={currentUser} />;
}
