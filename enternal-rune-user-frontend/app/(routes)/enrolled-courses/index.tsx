import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/loader/loader";
import CourseCard from "@/components/cards/course.card1";
import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
import { getQuizResult } from "@/src/database/courseProgress";
import { useFocusEffect } from "expo-router";

// ---- Type bổ sung ----
type CoursesTypeWithProgress = CoursesType & { progress?: number };

export default function Index() {
  const [courses, setCourses] = useState<CoursesTypeWithProgress[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { loading: authLoading, user } = useUser();

  const fetchCourses = useCallback(async () => {
    if (!user?._id) return;

    setLoadingCourses(true);
    try {
      // Lấy tất cả courses
      const res = await axios.get(`${SERVER_URI}/get-courses`);
      const allCourses: CoursesType[] = res.data.courses || [];

      // Lọc các khóa mà user đã đăng ký
      const enrolledCourses = allCourses.filter(course =>
        user.courses?.some((c: any) => c._id === course._id)
      );

      const updatedCourses: CoursesTypeWithProgress[] = [];

      for (const course of enrolledCourses) {
        const contents = course.courseData || [];
        let totalQuizzes = 0;
        let completedQuizzes = 0;

        for (const content of contents) {
          const quizList = content.quizQuestions || [];
          if (quizList.length > 0) {
            totalQuizzes++;

            // 🔹 Lấy quiz result theo title
            const contentTitle = content.title.toString();
            const result = await getQuizResult(user._id, contentTitle);

            if (result) completedQuizzes++;

            console.log(
              `📘 [${course.name}] ${content.title} →`,
              result ? "✅ Completed" : "❌ Not done"
            );
          }
        }

        const progress =
          totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

        updatedCourses.push({ ...course, progress });
      }

      setCourses(updatedCourses);
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  }, [user]);

  // 🔹 Khi màn hình được focus (quay lại), sẽ fetch lại
  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  if (authLoading || loadingCourses) return <Loader />;

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1 }}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => <CourseCard item={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </LinearGradient>
  );
}
