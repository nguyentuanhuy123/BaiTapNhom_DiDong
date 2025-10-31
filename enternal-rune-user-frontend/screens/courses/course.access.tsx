import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import Loader from "@/components/loader/loader";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { widthPercentageToDP } from "react-native-responsive-screen";
import QuestionsCard from "@/components/cards/question.card";
import { Toast } from "react-native-toast-notifications";
import ReviewCard from "@/components/cards/review.card";
import { FontAwesome } from "@expo/vector-icons";
import useUser from "@/hooks/auth/useUser";

export default function CourseAccessScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [data, setData] = useState<CoursesType | null>(null);
  const [courseContentData, setCourseContentData] = useState<CourseDataType[]>([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeButton, setActiveButton] = useState("About");
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState("");
  const [reviewAvailable, setReviewAvailable] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Lấy courseData từ AsyncStorage
        const storedCourse = await AsyncStorage.getItem("current_course");
        if (!storedCourse) return;

        const parsedData: CoursesType = JSON.parse(storedCourse);
        setData(parsedData);

        // Kiểm tra review đã có hay chưa
        const hasReview = parsedData.reviews?.some(
          (r: any) => r.user._id === user?._id
        );
        if (hasReview) setReviewAvailable(true);

        // Fetch nội dung course
        await fetchCourseContent(parsedData._id);
      } catch (error) {
        console.error("Failed to load course data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user]);

  const fetchCourseContent = async (courseId?: string) => {
    if (!courseId && !data) return;
    try {
      const res = await axios.get(
        `${SERVER_URI}/get-course-content/${courseId || data?._id}`
      );
      setCourseContentData(res.data.content);
    } catch (error) {
      console.error("Failed to fetch course content:", error);
      router.push("/(routes)/course-details");
    }
  };
const handleQuestionSubmit = async () => {
  if (!data || !courseContentData?.[activeVideo]?._id) {
    console.log("Missing courseId or contentId");
    return;
  }

  try {
    const payload = {
      question,
      courseId: data._id,
      contentId: courseContentData[activeVideo].title,
      userName: user?.name || "Guest",
    };

    console.log("Submitting question payload:", payload);

    await axios.put(`${SERVER_URI}/add-question`, payload);

    setQuestion("");
    Toast.show("Question created successfully!", { placement: "bottom" });
    await fetchCourseContent(data._id);
  } catch (error) {
    console.log("Failed to submit question:", error);
  }
};


const handleReviewSubmit = async () => {
  if (!data) return;

  const reviewerName = user?.name || "Guest";

  try {
    await axios.put(`${SERVER_URI}/add-review/${data._id}`, {
      review,
      rating,
      userName: reviewerName,
    });

    setRating(1);
    setReview("");
    router.push({
      pathname: "/(routes)/course-details",
      params: { item: JSON.stringify(data) } // hoặc chỉ truyền courseId
    });

  } catch (error) {
    console.log(error);
  }
};



  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <TouchableOpacity key={i + 1} onPress={() => setRating(i + 1)}>
        <FontAwesome
          name={i + 1 <= rating ? "star" : "star-o"}
          size={25}
          color={"#FF8D07"}
          style={{ marginHorizontal: 4, marginTop: -5 }}
        />
      </TouchableOpacity>
    ));
  };

  if (isLoading || !data) return <Loader />;

  return (
    <ScrollView stickyHeaderIndices={[0]} style={{ flex: 1, padding: 10 }}>
      {/* Video */}
      <View style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 10 }}>
        <WebView
          source={{ uri: courseContentData[activeVideo]?.videoUrl! }}
          allowsFullscreenVideo
        />
      </View>

      {/* Prev/Next */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
        <TouchableOpacity
          style={styles.button}
          disabled={activeVideo === 0}
          onPress={() => setActiveVideo(activeVideo - 1)}
        >
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          disabled={activeVideo >= courseContentData.length - 1}
          onPress={() => setActiveVideo(activeVideo + 1)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 10 }}>
        {activeVideo + 1}. {courseContentData[activeVideo]?.title}
      </Text>

      {/* Tabs */}
      <View style={{ flexDirection: "row", marginTop: 25, marginHorizontal: 10, backgroundColor: "#E1E9F8", borderRadius: 50, gap: 10 }}>
        {["About", "Q&A", "Reviews"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 42,
              backgroundColor: activeButton === tab ? "#2467EC" : "transparent",
              borderRadius: activeButton === tab ? 50 : 0,
            }}
            onPress={() => setActiveButton(tab)}
          >
            <Text style={{ color: activeButton === tab ? "#fff" : "#000", fontFamily: "Nunito_600SemiBold" }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* About */}
      {activeButton === "About" && (
        <View style={{ marginHorizontal: 16, marginVertical: 25 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>About course</Text>
          <Text style={{ color: "#525258", fontSize: 16, marginTop: 10, textAlign: "justify" }}>
            {isExpanded ? data.description : data.description.slice(0, 302)}
          </Text>
          {data.description.length > 302 && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={{ color: "#2467EC", fontSize: 14 }}>
                {isExpanded ? "Show Less -" : "Show More +"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Q&A */}
      {activeButton === "Q&A" && (
        <View style={{ flex: 1, margin: 15 }}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question..."
            style={{ marginVertical: 20, backgroundColor: "white", borderRadius: 10, height: 100, padding: 10 }}
            multiline
          />
          <TouchableOpacity style={styles.button} disabled={!question} onPress={handleQuestionSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

          {courseContentData[activeVideo]?.questions?.slice().reverse().map((item, index) => (
            <QuestionsCard key={index} item={item} fetchCourseContent={() => fetchCourseContent(data._id)} courseData={data} contentId={courseContentData[activeVideo]._id} />
          ))}
        </View>
      )}

      {/* Reviews */}
      {activeButton === "Reviews" && (
        <View style={{ marginHorizontal: 16, marginVertical: 25 }}>
          {!reviewAvailable && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 18, paddingRight: 5 }}>Give one rating:</Text>
                {renderStars()}
              </View>

              <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="Give one review..."
                style={{ backgroundColor: "white", borderRadius: 10, height: 100, padding: 10, marginVertical: 10 }}
                multiline
              />
              <TouchableOpacity style={styles.button} disabled={!review} onPress={handleReviewSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </>
          )}

          {data.reviews?.map((item, index) => (
            <ReviewCard key={index} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: widthPercentageToDP("35%"),
    height: 40,
    backgroundColor: "#2467EC",
    marginVertical: 10,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
