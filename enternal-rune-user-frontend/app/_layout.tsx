import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { Stack } from "expo-router";

function RootLayoutNav() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ToastProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={keyboardVisible} // 👉 chỉ bật khi bàn phím mở
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(routes)/welcome-intro/index" />
          <Stack.Screen name="(routes)/login/index" />
          <Stack.Screen name="(routes)/sign-up/index" />
          <Stack.Screen name="(routes)/forgot-password/index" />
          <Stack.Screen
            name="(routes)/course-details/index"
            options={{
              headerShown: true,
              title: "Course Details",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(routes)/cart/index"
            options={{
              headerShown: true,
              title: "Cart Items",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(routes)/profile-details/index"
            options={{
              headerShown: true,
              title: "Profile Details",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(routes)/course-access/index"
            options={{
              headerShown: true,
              title: "Course Lessons",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(routes)/enrolled-courses/index"
            options={{
              headerShown: true,
              title: "Enrolled Courses",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </KeyboardAvoidingView>
    </ToastProvider>
  );
}

export default RootLayoutNav;
