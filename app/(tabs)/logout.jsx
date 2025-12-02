// logout.jsx
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting to login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
  },
});
