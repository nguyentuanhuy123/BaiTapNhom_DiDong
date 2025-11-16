import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import { Nunito_600SemiBold, Nunito_500Medium } from "@expo-google-fonts/nunito";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import CourseCard from "@/components/cards/course.card";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import useUser from "@/hooks/auth/useUser";
// **********************************
// STYLES ĐÃ ĐƯỢC CẢI TIẾN LẦN CUỐI
// **********************************
const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB", // Nền xám nhạt
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    // Tinh chỉnh căn chỉnh text và icon
    paddingVertical: 2,
  },
  titleIcon: {
    marginRight: 8,
    color: "#2563EB",
  },
  title: {
    fontSize: 24,
    color: "#1F2937",
    fontFamily: "Raleway_700Bold",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14, // Tăng padding ngang
    paddingVertical: 8, // Tăng padding dọc
    borderRadius: 16, // Bo tròn nhiều hơn, tạo cảm giác sang trọng
    backgroundColor: "#E0F2FE",
  },
  seeAllText: {
    fontSize: 14,
    color: "#2563EB",
    fontFamily: "Nunito_600SemiBold",
    marginRight: 5,
  },
  gridListContainer: {
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20, // Tăng khoảng cách giữa các hàng
  },
  courseCardWrapper: {
    width: "48%",
    borderRadius: 16, // Bo tròn góc lớn hơn
    overflow: "hidden",
    // Bóng đổ mỏng, dài và tinh tế hơn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Giảm chiều cao bóng đổ
    shadowOpacity: 0.1, // Giảm độ mờ
    shadowRadius: 10, // Tăng bán kính làm bóng đổ lan tỏa hơn
    elevation: 4,
  },
  loadingText: {
    textAlign: "center",
    fontFamily: "Nunito_500Medium",
    color: "#888",
    marginTop: 50,
  },
});

export default function AllCourses() {
  const [courses, setCourses] = useState<CoursesType[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const { user } = useUser();
  // useFocusEffect(
  //   useCallback(() => {
  //     setLoading(true);
  //     axios
  //       .get(`${SERVER_URI}/get-courses`)
  //       .then((res: any) => {
  //         setCourses(res.data.courses);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setLoading(false);
  //       });
  //   }, [])
  // );
  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      axios
        .get(`${SERVER_URI}/get-courses`)
        .then((res: any) => {
          const all = res.data.courses;
          const purchasedIds =
            user?.courses?.map((c: any) => c._id.toString()) || [];
          const filtered = all.filter(
            (course: any) => !purchasedIds.includes(course._id.toString())
          );

          setCourses(filtered);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }, [user])
  );
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
    Nunito_500Medium,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (loading && courses.length === 0) {
    return (
      <View style={listStyles.container}>
        <Text style={listStyles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  return (
    <View style={listStyles.container}>
      {/* HEADER */}
      <View style={listStyles.header}>
        <View style={listStyles.titleContainer}>
          <MaterialCommunityIcons
            name="book-education-outline"
            size={28}
            style={listStyles.titleIcon}
          />
          <Text style={listStyles.title}>Popular courses</Text>
        </View>
        <TouchableOpacity
          style={listStyles.seeAllButton}
          onPress={() => router.push("/(tabs)/courses")}
          activeOpacity={0.7}
        >
          <Text style={listStyles.seeAllText}>See All</Text>
          
        </TouchableOpacity>
      </View>

      {/* FLATLIST DẠNG GRID 2 CỘT */}
      <FlatList
        ref={flatListRef}
        scrollEnabled={false}
        data={courses.slice(0, 4)}
        numColumns={2}
        columnWrapperStyle={listStyles.columnWrapper}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={listStyles.courseCardWrapper}>
            <CourseCard item={item} />
          </View>
        )}
        contentContainerStyle={listStyles.gridListContainer}
      />
    </View>
  );
}