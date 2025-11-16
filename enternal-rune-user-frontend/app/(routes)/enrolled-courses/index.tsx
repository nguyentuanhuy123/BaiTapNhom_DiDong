import React, { useCallback, useState } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/loader/loader";
import CourseCard from "@/components/cards/course.card1";
import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
import { getQuizResult } from "@/src/database/courseProgress";
import { useFocusEffect } from "expo-router";

type CoursesTypeWithProgress = CoursesType & { progress?: number };

export default function Index() {
  const [courses, setCourses] = useState<CoursesTypeWithProgress[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { loading: authLoading, user } = useUser();

  const fetchCourses = useCallback(async () => {
    if (!user?._id) return;

    setLoadingCourses(true);
    try {
      const res = await axios.get(`${SERVER_URI}/get-courses`);
      const allCourses: CoursesType[] = res.data.courses || [];

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

            const contentTitle = content.title.toString();
            const result = await getQuizResult(user._id, contentTitle);
            if (result) completedQuizzes++;
          }
        }

        const progress =
          totalQuizzes > 0
            ? Math.round((completedQuizzes / totalQuizzes) * 100)
            : 0;

        updatedCourses.push({ ...course, progress });
      }

      setCourses(updatedCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  if (authLoading || loadingCourses) return <Loader />;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Courses</Text>
      <Text style={styles.headerSubtitle}>
        Your enrolled courses and progress
      </Text>
    </View>
  );
  return (
    <LinearGradient colors={["#DDE9FF", "#F7F9FB"]} style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CourseCard item={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  headerContainer: {
    marginBottom: 22,
    marginTop: 10,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A3A6B",
  },

  headerSubtitle: {
    fontSize: 16,
    color: "#4A5F7E",
    marginTop: 4,
  },
});
