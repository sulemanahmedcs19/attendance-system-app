import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // professional, scalable icons

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6", // blue (matches your theme)
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb", // light gray
          height: 100,
          paddingBottom: 15,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "profile") {
            iconName = "person-outline";
          } else if (route.name === "home") {
            iconName = "home-outline";
          } else if (route.name === "logout") {
            iconName = "logout-logo";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="logout" options={{ title: "LogOut" }} />
    </Tabs>
  );
}
