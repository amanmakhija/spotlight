import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const NoPostsFound = () => {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.grey} />
      <Text style={{ color: COLORS.white, fontSize: 20, marginTop: 8 }}>
        No posts yet
      </Text>
    </View>
  );
};

export default NoPostsFound;
