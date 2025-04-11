import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { ReactMutation, useMutation, useQuery } from "convex/react";
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
import NoPostsFound from "./NoPostsFound";
import PostItem from "./PostItem";
import { FunctionReference } from "convex/server";

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
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const posts = useQuery(
    api.posts.getPostsByUserId,
    currentUser._id ? { userId: currentUser._id } : {}
  );
  const updateProfile = useMutation(api.users.updateUser);

  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
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

          <Text style={styles.name}>{currentUser?.fullname}</Text>
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
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <Pressable
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={async () => {
                  if (onFollowButtonClick) {
                    await onFollowButtonClick({ followingId: currentUser._id });
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
              </Pressable>
            )}
          </View>
        </View>

        {posts?.length === 0 && <NoPostsFound />}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <PostItem
              postImage={item.imageUrl}
              onPress={() => setSelectedPost(item)}
            />
          )}
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

      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                cachePolicy="memory-disk"
                style={styles.postDetailImage}
              />
            </View>
          )}
        </View>
      </Modal>
    </AppHeader>
  );
}
