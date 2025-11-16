import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons"; // Import AntDesign
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
    StyleSheet, 
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import {
    useFonts,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { Raleway_700Bold, Raleway_600SemiBold } from "@expo-google-fonts/raleway";

// ✅ Import SQLite functions
import {
    getCart,
    removeFromCart,
    clearCart,
} from "@/src/database/cart.service";

// Giả định kiểu dữ liệu CoursesType
interface CoursesType {
    _id: string;
    name: string;
    price: number;
    level: string;
    thumbnail: { url: string };
    // Thêm các trường cần thiết khác
}

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const { user, setRefetch } = useUser();
    const [cartItems, setCartItems] = useState<CoursesType[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    // Load Fonts
    let [fontsLoaded, fontError] = useFonts({
        Nunito_400Regular,
        Nunito_600SemiBold,
        Nunito_700Bold,
        Raleway_700Bold,
        Raleway_600SemiBold
    });

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
            // Lấy danh sách ID khóa học
            const courseIds = cartItems.map(item => item._id);

            await axios.post(`${SERVER_URI}/create-mobile-order`, {
                userId: user._id,
                // Thay vì chỉ gửi cartItems[0]._id, gửi tất cả các ID khóa học
                courseId: courseIds,
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

    if (!fontsLoaded && !fontError) {
        return null;
    }

    // --- RENDER CART ITEM (Thay đổi chính ở đây: dùng View thay vì TouchableOpacity) ---
    const renderCartItem = ({ item }: { item: CoursesType }) => (
        <View
            style={styles.cartItemContainer} // Sử dụng View làm container ngoài cùng
        >
            {/* Ảnh và chi tiết được wrap trong TouchableOpacity */}
            <TouchableOpacity onPress={() => handleCourseDetails(item)}>
                <Image
                    source={{ uri: item.thumbnail.url }}
                    style={styles.itemImage}
                />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
                {/* Tên khóa học */}
                <TouchableOpacity onPress={() => handleCourseDetails(item)}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </Text>
                </TouchableOpacity>

                {/* Level */}
                <View style={styles.row}>
                    <View style={styles.levelTag}>
                        <Text style={styles.levelText}>{item.level}</Text>
                    </View>
                </View>

                {/* Giá và nút Xóa */}
                <View style={[styles.row, { justifyContent: "space-between", marginTop: 8 }]}>
                    <Text style={styles.itemPrice}>
                        ${item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="trash-outline" size={20} color={"#FF5733"} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // --- MAIN RENDER ---
    return (
        <LinearGradient
            colors={["#E6F0FF", "#F0F5F9"]}
            style={styles.fullScreenGradient}
        >
            <SafeAreaView style={styles.safeArea}>
                

                {orderSuccess ? (
                    // --- ORDER SUCCESS SCREEN ---
                    <View style={styles.successContainer}>
                        <MaterialCommunityIcons name="check-circle-outline" size={150} color="#00C853" />
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successSubtitle}>Thank you for your purchase!</Text>
                        <TouchableOpacity
                            style={styles.goHomeButton}
                            onPress={() => router.replace("/(tabs)/home")}
                        >
                            <Text style={styles.goHomeText}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // --- CART LIST SCREEN ---
                    <>
                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) => item._id.toString()}
                            contentContainerStyle={styles.listContent}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#2563EB"
                                />
                            }
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Image
                                        source={require("@/assets/empty_cart.png")}
                                        style={styles.emptyImage}
                                    />
                                    <Text style={styles.emptyText}>Your Cart is Empty!</Text>
                                </View>
                            )}
                            renderItem={renderCartItem}
                        />

                        {/* FLOATING CHECKOUT BAR */}
                        {cartItems.length > 0 && (
                            <View style={styles.checkoutBar}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total Price</Text>
                                    <Text style={styles.totalValue}>${calculateTotalPrice()}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.checkoutButton}
                                    onPress={handlePayment}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.checkoutText}>
                                        Checkout ({cartItems.length})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

// --- STYLESHEET TỐI ƯU ---
const styles = StyleSheet.create({
    fullScreenGradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        paddingTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    // Nút quay lại (được sử dụng làm padding/spacer)
    backButton: {
        width: 30, 
    },
    title: {
        fontSize: 20, // Giảm nhẹ font size để căn giữa tốt hơn
        fontFamily: 'Raleway_700Bold',
        color: '#1F2937',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    // --- CART ITEM STYLES ---
    cartItemContainer: {
        flexDirection: "row",
        marginVertical: 8,
        borderRadius: 12,
        padding: 12,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 15,
        resizeMode: 'cover',
    },
    itemDetails: {
        flex: 1,
        justifyContent: "space-between",
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Raleway_600SemiBold',
        color: '#1F2937',
        marginBottom: 5,
        lineHeight: 22,
    },
    levelTag: {
        backgroundColor: '#E0F2FE',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 10,
    },
    levelText: {
        fontSize: 12,
        color: '#2563EB',
        fontFamily: 'Nunito_600SemiBold',
    },
    itemPrice: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
        color: '#2563EB',
    },
    removeButton: {
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#FEE2E2',
    },

    // --- CHECKOUT BAR STYLES ---
    checkoutBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    totalContainer: {},
    totalLabel: {
        fontSize: 14,
        color: '#718096',
        fontFamily: 'Nunito_600SemiBold',
    },
    totalValue: {
        fontSize: 24,
        color: '#1F2937',
        fontFamily: 'Raleway_700Bold',
        marginTop: 2,
    },
    checkoutButton: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 25,
    },
    checkoutText: {
        color: "white",
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
    },

    // --- EMPTY/SUCCESS STYLES ---
    emptyContainer: {
        alignItems: "center",
        marginTop: width * 0.3,
    },
    emptyImage: {
        width: width * 0.6,
        height: width * 0.6,
        marginBottom: 20
    },
    emptyText: {
        fontSize: 22,
        fontFamily: "Raleway_600SemiBold",
        color: '#1F2937',
    },
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    successTitle: {
        fontSize: 26,
        fontFamily: "Raleway_700Bold",
        color: '#1F2937',
        marginTop: 10,
    },
    successSubtitle: {
        fontSize: 16,
        marginTop: 5,
        color: "#718096",
        fontFamily: "Nunito_400Regular",
        textAlign: 'center',
    },
    goHomeButton: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 30,
        marginTop: 30,
    },
    goHomeText: {
        color: "white",
        fontSize: 18,
        fontFamily: "Nunito_700Bold",
    }
});