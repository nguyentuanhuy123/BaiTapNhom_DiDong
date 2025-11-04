import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";

// ✅ Import SQLite functions
import {
  getCart,
  removeFromCart,
  clearCart,
} from "@/src/database/cart.service";

export default function CartScreen() {
  const { user, setRefetch } = useUser();
  const [cartItems, setCartItems] = useState<CoursesType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // ✅ Lấy giỏ hàng từ SQLite khi mở màn hình
  useEffect(() => {
    if (!user?._id) return;
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user?._id) return;
    const items = (await getCart(user._id)) as CoursesType[];
    setCartItems(items);
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const calculateTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    return total.toFixed(2);
  };

  const handleCourseDetails = (courseItem: CoursesType) => {
    router.push({
      pathname: "/(routes)/course-details",
      params: { item: JSON.stringify(courseItem) },
    });
  };



  const handleRemoveItem = async (item: any) => {
    if (!user?._id) return;
    await removeFromCart(item._id, user._id);
    await fetchCart();
  };

  const handlePayment = async () => {
    try {
      const amount = Math.round(
        cartItems.reduce((total, item) => total + item.price, 0) * 100
      );

      const paymentIntentResponse = await axios.post(`${SERVER_URI}/payment`, {
        amount,
      });

      const { client_secret: clientSecret } = paymentIntentResponse.data;
      const initSheetResponse = await initPaymentSheet({
        merchantDisplayName: "ELearning",
        paymentIntentClientSecret: clientSecret,
      });

      if (initSheetResponse.error) {
        console.error(initSheetResponse.error);
        return;
      }

      const paymentResponse = await presentPaymentSheet();
      if (paymentResponse.error) {
        console.error(paymentResponse.error);
      } else {
        await createOrder(paymentResponse);
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const createOrder = async (paymentResponse: any) => {
    try {
      if (!user?._id) return;
      await axios.post(`${SERVER_URI}/create-mobile-order`, {
        userId: user._id,
        courseId: cartItems[0]._id,
        payment_info: paymentResponse,
      });

      setOrderSuccess(true);
      await clearCart(user._id);
      setCartItems([]);

      const res = await axios.get(`${SERVER_URI}/user/${user._id}`);
      const updatedUser = res.data.user;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setRefetch((prev) => !prev);
    } catch (error: any) {
      console.error("Order creation failed:", error.response?.data || error.message);
    }
  };

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1 }}>
      {orderSuccess ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("@/assets/images/account_confirmation.png")}
            style={{ width: 200, height: 200, marginBottom: 20 }}
          />
          <Text style={{ fontSize: 22, fontFamily: "Raleway_700Bold" }}>
            Payment Successful!
          </Text>
          <Text
            style={{
              fontSize: 15,
              marginTop: 5,
              color: "#575757",
              fontFamily: "Nunito_400Regular",
            }}
          >
            Thank you for your purchase!
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <Image
                  source={require("@/assets/empty_cart.png")}
                  style={{ width: 200, height: 200 }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Raleway_600SemiBold",
                    marginTop: 15,
                  }}
                >
                  Your Cart is Empty!
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  marginVertical: 8,
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "white",
                }}
              >
                <TouchableOpacity onPress={() => handleCourseDetails(item)}>
                  <Image
                    source={{ uri: item.thumbnail.url }}
                    style={{ width: 100, height: 100, borderRadius: 8 }}
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <TouchableOpacity onPress={() => handleCourseDetails(item)}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        fontFamily: "Nunito_700Bold",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Entypo name="dot-single" size={24} color={"gray"} />
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#808080",
                        fontFamily: "Nunito_400Regular",
                      }}
                    >
                      {item.level}
                    </Text>
                    <FontAwesome
                      name="dollar"
                      size={14}
                      color={"#808080"}
                      style={{ marginLeft: 10 }}
                    />
                    <Text
                      style={{
                        marginLeft: 3,
                        fontSize: 16,
                        color: "#808080",
                      }}
                    >
                      {item.price}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF6347",
                      borderRadius: 5,
                      padding: 5,
                      marginTop: 10,
                      width: 100,
                    }}
                    onPress={() => handleRemoveItem(item)}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontFamily: "Nunito_600SemiBold",
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />

          {cartItems.length > 0 && (
            <View style={{ marginBottom: 25 }}>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "Nunito_700Bold",
                }}
              >
                Total Price: ${calculateTotalPrice()}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#007BFF",
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 20,
                  width: "80%",
                  alignSelf: "center",
                }}
                onPress={handlePayment}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    textAlign: "center",
                    fontFamily: "Nunito_600SemiBold",
                  }}
                >
                  Go for payment
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </LinearGradient>
  );
}
