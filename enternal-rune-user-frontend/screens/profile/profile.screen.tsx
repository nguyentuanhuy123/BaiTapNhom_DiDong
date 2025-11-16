import Loader from "@/components/loader/loader";
import useUser from "@/hooks/auth/useUser";
import { Toast } from "react-native-toast-notifications";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet, // Import StyleSheet cho các style phức tạp
} from "react-native";
import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { useState, useEffect, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router, useFocusEffect } from "expo-router";
import mime from "mime";

// **********************************
// ĐỊNH NGHĨA STYLES MỚI VÀ HIỆN ĐẠI
// **********************************
const profileStyles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 40, // Giảm padding trên cùng để giao diện trông gọn hơn
    paddingBottom: 50,
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  imageWrapper: {
    position: "relative",
    // Thêm bóng đổ cho ảnh đại diện để trông nổi bật hơn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6, // cho Android
  },
  avatarImage: {
    width: 120, // Tăng kích thước ảnh đại diện
    height: 120,
    borderRadius: 60,
    borderWidth: 4, // Thêm viền trắng hoặc viền nhẹ
    borderColor: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: "#2467EC", // Đổi màu nền sang màu chủ đạo
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameText: {
    textAlign: "center",
    fontSize: 28, // Tăng kích thước tên
    color: "#262626",
    fontFamily: "Raleway_700Bold",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#262626",
    fontFamily: "Raleway_700Bold",
    marginBottom: 16,
    paddingLeft: 16, // Căn chỉnh tiêu đề section
  },
  // Style cho từng mục menu (List Item)
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18, // Tăng padding dọc
    backgroundColor: "#FFFFFF", // Nền trắng cho từng mục
    marginBottom: 8, // Khoảng cách giữa các mục
    borderRadius: 12, // Bo tròn góc cho từng mục
    // Thêm bóng đổ nhẹ để tạo hiệu ứng "nổi"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EBF3FF", // Màu nền nhẹ cho icon
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#262626",
  },
  subtitleText: {
    color: "#787878",
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
  },
  arrowIcon: {
    color: "#A0AEC0", // Màu xám tinh tế hơn cho mũi tên
  },
  // Style đặc biệt cho Log Out
  logoutText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#E53E3E", // Màu đỏ cho Log Out
  },
});

export default function ProfileScreen() {
  const { user, loading, setRefetch, refetch } = useUser();
  const [image, setImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [name, setName] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setName(JSON.parse(userStr).name);
      };
      loadUser();
    }, [refetch]) // Thêm refetch vào dependency để cập nhật tên sau khi avatar được tải lại
  );

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const logoutHandler = async () => {
    // Xóa user info
    await AsyncStorage.removeItem("user");
    router.push("/(routes)/login");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        setLoader(true); // Bắt đầu loader
        const asset = result.assets[0];
        const uri = asset.uri;
        const mimeType = mime.getType(uri) || "image/jpeg";
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        const base64Image = `data:${mimeType};base64,${base64}`;
        setImage(base64Image); // Cập nhật tạm thời trên UI

        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) throw new Error("User not found");
        const user = JSON.parse(userStr);

        const response = await axios.put(`${SERVER_URI}/update-user-avatar`, {
          userId: user._id,
          avatar: base64Image,
        });

        if (response.data.success) {
          Toast.show(response.data.message, { type: "success" });
          await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
          setRefetch((prev: boolean) => !prev); // Đảo ngược trạng thái refetch để kích hoạt lại useUser và useFocusEffect
        }
      } catch (error: any) {
        console.log(error);
        Toast.show("Error updating avatar!", { type: "danger" });
      } finally {
        setLoader(false); // Kết thúc loader
      }
    }
  };

  // --- COMPONENT TRÌNH BÀY CHO MỖI MỤC MENU ---
  const MenuItem = ({ icon, title, subtitle, onPress, isLogout = false }) => (
    <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={profileStyles.menuItemLeft}>
        {/* Icon Wrapper */}
        <View
          style={[
            profileStyles.iconWrapper,
            isLogout && { backgroundColor: "#FEEBEB" },
          ]}
        >
          {icon}
        </View>
        {/* Text Content */}
        <View>
          <Text
            style={[
              profileStyles.titleText,
              isLogout && profileStyles.logoutText,
            ]}
          >
            {title}
          </Text>
          {!isLogout && (
            <Text style={profileStyles.subtitleText}>{subtitle}</Text>
          )}
        </View>
      </View>
      {/* Arrow Icon */}
      {/* {!isLogout && (
        <AntDesign name="right" size={20} style={profileStyles.arrowIcon} />
      )}
      {isLogout && (
        <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
      )} */}
    </TouchableOpacity>
  );

  // **********************************
  // RENDER PROFILE SCREEN
  // **********************************
  return (
    <>
      {loader || loading ? (
        <Loader />
      ) : (
        <LinearGradient
          colors={["#FFFFFF", "#F0F4F8"]} // Thay đổi gradient sang màu sáng, tinh tế hơn
          style={profileStyles.gradientContainer}
        >
          <ScrollView contentContainerStyle={profileStyles.scrollViewContent}>
            {/* -------------------- AVATAR SECTION -------------------- */}
            <View style={profileStyles.avatarContainer}>
              <View style={profileStyles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      image ||
                      user?.avatar?.url ||
                      "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
                  }}
                  style={profileStyles.avatarImage}
                />
                <TouchableOpacity
                  style={profileStyles.cameraButton}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={profileStyles.nameText}>{name}</Text>
            {user?.email && (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Nunito_400Regular",
                  color: "#787878",
                  marginBottom: 30,
                }}
              >
                {user.email}
              </Text>
            )}

            {/* -------------------- ACCOUNT DETAILS SECTION -------------------- */}
            <Text style={profileStyles.sectionTitle}>Account</Text>
            <View style={{ marginHorizontal: 16 }}>
              <MenuItem
                title="Detail Profile"
                subtitle="Information Account"
                icon={<FontAwesome name="user-o" size={20} color="#2467EC" />}
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/profile-details",
                    params: { userId: user?._id },
                  })
                }
              />
              <MenuItem
                title="Enrolled Courses"
                subtitle="The all enrolled courses"
                icon={
                  <MaterialCommunityIcons
                    name="book-account-outline"
                    size={20}
                    color="#2467EC"
                  />
                }
                onPress={() => router.push("/(routes)/enrolled-courses")}
              />
            </View>

            {/* -------------------- ACTIONS SECTION -------------------- */}
            {/* Thêm một section mới cho các hành động */}
            <Text style={[profileStyles.sectionTitle, { marginTop: 25 }]}>
              Actions
            </Text>
            <View style={{ marginHorizontal: 16 }}>
              <MenuItem
                title="Log Out"
                icon={<Ionicons name="log-out-outline" size={20} color="#E53E3E" />}
                onPress={logoutHandler}
                isLogout={true}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
}