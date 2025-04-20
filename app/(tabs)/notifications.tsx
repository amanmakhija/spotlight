import { FlatList, View } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { styles } from "@/styles/notifications.styles";
import AppHeader from "@/components/AppHeader";
import NotificationItem from "@/components/NotificationItem";
import { NoDataFound } from "@/components/NoDataFound";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  return (
    <AppHeader headerText="Notificatins">
      {notifications === undefined ? (
        <Loader />
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem notification={item} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <NoDataFound
              iconName="notifications-outline"
              text="No notifications yet"
            />
          }
        />
      )}
    </AppHeader>
  );
}
