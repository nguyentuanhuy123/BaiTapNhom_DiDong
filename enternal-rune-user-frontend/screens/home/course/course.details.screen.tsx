import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams,useFocusEffect } from "expo-router";
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
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useState,useCallback } from "react";
import CourseLesson from "@/components/courses/course.lesson";
import ReviewCard from "@/components/cards/review.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import { addToCart, isCourseInCart } from "@/src/database/cart.service";



export default function CourseDetailScreen() {
  const [activeButton, setActiveButton] = useState("About");
  const { user, loading } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const { item } = useLocalSearchParams();

  // Bảo vệ JSON.parse
  const courseData: CoursesType | null = item ? JSON.parse(item as string) : null;
  const [checkPurchased, setCheckPurchased] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (courseData && user?.courses?.find((i: any) => i._id === courseData._id)) {
        setCheckPurchased(true);
      } else {
        setCheckPurchased(false); // reset nếu chưa mua
      }
    }, [user, courseData])
  );

  const handleAddToCart = async () => {
    if (!courseData || !user?._id) return;

    const exists = await isCourseInCart(courseData._id, user._id);
    if (!exists) {
      await addToCart(courseData, user._id);
    }

    router.push("/(routes)/cart");
  };

  const handleGoToCourse = async () => {
    if (!courseData) return;
    try {
      await AsyncStorage.setItem("current_course", JSON.stringify(courseData));
      router.push("/(routes)/course-access");
    } catch (error) {
      console.error("Failed to store course data:", error);
    }
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
  if (!courseData) return <Loader />; // Bảo vệ khi không có courseData

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1, paddingTop: 15 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View style={{ marginHorizontal: 16 }}>
          <View
            style={{
              position: "absolute",
              zIndex: 1,
              backgroundColor: "#FFB013",
              borderRadius: 54,
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginTop: 8,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "black", fontSize: 14, fontFamily: "Nunito_600SemiBold" }}>
              Best Seller
            </Text>
          </View>
          <View style={{ position: "absolute", zIndex: 14, right: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#141517",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 3,
                marginTop: 8,
                marginRight: 8,
              }}
            >
              <FontAwesome name="star" size={14} color={"#FFB800"} />
              <Text
                style={{
                  color: "white",
                  marginLeft: 4,
                  fontFamily: "Nunito_600SemiBold",
                }}
              >
                {courseData?.ratings ?? 0}
              </Text>
            </View>
          </View>
          <Image
            source={{ uri: courseData?.thumbnail?.url }}
            style={{ width: "100%", height: 230, borderRadius: 6 }}
          />
        </View>

        {/* Title & Price */}
        <Text
          style={{
            marginHorizontal: 16,
            marginTop: 15,
            fontSize: 20,
            fontWeight: "600",
            fontFamily: "Raleway_700Bold",
          }}
        >
          {courseData?.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 10,
            paddingTop: 5,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: "#000", fontSize: 22, marginLeft: 10, paddingVertical: 10 }}>
              ${courseData?.price ?? 0}
            </Text>
            <Text
              style={{
                color: "#808080",
                fontSize: 20,
                marginLeft: 10,
                textDecorationLine: "line-through",
              }}
            >
              ${courseData?.estimatedPrice ?? 0}
            </Text>
          </View>
          <Text style={{ fontSize: 15 }}>{courseData?.purchased ?? 0} students</Text>
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 25,
            marginHorizontal: 16,
            backgroundColor: "#E1E9F8",
            borderRadius: 50,
          }}
        >
          {["About", "Lessons", "Reviews"].map((btn) => (
            <TouchableOpacity
              key={btn}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 42,
                backgroundColor: activeButton === btn ? "#2467EC" : "transparent",
                borderRadius: activeButton === btn ? 50 : 0,
              }}
              onPress={() => setActiveButton(btn)}
            >
              <Text
                style={{
                  color: activeButton === btn ? "#fff" : "#000",
                  fontFamily: "Nunito_600SemiBold",
                }}
              >
                {btn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeButton === "About" && (
          <View style={{ marginHorizontal: 16, marginVertical: 25, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 18, fontFamily: "Raleway_700Bold" }}>About course</Text>
            <Text
              style={{
                color: "#525258",
                fontSize: 16,
                marginTop: 10,
                textAlign: "justify",
                fontFamily: "Nunito_500Medium",
              }}
            >
              {isExpanded
                ? courseData?.description
                : courseData?.description?.slice(0, 302)}
            </Text>
            {courseData?.description?.length > 302 && (
              <TouchableOpacity style={{ marginTop: 3 }} onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={{ color: "#2467EC", fontSize: 14 }}>
                  {isExpanded ? "Show Less -" : "Show More +"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {activeButton === "Lessons" && (
          <View style={{ marginHorizontal: 16, marginVertical: 25 }}>
            <CourseLesson courseDetails={courseData} />
          </View>
        )}
        {activeButton === "Reviews" && (
          <View style={{ marginHorizontal: 16, marginVertical: 25 }}>
            <View style={{ rowGap: 25 }}>
              {courseData?.reviews?.map((item: ReviewType, index: number) => (
                <ReviewCard item={item} key={index} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Button */}
      <View style={{ backgroundColor: "#FFF", marginHorizontal: 16, paddingVertical: 11, marginBottom: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: "#2467EC", paddingVertical: 16, borderRadius: 4 }}
          onPress={checkPurchased ? handleGoToCourse : handleAddToCart}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#FFF",
              fontSize: 16,
              fontFamily: "Nunito_600SemiBold",
            }}
          >
            {checkPurchased ? "Go to the course" : "Add to cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
