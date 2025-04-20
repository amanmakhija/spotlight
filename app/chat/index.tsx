import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import Loader from "@/components/Loader";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@clerk/clerk-expo";
import { styles } from "@/styles/chat.styles";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { NoDataFound } from "@/components/NoDataFound";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

type CommentsModalProps = {};

export default function ChatsPage({}: CommentsModalProps) {
  const { userId } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId
      ? {
          clerkId: userId,
        }
      : "skip"
  );

  const searchedUsers = useQuery(api.users.searchUserByUsername, {
    username: searchValue.toLocaleLowerCase(),
  });

  const users = searchValue.length > 0 ? searchedUsers : [];

  const userChats = useQuery(api.chat.getUserChats, {});
  const createNewChat = useMutation(api.chat.createChat);

  const handleUserClick = async (id: string) => {
    const newChatId = await createNewChat({ userId: id as Id<"users"> });
    router.push(`/chat/${newChatId}`);
  };

  const truncate = (text: string | undefined, limit: number = 30) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <AppHeader showLeftButton headerText={currentUser?.username}>
      <View style={[styles.messageInput, { borderColor: "transparent" }]}>
        <TextInput
          style={styles.input}
          placeholder="Search user"
          placeholderTextColor={COLORS.grey}
          value={searchValue}
          onChangeText={setSearchValue}
        />

        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => setSearchValue("")}>
            <Ionicons
              name="close-circle-outline"
              size={24}
              color={COLORS.grey}
            />
          </TouchableOpacity>
        )}
      </View>

      {users === undefined || userChats === undefined ? (
        <Loader />
      ) : users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleUserClick(item._id)}>
              <View style={styles.userItem}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.avatar}
                    contentFit="cover"
                    transition={200}
                  />
                </View>

                <View style={styles.notificationInfo}>
                  <Text style={styles.username}>{item.username}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : userChats.length > 0 ? (
        <FlatList
          data={userChats}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => router.push(`/chat/${item._id}`)}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: item.otherUser.image }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
              </View>

              <View style={styles.notificationInfo}>
                <Text style={styles.username}>{item.otherUser.username}</Text>
                {item.lastMessage ? (
                  <Text
                    style={[
                      styles.timeAgo,
                      item.numberOfUnreadMessages > 0 && {
                        color: COLORS.primary,
                      },
                    ]}
                  >
                    {item.lastMessage?.senderId === currentUser?._id
                      ? item.lastMessageRead.isRead
                        ? `Seen ${formatDistanceToNow(
                            item.lastMessageRead?.readingTime!,
                            {
                              addSuffix: true,
                            }
                          )}`
                        : `Sent ${formatDistanceToNow(
                            item.lastMessage?._creationTime!,
                            {
                              addSuffix: true,
                            }
                          )}`
                      : `${item.lastMessage.imageUrl ? "Sent a photo" : truncate(item.lastMessage?.content)} • ${formatDistanceToNow(
                          item.lastMessage?._creationTime!
                        )}`}
                  </Text>
                ) : (
                  <Text style={styles.timeAgo}>Click to start chatting</Text>
                )}
              </View>
              {item.numberOfUnreadMessages > 0 && (
                <Text style={styles.unreadMessages}>
                  {item.numberOfUnreadMessages}
                </Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <NoDataFound
          iconName="chatbubble-ellipses-outline"
          text="No chats yet"
        />
      )}
    </AppHeader>
  );
}
