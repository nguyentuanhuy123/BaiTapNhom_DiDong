import useUser from "@/hooks/auth/useUser";
import { Tabs } from "expo-router";
import { Image, View, StyleSheet, Animated } from "react-native";
import { useRef, useEffect } from "react";

export default function TabsLayout() {
  const { user } = useUser();

  // Tạo animated value cho các tab
  const animValues = useRef<{ [key: string]: Animated.Value }>({
    "search/index": new Animated.Value(0),
    "courses/index": new Animated.Value(0),
    "index": new Animated.Value(1),
    "history/index": new Animated.Value(0),
    "profile/index": new Animated.Value(0),
  }).current;

  const animateTab = (routeName: string, focused: boolean) => {
    Animated.spring(animValues[routeName], {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      stiffness: 150,
      damping: 12,
    }).start();
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, focused }) => {
          animateTab(route.name, focused);

          let iconName;
          let isHome = false;

          if (route.name === "index") {
            iconName = require("@/assets/icons/HouseSimple.png");
            isHome = true;
          } else if (route.name === "search/index") {
            iconName = require("@/assets/icons/search.png");
          } else if (route.name === "courses/index") {
            iconName = require("@/assets/icons/BookBookmark.png");
          } else if (route.name === "profile/index") {
            iconName = require("@/assets/icons/User.png");
          } else if (route.name === "history/index") {
            iconName = require("@/assets/icons/history.png");
          }

          // Home: nhô lên, gradient background
          if (isHome) {
            const scale = animValues[route.name].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            });

            return (
              <Animated.View
                style={[
                  styles.homeButton,
                  { transform: [{ scale }] },
                  focused && styles.homeButtonActive,
                ]}
              >
                <Image source={iconName} style={styles.homeIcon} />
              </Animated.View>
            );
          }

          // Tab khác: nền tròn, nhô lên khi active
          const translateY = animValues[route.name].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8],
          });

          return (
            <Animated.View
              style={[
                styles.tabButton,
                { transform: [{ translateY }] },
                { borderColor: focused ? "#007AFF" : "transparent" },
              ]}
            >
              <View
                style={[
                  styles.tabButtonInner,
                  { backgroundColor: focused ? "#E6F0FF" : "#F5F5F5" },
                ]}
              >
                <Image source={iconName} style={styles.tabIcon} />
              </View>
            </Animated.View>
          );
        },
      })}
    >
      <Tabs.Screen name="search/index" />
      <Tabs.Screen name="courses/index" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 55,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    paddingTop: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  homeButtonActive: {
    backgroundColor: "#005BBB",
  },
  homeIcon: {
    width: 28,
    height: 28,
    tintColor: "#fff",
  },
  tabButton: {
  
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    
    width: 22,
    height: 22,
  },
});
