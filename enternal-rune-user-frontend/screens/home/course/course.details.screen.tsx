import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    useFonts,
    Raleway_600SemiBold,
    Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { FontAwesome, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import CourseLesson from "@/components/courses/course.lesson";
import ReviewCard from "@/components/cards/review.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import { addToCart, isCourseInCart } from "@/src/database/cart.service";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CoursesType {
    _id: string;
    name: string;
    price: number;
    estimatedPrice: number;
    purchased: number;
    ratings: number;
    description: string;
    thumbnail: { url: string };
    courseData: any[];
    reviews: any[];
}

const { width } = Dimensions.get("window");

export default function CourseDetailScreen() {
    const [activeButton, setActiveButton] = useState("About");
    const { user } = useUser();
    const [isExpanded, setIsExpanded] = useState(false);
    const { item } = useLocalSearchParams();

    const courseData: CoursesType | null = item ? JSON.parse(item as string) : null;
    const [checkPurchased, setCheckPurchased] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (courseData && user?.courses?.find((i: any) => i._id === courseData._id)) {
                setCheckPurchased(true);
            } else {
                setCheckPurchased(false);
            }
        }, [user, courseData])
    );

    const handleAddToCart = async () => {
        if (!courseData || !user?._id) return;
        const exists = await isCourseInCart(courseData._id, user._id);
        if (!exists) await addToCart(courseData, user._id);
        router.push("/(routes)/cart");
    };

    const handleGoToCourse = async () => {
        if (!courseData) return;
        await AsyncStorage.setItem("current_course", JSON.stringify(courseData));
        router.push("/(routes)/course-access");
    };

    const toggleDescription = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    let [fontsLoaded, fontError] = useFonts({
        Raleway_600SemiBold,
        Raleway_700Bold,
        Nunito_400Regular,
        Nunito_500Medium,
        Nunito_700Bold,
        Nunito_600SemiBold,
    });

    if (!fontsLoaded && !fontError) return null;
    if (!courseData) return <Loader />;

    return (
        <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={styles.fullScreenGradient}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>

                {/* THUMBNAIL + BADGES */}
                <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: courseData?.thumbnail?.url }} style={styles.courseImage} />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.35)"]}
                        style={styles.thumbnailOverlay}
                    />
                    <View style={styles.badgesRow}>
                        <View style={styles.badgeBestSeller}>
                            <Text style={styles.badgeText}>Best Seller</Text>
                        </View>
                        <View style={styles.badgeRating}>
                            <FontAwesome name="star" size={14} color="#FFB800" />
                            <Text style={styles.ratingText}>{courseData?.ratings?.toFixed(1) ?? 0}</Text>
                        </View>
                    </View>
                </View>

                {/* TITLE + PRICE */}
                <View style={styles.detailSection}>
                    <Text style={styles.courseTitle} numberOfLines={2}>{courseData?.name}</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>${courseData?.price?.toFixed(2)}</Text>
                            {courseData?.estimatedPrice > courseData?.price && (
                                <Text style={styles.oldPrice}>${courseData?.estimatedPrice?.toFixed(2)}</Text>
                            )}
                        </View>
                        <Text style={styles.studentsCount}>{courseData?.purchased ?? 0} students</Text>
                    </View>
                </View>

                {/* TAB BUTTONS + INDICATOR */}
                <View style={styles.tabButtonContainer}>
                    {["About", "Lessons", "Reviews"].map((btn, idx) => (
                        <TouchableOpacity
                            key={btn}
                            style={[styles.tabButton, activeButton === btn && styles.tabButtonActive]}
                            onPress={() => setActiveButton(btn)}
                        >
                            <Text style={[styles.tabButtonText, activeButton === btn && styles.tabButtonTextActive]}>
                                {btn}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* CONTENT */}
                <View style={styles.contentSection}>
                    {activeButton === "About" && (
                        <>
                            <Text style={styles.contentTitle}>About course</Text>
                            <Text style={styles.descriptionText} numberOfLines={isExpanded ? undefined : 5}>
                                {courseData?.description}
                            </Text>
                            {courseData?.description?.length > 200 && (
                                <TouchableOpacity onPress={toggleDescription}>
                                    <Text style={styles.showMoreText}>
                                        {isExpanded ? "Show Less -" : "Show More +"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    {activeButton === "Lessons" && (
                        <CourseLesson courseDetails={courseData} />
                    )}
                    {activeButton === "Reviews" && (
                        <View style={styles.reviewsList}>
                            {courseData?.reviews?.map((item: any, index: number) => (
                                <ReviewCard key={index} item={item} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footerBar}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={checkPurchased ? handleGoToCourse : handleAddToCart}
                    activeOpacity={0.8}
                >
                    <FontAwesome
                        name={checkPurchased ? "play" : "shopping-cart"}
                        size={20}
                        color="#FFF"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.actionButtonText}>
                        {checkPurchased ? "Go to the course" : "Add to cart"}
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    fullScreenGradient: { flex: 1 },
    scrollViewContent: { paddingBottom: 120 },

    thumbnailContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    courseImage: { width: "100%", height: width * 0.55, resizeMode: "cover" },
    thumbnailOverlay: { ...StyleSheet.absoluteFillObject },
    badgesRow: { position: "absolute", top: 10, left: 10, right: 10, flexDirection: "row", justifyContent: "space-between" },
    badgeBestSeller: { backgroundColor: "#FFB013", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
    badgeText: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#1F2937" },
    badgeRating: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    ratingText: { color: "white", marginLeft: 4, fontFamily: "Nunito_600SemiBold", fontSize: 14 },

    detailSection: { marginHorizontal: 16, marginTop: 16 },
    courseTitle: { fontSize: 24, fontFamily: "Raleway_700Bold", color: "#1F2937", lineHeight: 32, marginBottom: 6 },
    priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    priceContainer: { flexDirection: "row", alignItems: "baseline" },
    currentPrice: { fontSize: 28, fontFamily: "Nunito_700Bold", color: "#2467EC", marginRight: 10 },
    oldPrice: { fontSize: 18, fontFamily: "Nunito_500Medium", color: "#808080", textDecorationLine: "line-through" },
    studentsCount: { fontSize: 15, fontFamily: "Nunito_500Medium", color: "#525258" },

    tabButtonContainer: { flexDirection: "row", marginHorizontal: 16, marginTop: 25, backgroundColor: "#E1E9F8", borderRadius: 50, padding: 5 },
    tabButton: { flex: 1, paddingVertical: 12, borderRadius: 50, alignItems: "center" },
    tabButtonActive: { backgroundColor: "#2467EC" },
    tabButtonText: { fontSize: 15, fontFamily: "Nunito_600SemiBold", color: "#525258" },
    tabButtonTextActive: { color: "#fff" },

    contentSection: { marginHorizontal: 16, marginTop: 20 },
    contentTitle: { fontSize: 18, fontFamily: "Raleway_700Bold", color: "#1F2937", marginBottom: 10 },
    descriptionText: { fontSize: 16, fontFamily: "Nunito_500Medium", color: "#525258", textAlign: "justify", lineHeight: 22 },
    showMoreText: { color: "#2467EC", fontSize: 14, fontFamily: "Nunito_600SemiBold", marginTop: 5 },
    reviewsList: { paddingHorizontal: 0, rowGap: 15 },

    footerBar: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingVertical: 20,
        backgroundColor: "white",
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
    },
    actionButton: {
        flexDirection: "row", justifyContent: "center", alignItems: "center",
        backgroundColor: "#2467EC", paddingVertical: 16, borderRadius: 12,
    },
    actionButtonText: { color: "#fff", fontSize: 18, fontFamily: "Nunito_700Bold" },
});
