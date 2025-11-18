import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  // ✅ Check if token already exists and redirect to dashboard
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        // If token exists, redirect to the home screen
        router.replace("/(tabs)/home");
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (email && password) {
      try {
        const response = await fetch(
          "http://192.168.18.77:3000/api/attendance/loginOnly",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, empPassword: password }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // ✅ Save token in AsyncStorage
          await AsyncStorage.setItem("token", data.token);

          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: `You are successfully logged in at ${formattedTime}, ${formattedDate}`,
            position: "top",
          });

          // Redirect to home screen
          router.replace("/(tabs)/home");
        } else {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: data.message || "Invalid email or password",
            position: "top",
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: `Something went wrong. Please try again later. ${error}`,
          position: "top",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please enter valid email and password.",
        position: "top",
      });
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/crystal-cube.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>
          Welcome Back to{"\n"}
          <Text style={styles.titleBlue}>HR Attendee</Text>
        </Text>
        <Text style={styles.subtitle}>
          Hello there, login to mark attendance
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={secure}
            placeholderTextColor="#888"
            onChangeText={setPassword}
            style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? "eye-off" : "eye"}
              size={22}
              color="#3b82f6"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 32,
    color: "#111827",
    marginBottom: 8,
  },
  titleBlue: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
