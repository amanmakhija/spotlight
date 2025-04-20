import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { ReactMutation, useConvex, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import Loader from "./Loader";
import AppHeader from "./AppHeader";
import { styles } from "@/styles/profile.styles";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import PostItem from "./PostItem";
import { FunctionReference } from "convex/server";
import { NoDataFound } from "./NoDataFound";
import { useRouter } from "expo-router";

type UserProfileProps = {
  currentUser: Doc<"users">;
  isFollowing?: boolean;
  onFollowButtonClick?: ReactMutation<
    FunctionReference<
      "mutation",
      "public",
      {
        followingId: Id<"users">;
      },
      null,
      string | undefined
    >
  >;
};

export default function UserProfile({
  currentUser,
  isFollowing,
  onFollowButtonClick,
}: UserProfileProps) {
  const { userId: userClerkId } = useAuth();
  const isMyProfile = userClerkId === currentUser.clerkId;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const convex = useConvex();
  const router = useRouter();

  const posts = useQuery(
    api.posts.getPostsByUserId,
    currentUser._id ? { userId: currentUser._id } : {}
  );
  const updateProfile = useMutation(api.users.updateUser);
  const createNewChat = useMutation(api.chat.createChat);

  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
    username: currentUser?.username || "",
  });

  const handleSaveProfile = async () => {
    try {
      if (editedProfile.username.length < 3) {
        alert("Username must be at least 3 characters long.");
        return;
      }
      const isUsernameAvailable = await convex.query(
        api.users.isUsernameAvailable,
        {
          username: editedProfile.username,
        }
      );
      if (!isUsernameAvailable) {
        alert("Username is already taken.");
        return;
      }
      await updateProfile(editedProfile);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again later.");
    }
  };

  const handleMessageButtonClick = async () => {
    const newChatId = await createNewChat({
      userId: currentUser._id as Id<"users">,
    });
    router.push(`/chat/${newChatId}`);
  };

  if (!currentUser || posts === undefined) return <Loader />;

  return (
    <AppHeader
      headerText={currentUser?.username}
      showLogoutButton={isMyProfile}
      headerStyle={styles.username}
      showLeftButton={!isMyProfile}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={currentUser?.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser?.following}</Text>
                <Text style={styles.statLabel}>Followings</Text>
              </View>
            </View>
          </View>

          {currentUser.fullname && (
            <Text style={styles.name}>{currentUser?.fullname}</Text>
          )}
          {currentUser?.bio && (
            <Text style={styles.bio}>{currentUser?.bio}</Text>
          )}

          <View style={styles.actionButtons}>
            {isMyProfile ? (
              <>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditModalVisible(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push("/(tabs)/bookmarks")}
                >
                  <Text style={styles.editButtonText}>Saved Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.profileButton,
                    isFollowing && styles.followingButton,
                  ]}
                  onPress={async () => {
                    if (onFollowButtonClick) {
                      await onFollowButtonClick({
                        followingId: currentUser._id,
                      });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileButton, styles.editButton]}
                  onPress={handleMessageButtonClick}
                >
                  <Text style={styles.editButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <PostItem postImage={item.imageUrl} postId={item._id} />
          )}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View style={styles.noPostsContainer}>
              <NoDataFound iconName="images-outline" text="No posts yet" />
            </View>
          }
        />
      </ScrollView>

      {isMyProfile && (
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.username}
                    onChangeText={(text) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        username: text.toLocaleLowerCase().trim(),
                      }))
                    }
                    placeholderTextColor={COLORS.grey}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.fullname}
                    onChangeText={(text) =>
                      setEditedProfile((prev) => ({ ...prev, fullname: text }))
                    }
                    placeholderTextColor={COLORS.grey}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={editedProfile.bio}
                    onChangeText={(text) =>
                      setEditedProfile((prev) => ({ ...prev, bio: text }))
                    }
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={COLORS.grey}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </AppHeader>
  );
}
