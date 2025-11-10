import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { saveQuizResult } from "@/src/database/courseProgress";
import useUser from "@/hooks/auth/useUser";
import { widthPercentageToDP } from "react-native-responsive-screen";

export default function CourseQuizScreen() {
  const { user } = useUser();
  const { courseId, contentId, quizQuestions } = useLocalSearchParams();
  const quiz = JSON.parse(quizQuestions as string);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex: number, optIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const handleSubmit = async () => {
  let correct = 0;
  quiz.forEach((q: any, i: number) => {
    if (answers[i] !== undefined && q.options[answers[i]].isCorrect) correct++;
  });
  setScore(correct);
  setSubmitted(true);

  try {
    // ✅ Lưu vào SQLite
    await saveQuizResult({
      userId: user?._id || "guest",
      courseId: courseId as string,
      contentId: contentId as string,
      score: correct,
      total: quiz.length,
      answers,
    });

    console.log("✅ Quiz result saved successfully:", {
      userId: user?._id || "guest",
      courseId,
      contentId,
      score: correct,
      total: quiz.length,
      answers,
    });
  } catch (error) {
    console.error("❌ Failed to save quiz result:", error);
  }
};


  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 20 }}>Quiz</Text>

      {quiz.map((q: any, i: number) => (
        <View key={i} style={{ marginBottom: 20, backgroundColor: "#fff", padding: 15, borderRadius: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {i + 1}. {q.question}
          </Text>
          {q.options.map((opt: any, j: number) => (
            <TouchableOpacity
              key={j}
              disabled={submitted}
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                backgroundColor:
                  answers[i] === j
                    ? "#2467EC"
                    : submitted && opt.isCorrect
                    ? "#6EE7B7"
                    : "#E1E9F8",
              }}
              onPress={() => handleSelect(i, j)}
            >
              <Text style={{ color: answers[i] === j ? "#fff" : "#000" }}>{opt.text}</Text>
            </TouchableOpacity>
          ))}

          {submitted && (
            <Text style={{ marginTop: 8, fontStyle: "italic", color: "#525258" }}>
              {q.explanation ? `Explanation: ${q.explanation}` : ""}
            </Text>
          )}
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Quiz</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center", marginVertical: 15 }}>
            Your score: {score}/{quiz.length}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FF6B6B" }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to Course</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: widthPercentageToDP("60%"),
    height: 45,
    alignSelf: "center",
    backgroundColor: "#2467EC",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
