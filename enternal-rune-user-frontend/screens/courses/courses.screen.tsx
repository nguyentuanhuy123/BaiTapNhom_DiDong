import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    useFonts,
    Raleway_700Bold,
    Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito"; // Chỉ giữ lại font cần thiết
import Loader from "@/components/loader/loader"; // Giữ lại Loader
import { LinearGradient } from "expo-linear-gradient";
import CourseCard from "@/components/cards/course.card";
import { Ionicons } from "@expo/vector-icons";

// Giả định kiểu dữ liệu
interface CoursesType {
    _id: string;
    name: string;
    categories: string;
    // Thêm các trường cần thiết khác
}

export default function CoursesScreen() {
    const [courses, setCourses] = useState<CoursesType[]>([]);
    const [originalCourses, setOriginalCourses] = useState<CoursesType[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");

    // Tối ưu hóa logic fetch data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Categories
                const categoryRes = await axios.get(`${SERVER_URI}/get-layout/Categories`);
                setCategories(categoryRes.data.layout.categories);

                // 2. Fetch Courses
                const coursesRes: any = await axios.get(`${SERVER_URI}/get-courses`);
                setCourses(coursesRes.data.courses);
                setOriginalCourses(coursesRes.data.courses);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Xử lý lỗi một cách nhẹ nhàng hơn
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    let [fontsLoaded, fontError] = useFonts({
        Raleway_700Bold,
        Nunito_600SemiBold,
        Raleway_600SemiBold,
    });

    if (!fontsLoaded && !fontError) {
        return null;
    }

    const handleCategories = (categoryTitle: string) => {
        setActiveCategory(categoryTitle);
        if (categoryTitle === "All") {
            setCourses(originalCourses);
        } else {
            const filterCourses = originalCourses.filter(
                (i: CoursesType) => i.categories === categoryTitle
            );
            setCourses(filterCourses);
        }
    };

    return (
        <>
            {/* Đảm bảo trạng thái loading hiển thị toàn màn hình */}
            {loading ? (
                <Loader />
            ) : (
                <LinearGradient
                    colors={["#F6F7F9", "#E5ECF9"]} // Đảo ngược màu gradient cho nền mượt mà hơn
                    style={styles.fullScreenGradient}
                >
                    {/* Đặt StatusBar cho nền sáng */}
                    <StatusBar barStyle="dark-content" backgroundColor="#F6F7F9" />

                    <SafeAreaView style={styles.safeAreaContainer}>

                        {/* HEADER */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>Explore Courses</Text>
                            <TouchableOpacity activeOpacity={0.7} style={styles.filterButton}>
                                <Ionicons name="filter-outline" size={24} color="#2467EC" />
                            </TouchableOpacity>
                        </View>

                        {/* CATEGORY TABS */}
                        <View style={styles.categoryWrapper}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryScrollView}
                            >
                                {/* Nút 'All' */}
                                <TouchableOpacity
                                    style={[
                                        styles.categoryButton,
                                        activeCategory === "All" && styles.categoryButtonActive,
                                    ]}
                                    onPress={() => handleCategories("All")}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            activeCategory === "All" && styles.categoryTextActive,
                                        ]}
                                    >
                                        All
                                    </Text>
                                </TouchableOpacity>

                                {/* Các danh mục khác */}
                                {categories?.map((i: any, index: number) => (
                                    <TouchableOpacity
                                        key={i._id || index}
                                        style={[
                                            styles.categoryButton,
                                            activeCategory === i?.title && styles.categoryButtonActive,
                                        ]}
                                        onPress={() => handleCategories(i?.title)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                activeCategory === i?.title && styles.categoryTextActive,
                                            ]}
                                        >
                                            {i?.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* DANH SÁCH KHÓA HỌC */}
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.courseList}>
                            {courses?.map((item: CoursesType, index: number) => (
                                // Giả định CourseCard đã được tối ưu cho hiển thị dọc
                                <CourseCard item={item} key={index} horizontal={false} />
                            ))}

                            {/* Thông báo không có dữ liệu */}
                            {courses?.length === 0 && (
                                <View style={styles.noDataContainer}>
                                    <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
                                    <Text style={styles.noDataText}>
                                        No courses available in this category!
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </LinearGradient>
            )}
        </>
    );
}

// --- STYLESHEET TỐI ƯU ---
const styles = StyleSheet.create({
    fullScreenGradient: {
        flex: 1,
    },
    safeAreaContainer: {
        flex: 1,
    },

    // --- Header ---
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28, // Kích thước lớn hơn
        fontFamily: "Raleway_700Bold",
        color: "#1F2937",
    },
    filterButton: {
        padding: 5,
    },

    // --- Category Tabs ---
    categoryWrapper: {
        paddingVertical: 10,
        backgroundColor: 'transparent', // Dùng nền transparent
    },
    categoryScrollView: {
        paddingHorizontal: 16,
        alignItems: 'center',
        columnGap: 10,
    },
    categoryButton: {
        paddingVertical: 10,
        backgroundColor: "#E5ECF9", // Màu nền rất nhạt
        borderRadius: 10, // Bo tròn nhẹ nhàng
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB', // Thêm viền nhẹ
    },
    categoryButtonActive: {
        backgroundColor: "#2467EC",
        borderColor: "#2467EC", // Viền cùng màu với nền active
        // Tạo bóng đổ nhẹ cho nút active nổi bật hơn
        shadowColor: "#2467EC",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    categoryText: {
        color: "#4B5563", // Màu chữ xám đậm hơn cho nút không active
        fontSize: 15,
        fontFamily: "Nunito_600SemiBold",
    },
    categoryTextActive: {
        color: "#fff",
    },

    // --- Course List ---
    courseList: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
        rowGap: 18, // Tăng khoảng cách giữa các thẻ
    },
    noDataContainer: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    noDataText: {
        textAlign: "center",
        paddingTop: 10,
        fontSize: 16,
        fontFamily: "Nunito_600SemiBold",
        color: "#9CA3AF",
    },
});