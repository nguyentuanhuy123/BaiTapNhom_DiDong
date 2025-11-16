import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Raleway_700Bold, Nunito_400Regular } from "@expo-google-fonts/raleway"; // Thêm Nunito nếu cần
import { useFonts } from "expo-font";
import useUser from "@/hooks/auth/useUser";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Giả định kiểu dữ liệu user
interface UserType {
  name: string;
  avatar?: { url: string } | string; // Cập nhật kiểu avatar để chấp nhận object hoặc string
}

export default function Header() {
  const [cartItems, setCartItems] = useState([]);
  // Sử dụng useUser để lấy thông tin user
  const { user } = useUser() as { user: UserType | null };

  useEffect(() => {
    const getCartItems = async () => {
      try {
        const cart = await AsyncStorage.getItem("cart");
        setCartItems(cart ? JSON.parse(cart) : []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
      }
    };
    // Tần suất kiểm tra giỏ hàng có thể được tối ưu bằng event listener nếu có nhiều update
    getCartItems();
  }, []);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    // Nếu bạn muốn dùng font Nunito ở đây, cần import và thêm vào list
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Logic lấy URL avatar
  const avatarUrl =
    typeof user?.avatar === 'object' && user.avatar?.url
      ? user.avatar.url
      : (typeof user?.avatar === 'string' ? user.avatar : null);

  const userName = user?.name || "Guest";

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        {/* AVATAR & USER INFO */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Image
            source={
              avatarUrl
                ? { uri: avatarUrl }
                : require("@/assets/icons/User.png") // Fallback image
            }
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.helloText}>
            Hello,
          </Text>
          <Text style={styles.userNameText} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </View>

      {/* CART BUTTON */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => router.push("/(routes)/cart")}
        activeOpacity={0.8}
      >
        <Feather name="shopping-bag" size={24} color={"#1F2937"} />
        {cartItems?.length > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {cartItems.length > 9 ? '9+' : cartItems.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, // Đặt padding ở đây để nó chiếm toàn bộ chiều rộng
    marginBottom: 20, // Tăng khoảng cách dưới header
    width: "100%", // Chiếm 100% chiều rộng
    paddingTop: 10, // Thêm padding trên nhẹ
  },

  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48, // Tăng kích thước avatar
    height: 48,
    marginRight: 10,
    borderRadius: 50, // Hoàn toàn tròn
    borderWidth: 2, // Thêm viền nhẹ để nổi bật
    borderColor: '#E5E7EB',
  },

  helloText: {
    color: "#6B7280", // Màu xám nhẹ nhàng
    fontSize: 13,
    fontFamily: "Raleway_700Bold", // Giữ Raleway cho phần này
  },

  userNameText: {
    fontSize: 18, // Tăng kích thước tên người dùng
    color: "#1F2937", // Màu chữ tối, rõ ràng
    fontFamily: "Raleway_700Bold",
    maxWidth: 150, // Giới hạn chiều rộng nếu tên quá dài
  },

  // --- CART BUTTON STYLES ---
  cartButton: {
    // Thiết kế nút nổi bật hơn
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12, // Bo tròn góc đẹp hơn
    backgroundColor: "#F3F4F6", // Nền xám nhạt cho nút
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },

  badgeContainer: {
    width: 22,
    height: 22,
    backgroundColor: "#EF4444", // Màu đỏ nổi bật
    position: "absolute",
    borderRadius: 11,
    right: -5,
    top: -5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2, // Thêm viền trắng để nổi bật trên nền
    borderColor: '#FFF',
  },

  badgeText: {
    color: "#fff",
    fontSize: 10, // Font nhỏ hơn cho số lượng
    fontWeight: "bold",
  },
});