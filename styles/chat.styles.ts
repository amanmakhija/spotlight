import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    justifyContent: "flex-end",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  chatAvatar: {
    width: 22,
    height: 22,
  },
  notificationInfo: {
    flex: 1,
  },
  username: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  timeAgo: {
    color: COLORS.grey,
    fontSize: 12,
  },
  messageInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.surface,
    backgroundColor: COLORS.background,
    marginTop: 10,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  hideButton: {
    display: "none",
  },
  hidden: {
    opacity: 0,
  },
  commentsList: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginVertical: 1,
  },
  leftAlign: {
    justifyContent: "flex-start",
  },
  rightAlign: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "70%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 5,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  otherMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  bubbleSingle: {
    borderRadius: 18,
  },
  myFirstBubble: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 5,
  },
  myMiddleBubble: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  myLastBubble: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 18,
  },
  otherUserFirstBubble: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 5,
  },
  otherUserMiddleBubble: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  otherUserLastBubble: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 18,
  },
  messageText: {
    fontSize: 15,
    color: "#000",
  },
  statusContainer: {
    alignSelf: "flex-end",
    marginTop: 5,
    marginRight: 15,
  },
  seenText: {
    fontSize: 10,
    color: "gray",
  },
  unreadMessages: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});
