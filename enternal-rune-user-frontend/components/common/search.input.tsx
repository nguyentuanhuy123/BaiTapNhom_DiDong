// components/common/search.input.tsx
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Text,
    Image,
    Keyboard, // Import Keyboard để ẩn bàn phím khi cần
} from "react-native";
import { useFonts, Nunito_700Bold, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
import CourseCard from "../cards/course.card";
import { LinearGradient } from "expo-linear-gradient";

// Giả định kiểu dữ liệu
interface CoursesType {
    _id: string;
    name: string;
    thumbnail: { url: string };
    price: number;
    // Thêm các trường cần thiết khác nếu có
}

export default function SearchInput({ homeScreen }: { homeScreen?: boolean }) {
    const [value, setValue] = useState("");
    const [courses, setCourses] = useState<CoursesType[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<CoursesType[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    // 1. Fetch dữ liệu chỉ một lần
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${SERVER_URI}/get-courses`);
                setCourses(res.data.courses);
                // Nếu không phải Home Screen (màn hình Search), hiển thị tất cả ban đầu
                if (!homeScreen) {
                    setFilteredCourses(res.data.courses);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchCourses();
    }, []);

    // 2. Logic Filter được tối ưu hóa
    useEffect(() => {
        if (value) {
            const filtered = courses.filter((course) =>
                course.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else if (!homeScreen) {
            // Màn hình Search và input rỗng: hiển thị tất cả
            setFilteredCourses(courses);
        } else {
            // Màn hình Home và input rỗng: ẩn kết quả
            setFilteredCourses([]);
        }
    }, [value, courses, homeScreen]);

    let [fontsLoaded, fontError] = useFonts({ Nunito_700Bold, Nunito_600SemiBold });
    if (!fontsLoaded && !fontError) return null;

    // 3. Render Item cho Home Screen (hiển thị tìm kiếm nhanh)
    const renderCourseItem = ({ item }: { item: CoursesType }) => (
        <TouchableOpacity
            style={styles.courseItem}
            onPress={() => {
                Keyboard.dismiss(); // Ẩn bàn phím khi chuyển trang
                router.push({
                    pathname: "/(routes)/course-details",
                    params: { item: JSON.stringify(item) },
                });
            }}
            activeOpacity={0.7}
        >
            <Image 
                source={{ uri: item.thumbnail.url }} 
                style={styles.courseThumb} 
                resizeMode="cover"
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.coursePrice}>${item.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    // Xác định style cho FlatList dựa trên homeScreen
    const flatListStyle = homeScreen ? styles.homeSearchOverlay : styles.searchScreenList;
    const isNoData = value !== "" && filteredCourses.length === 0 && !isFetching;

    return (
        <View style={homeScreen ? styles.homeContainer : styles.searchContainer}>
            {/* SEARCH INPUT */}
            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Search for courses..."
                    placeholderTextColor="#A3A3A3"
                    value={value}
                    onChangeText={setValue}
                    // Thêm keyboardType phù hợp (default)
                />
                <TouchableOpacity
                    style={styles.searchBtn}
                    // Nếu là home screen, chuyển đến trang Search chính
                    onPress={() => {
                        if (homeScreen) {
                            router.push("/(tabs)/search");
                        } else {
                            // Logic tìm kiếm/refresh cho màn hình search nếu cần
                            Keyboard.dismiss();
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#2467EC", "#3C8DFF"]}
                        style={styles.gradientBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <AntDesign name="search" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* RESULTS */}
            {filteredCourses.length > 0 || isNoData ? (
                <View style={flatListStyle}>
                    <FlatList
                        data={filteredCourses}
                        keyExtractor={(item) => item._id}
                        // Thay đổi bố cục cho Course Card nếu ở màn hình search chính
                        renderItem={
                            homeScreen 
                            ? renderCourseItem 
                            : ({ item }) => <CourseCard item={item} horizontal={false} /> // Giả định CourseCard nhận prop horizontal
                        }
                        ListEmptyComponent={
                            isNoData ? (
                                <Text style={styles.noDataText}>No courses found matching "{value}"</Text>
                            ) : null
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            ) : null}
        </View>
    );
}

// --- STYLESHEET TỐI ƯU ---
const styles = StyleSheet.create({
    homeContainer: { 
        // Trên Home Screen, container chỉ chứa input, FlatList là overlay
        zIndex: 10,
    },
    searchContainer: { 
        flex: 1, 
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        zIndex: 20, // Đảm bảo input luôn ở trên cùng
    },
    input: {
        flex: 1,
        height: 55, // Cao hơn một chút
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "Nunito_600SemiBold", // Dùng SemiBold cho input text
        color: "#1F2937",
        // Bóng đổ tinh tế hơn
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    searchBtn: {
        marginLeft: 10,
        borderRadius: 12,
        overflow: "hidden",
    },
    gradientBtn: {
        width: 55, // Kích thước bằng với Input Height
        height: 55,
        justifyContent: "center",
        alignItems: "center",
    },

    // --- FlatList Styles ---
    listContent: {
        paddingBottom: 20, // Thêm padding dưới cùng cho danh sách
    },
    // Style cho kết quả tìm kiếm nhanh trên Home Screen (Overlay)
    homeSearchOverlay: {
        position: 'absolute',
        top: 65, // Ngay dưới input
        left: 0,
        right: 0,
        // Dùng marginHorizontal thay cho paddingHorizontal của container chính
        marginHorizontal: 16, 
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: 300, // Giới hạn chiều cao cho kết quả tìm kiếm nhanh
        zIndex: 15, // Dưới input nhưng trên nội dung khác
        paddingTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 12,
        overflow: 'hidden',
    },
    // Style cho màn hình Search chính
    searchScreenList: {
        marginTop: 15,
        flex: 1, // Chiếm hết không gian còn lại
    },

    // --- Course Item (Home Quick Search) Styles ---
    courseItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        // Loại bỏ shadow ở đây vì đã có shadow ở overlay container
    },
    courseThumb: { 
        width: 45, 
        height: 45, 
        borderRadius: 8,
        marginRight: 10,
    },
    courseInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0', // Dải phân cách nhẹ
    },
    courseName: { 
        flex: 1,
        marginRight: 15, 
        fontSize: 15, 
        fontFamily: "Nunito_600SemiBold", 
        color: '#1F2937',
    },
    coursePrice: {
        fontSize: 14,
        fontFamily: "Nunito_700Bold",
        color: "#2467EC",
    },
    noDataText: { 
        textAlign: "center", 
        fontSize: 16, 
        fontFamily: "Nunito_600SemiBold", 
        marginTop: 20, 
        marginBottom: 20,
        color: "#999" 
    },
});