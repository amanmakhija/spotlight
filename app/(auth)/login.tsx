import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleLogin = async (choice: string) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: choice === "google" ? "oauth_google" : "oauth_apple",
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log("OAuth error: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>spotlight</Text>
        <Text style={styles.tagline}>don't miss anything</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/auth-bg.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <View style={styles.loginSection}>
        <TouchableOpacity
          onPress={() => handleLogin("google")}
          activeOpacity={0.9}
          style={styles.googleButton}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLogin("apple")}
          activeOpacity={0.9}
          style={styles.googleButton}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-apple" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to ou Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
