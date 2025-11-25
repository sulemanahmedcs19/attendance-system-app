import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import * as Network from "expo-network";
import {
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

// 🔥 TOKEN EXPIRY HANDLER
const handleTokenExpiry = async (msg) => {
  if (
    msg === "jwt expired" ||
    msg === "Token Expired" ||
    msg === "Invalid Token" ||
    msg === "No Token Provided"
  ) {
    await AsyncStorage.clear();
    router.replace("/login");

    Toast.show({
      type: "error",
      text1: "Session Expired",
      text2: "Please login again",
    });

    return true;
  }
  return false;
};

// 🔹 Device Gateway Calculation
const getGatewayIp = async () => {
  try {
    const deviceIp = await Network.getIpAddressAsync(); // device IP
    console.log("Device IP:", deviceIp);

    const parts = deviceIp.split(".");
    if (parts.length === 4) {
      const gatewayIp = `${parts[0]}.${parts[1]}.${parts[2]}.1`; // last octet .1
      console.log("Calculated Gateway IP:", gatewayIp);
      return gatewayIp;
    }
    return null;
  } catch (err) {
    console.log("Failed to get IP:", err);
    return null;
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          "https://attendance-system-backend-n5c2.onrender.com/api/attendance/checkToken",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();

        if (await handleTokenExpiry(data.message)) return;

        if (res.ok) router.replace("/(tabs)/home");
      } catch {
        await AsyncStorage.removeItem("token");
      }
    };

    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Missing Fields" });
      return;
    }

    const gatewayIp = await getGatewayIp();
    if (!gatewayIp) {
      Toast.show({ type: "error", text1: "Failed to detect network gateway" });
      return;
    }

    try {
      const res = await fetch(
        "https://attendance-system-backend-n5c2.onrender.com/api/attendance/loginOnly",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, empPassword: password, ip: gatewayIp }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("token", data.token);
        Toast.show({ type: "success", text1: "Login Successful" });
        router.replace("/(tabs)/home");
      } else {
        Toast.show({ type: "error", text1: data.message });
      }
    } catch (e) {
      console.log(e);
      Toast.show({ type: "error", text1: "Network Error" });
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20 },
  logo: { width: 60, height: 60, marginBottom: 20, marginTop: 50 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  titleBlue: { color: "#3b82f6", fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  passwordContainer: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
