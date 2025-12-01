import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SwipeButton from "rn-swipe-button";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import ActivitySection from "../../components/activitySection";

const formatTo12Hour = (isoTime) => {
  if (!isoTime) return "--:--";

  let timePart = isoTime.split("T")[1].split(".")[0];
  let [hour, minute] = timePart.split(":");

  hour = parseInt(hour);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
};

//TOKEN EXPIRY
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

export default function Attendance() {
  const [today] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return router.replace("/login");

      const savedCheckedIn = await AsyncStorage.getItem("checkedIn");
      const savedCheckInTime = await AsyncStorage.getItem("checkInTime");
      const savedCheckOutTime = await AsyncStorage.getItem("checkOutTime");

      setCheckedIn(savedCheckedIn === "true");
      setCheckInTime(savedCheckInTime);
      setCheckOutTime(savedCheckOutTime);
    };
    loadState();
  }, []);

  const handleSwipe = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return router.replace("/login");

      //CHECK IN
      if (!checkedIn) {
        const res = await fetch(
          "https://attendance-system-backend-n5c2.onrender.com/api/attendance/checkIn",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (await handleTokenExpiry(data.message)) return;

        if (res.ok) {
          const time = formatTo12Hour(data.attendance.CheckIn);
          setCheckedIn(true);
          setCheckInTime(time);

          await AsyncStorage.setItem("checkedIn", "true");
          await AsyncStorage.setItem("checkInTime", time);
          await AsyncStorage.removeItem("checkOutTime");

          Toast.show({ type: "success", text1: `Checked in at ${time}` });
        } else {
          Toast.show({ type: "error", text1: data.message });
        }
      }

      //CHECK OUT
      else {
        const res = await fetch(
          "https://attendance-system-backend-n5c2.onrender.com/api/attendance/checkOut",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (await handleTokenExpiry(data.message)) return;

        if (res.ok) {
          await AsyncStorage.clear();
          Toast.show({
            type: "success",
            text1: `Checked out at ${data.checkOutTime}`,
          });
          // router.replace("/login");
        } else {
          Toast.show({ type: "error", text1: data.message });
        }
      }
    } catch (e) {
      Toast.show({ type: "error", text1: e.message });
    }

    setLoading(false);
  };

  if (checkedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading Attendance...</Text>
      </View>
    );
  }

  const dates = Array.from({ length: 7 }, (_, i) => {
    let d = new Date();
    d.setDate(today.getDate() + (i - 3));
    return d;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Welcome Back</Text>
          <Text style={styles.designation}>Software Engineer</Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={dates}
        keyExtractor={(item, idx) => idx.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isToday = item.toDateString() === today.toDateString();
          return (
            <View style={[styles.dateBox, isToday && styles.todayBox]}>
              <Text style={[styles.dateDay, isToday && styles.todayText]}>
                {item.getDate().toString().padStart(2, "0")}
              </Text>
              <Text style={[styles.dateMonth, isToday && styles.todayText]}>
                {item.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
            </View>
          );
        }}
      />

      <Text style={styles.sectionTitle}>Today's Attendance</Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={styles.cardName}>
            <Ionicons name="log-in-outline" size={24} color="#3b82f6" />
            <Text style={styles.cardNameSpace}>Check In</Text>
          </View>
          <Text style={styles.cardTime}>{checkInTime || "--:--"}</Text>
          <Text style={styles.cardRemark}>On time</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardName}>
            <Ionicons name="log-out-outline" size={24} color="#3b82f6" />
            <Text style={styles.cardNameSpace}>Check Out</Text>
          </View>
          <Text style={styles.cardTime}>{checkOutTime || "--:--"}</Text>
          <Text style={styles.cardRemark}>End of day</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardName}>
            <MaterialIcons name="lunch-dining" size={24} color="#3b82f6" />
            <Text style={styles.cardNameSpace}>Break Time</Text>
          </View>
          <Text style={styles.cardTime}>12:30 PM</Text>
          <Text style={styles.cardRemark}>Avg: 30 min</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardName}>
            <Ionicons name="stats-chart-outline" size={24} color="#3b82f6" />
            <Text style={styles.cardNameSpace}>Performance</Text>
          </View>
          <Text style={styles.cardTime}>92%</Text>
          <Text style={styles.cardRemark}>On time this month</Text>
        </View>
      </View>

      <ActivitySection />

      <View style={styles.swipeButton}>
        <SwipeButton
          thumbIconBackgroundColor="#fff"
          railBackgroundColor="#3b82f6"
          railBorderColor="#e5e7eb"
          title={checkedIn ? "Swipe to Check Out" : "Swipe to Check In"}
          titleColor="#fff"
          onSwipeSuccess={handleSwipe}
          disabled={loading}
        />
      </View>

      {/* Added space below swipe button */}
      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  name: { fontSize: 18, fontWeight: "bold" },
  designation: { fontSize: 14, color: "gray" },
  dateBox: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayBox: { backgroundColor: "#3b82f6" },
  dateDay: { fontSize: 16, fontWeight: "bold", color: "#333" },
  dateMonth: { fontSize: 12, color: "#6b7280" },
  todayText: { color: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 20 },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  card: {
    width: "48%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardName: { flexDirection: "row", alignItems: "center" },
  cardNameSpace: { marginLeft: 8, fontSize: 16, fontWeight: "bold" },
  cardTime: { fontSize: 20, fontWeight: "bold", marginVertical: 8 },
  cardRemark: { fontSize: 14, color: "#6b7280" },
  swipeButton: { marginTop: 20 },
  spacing: { marginBottom: 30 }, // Added space below the swipe button
});
