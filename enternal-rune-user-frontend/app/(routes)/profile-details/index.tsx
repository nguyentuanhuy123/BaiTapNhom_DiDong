import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/loader/loader";
import useUser from "@/hooks/auth/useUser";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function DetailProfileScreen() {
  const { user, loading, setRefetch, setUser } = useUser();
  const [name, setName] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // set giá trị ban đầu khi user có dữ liệu
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const updateProfileHandler = async () => {
    if (!user?._id) return;
    try {
      setUpdating(true);
      const response = await axios.put(`${SERVER_URI}/update-user-info`, {
        userId: user._id,
        name,
      });

      if (response.data.success) {
        Toast.show("Profile updated successfully!", { type: "success" });
        setUser(response.data.user);
        
        // Refetch lại user từ AsyncStorage
        setRefetch(true);

        // Quay về ProfileScreen
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        router.back();
      }
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Toast.show(error?.response?.data?.message || "Error updating profile!", { type: "danger" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !user) return <Loader />;

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1, padding: 16 }}>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>Detail Profile</Text>

        <Text style={{ fontSize: 16, marginBottom: 5 }}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />

        <Text style={{ fontSize: 16, marginBottom: 5 }}>Email</Text>
        <TextInput
          value={user.email}
          editable={false} // Email không thể sửa
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 8,
            marginBottom: 20,
            backgroundColor: "#f5f5f5",
          }}
        />

        <TouchableOpacity
          onPress={updateProfileHandler}
          style={{
            backgroundColor: "#4A90E2",
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            {updating ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
