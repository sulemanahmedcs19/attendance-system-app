import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";

const Splash = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // later you can replace this with auth check
      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <LinearGradient
      colors={["#3b82f6", "#6366f1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animatable.Image
        animation="rotate"
        duration={2000}
        iterationCount={2}
        source={require("../assets/roots.jpeg")}
        style={styles.logo}
      />
    </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // vertical center
    alignItems: "center", // horizontal center
    backgroundColor: "#fff", // better than red for splash
  },
  logo: {
    width: 200, // adjust size
    height: 200,
    resizeMode: "contain", // keeps aspect ratio
  },
});
