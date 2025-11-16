import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/loader/loader";
import useUser from "@/hooks/auth/useUser";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

// Giả định kiểu dữ liệu cho User
interface UserType {
  _id: string;
  name: string;
  email: string;
}

export default function DetailProfileScreen() {
  const { user, loading, setRefetch, setUser } = useUser() as {
    user: UserType | null;
    loading: boolean;
    setRefetch: (value: boolean) => void;
    setUser: (user: UserType) => void;
  };

  const [name, setName] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [isNameChanged, setIsNameChanged] = useState(false); // Theo dõi thay đổi

  // set giá trị ban đầu khi user có dữ liệu
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // Kiểm tra xem trường tên có thay đổi so với ban đầu không
  useEffect(() => {
    if (user) {
      setIsNameChanged(name.trim() !== user.name.trim());
    }
  }, [name, user]);

  const updateProfileHandler = async () => {
    if (!user?._id || !isNameChanged) {
      Toast.show("No changes detected.", { type: "info" });
      return;
    }

    if (name.trim().length < 3) {
      Toast.show("Name must be at least 3 characters long.", { type: "warning" });
      return;
    }

    try {
      setUpdating(true);
      const response = await axios.put(`${SERVER_URI}/update-user-info`, {
        userId: user._id,
        name: name.trim(),
      });

      if (response.data.success) {
        Toast.show("Profile updated successfully! 🎉", { type: "success" });
        const updatedUser = response.data.user;

        // Cập nhật state local
        setUser(updatedUser);

        // Lưu vào AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        // Kích hoạt re-fetch nếu cần
        setRefetch(true);

        // Quay về ProfileScreen
        router.back();
      }
    } catch (error: any) {
      console.error("❌ Failed to update profile:", error?.response?.data || error);
      Toast.show(error?.response?.data?.message || "Error updating profile!", { type: "danger" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !user) return <Loader />;

  return (
    <LinearGradient colors={["#F0F4FF", "#FFFFFF"]} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Account Details</Text>
        <Text style={styles.subHeader}>Manage your personal information.</Text>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your new name"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
          />
        </View>

        {/* Email Display (Disabled) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[styles.textInput, styles.disabledInput]}>
            <Text style={styles.disabledText}>{user.email}</Text>
            <Feather name="lock" size={18} color="#9CA3AF" />
          </View>
        </View>

        <TouchableOpacity
          onPress={updateProfileHandler}
          disabled={updating || !isNameChanged} // Disable nếu đang cập nhật hoặc không có thay đổi
          style={[styles.updateButton, (updating || !isNameChanged) && styles.disabledButton]}
        >
          <Text style={styles.updateButtonText}>
            {updating ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 5,
    color: "#1F2937"
  },
  subHeader: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "600",
    color: "#374151"
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Border tinh tế hơn
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10, // Bo góc lớn hơn
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#F3F4F6", // Nền xám nhạt
    borderColor: "#E5E7EB",
    shadowOpacity: 0, // Bỏ shadow cho disabled
    elevation: 0,
  },
  disabledText: {
    color: "#6B7280",
    fontSize: 16,
  },

  updateButton: {
    backgroundColor: "#2563EB", // Màu xanh dương chính
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#93C5FD", // Màu xanh nhạt khi disabled
    shadowOpacity: 0.1,
    elevation: 2,
  },
  updateButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 17
  },
});