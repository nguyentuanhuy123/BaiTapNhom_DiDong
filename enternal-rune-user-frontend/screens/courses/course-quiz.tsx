import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { saveQuizResult } from "@/src/database/courseProgress"; // giả định path đúng
import useUser from "@/hooks/auth/useUser";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

// Kiểu dữ liệu
interface OptionType {
  text: string;
  isCorrect: boolean;
}

interface QuestionType {
  question: string;
  options: OptionType[];
  explanation?: string;
}

export default function CourseQuizScreen() {
  const { user } = useUser();
  const userName = user?.name || "Guest";
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;
  const contentId = params.contentId as string;

  // Parse quiz an toàn
  let quiz: QuestionType[] = [];
  try {
    quiz = JSON.parse(params.quizQuestions as string || '[]');
  } catch (e) {
    console.error("Failed to parse quizQuestions:", e);
  }

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.length) {
      Alert.alert("Hold on!", "Please answer all questions before submitting.");
      return;
    }

    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] !== undefined && q.options[answers[i]]?.isCorrect) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    try {
      await saveQuizResult({
        userId: user?._id || "guest",
        courseId,
        contentId,
        score: correct,
        total: quiz.length,
        answers,
      });
      console.log("✅ Quiz result saved successfully.");
    } catch (error) {
      console.error("❌ Failed to save quiz result:", error);
    }
  };

  const getOptionStyle = (qIndex: number, optIndex: number, isCorrect: boolean) => {
    const isSelected = answers[qIndex] === optIndex;

    if (!submitted) {
      return {
        backgroundColor: isSelected ? styles.selectedOption.backgroundColor : styles.defaultOption.backgroundColor,
        color: isSelected ? styles.selectedOptionText.color : styles.defaultOptionText.color,
      };
    }

    if (isCorrect) {
      return {
        backgroundColor: styles.correctOption.backgroundColor,
        color: styles.correctOptionText.color,
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? styles.correctOptionText.color : 'transparent',
      };
    } else if (isSelected && !isCorrect) {
      return {
        backgroundColor: styles.incorrectOption.backgroundColor,
        color: styles.incorrectOptionText.color,
      };
    }

    return {
      backgroundColor: styles.defaultOption.backgroundColor,
      color: styles.defaultOptionText.color,
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.screenBackground}>
      <Text style={styles.headerTitle}>Quiz</Text>

      {quiz.map((q, i) => {
        return (
          <View key={i} style={styles.questionCard}>
            <Text style={styles.questionText}>{i + 1}. {q.question}</Text>
            <View style={{ marginTop: 10 }}>
              {q.options.map((opt, j) => {
                const { backgroundColor, color, borderWidth, borderColor } = getOptionStyle(i, j, opt.isCorrect);
                const icon = submitted
                  ? opt.isCorrect
                    ? 'checkmark-circle'
                    : (answers[i] === j ? 'close-circle' : null)
                  : (answers[i] === j ? 'radio-button-on' : 'radio-button-off');

                return (
                  <TouchableOpacity
                    key={j}
                    disabled={submitted}
                    style={[styles.optionButton, { backgroundColor, borderWidth, borderColor }]}
                    onPress={() => handleSelect(i, j)}
                  >
                    {icon &&
                      <Ionicons name={icon as any} size={18} color={color} style={{ marginRight: 8 }} />
                    }
                    <Text style={[styles.optionText, { color }]}>{opt.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {submitted && q.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!submitted ? (
        <TouchableOpacity
          style={[styles.button, { opacity: Object.keys(answers).length < quiz.length ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={Object.keys(answers).length < quiz.length}
        >
          <Text style={styles.buttonText}>Submit Quiz</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultScoreText}>{userName}, your Score:</Text>
          <Text style={[styles.resultScoreValue, { color: score / quiz.length > 0.7 ? '#10B981' : '#F59E0B' }]}>
            {score} / {quiz.length}
          </Text>
          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenBackground: { backgroundColor: "#F9FAFB" },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: "800", marginBottom: 20, color: "#1F2937", textAlign: 'center' },

  questionCard: { marginBottom: 25, backgroundColor: "#fff", padding: 18, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  questionText: { fontSize: 17, fontWeight: "700", color: "#1F2937", lineHeight: 25 },

  optionButton: { marginTop: 10, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', minHeight: 45, paddingHorizontal: 15 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  defaultOption: { backgroundColor: "#EBF1FF" },
  defaultOptionText: { color: "#374151" },
  selectedOption: { backgroundColor: "#2563EB" },
  selectedOptionText: { color: "#fff" },
  correctOption: { backgroundColor: "#D1FAE5" },
  correctOptionText: { color: "#059669" },
  incorrectOption: { backgroundColor: "#FEE2E2" },
  incorrectOptionText: { color: "#DC2626" },

  explanationBox: { marginTop: 15, padding: 15, backgroundColor: "#F3F4F6", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#9CA3AF" },
  explanationTitle: { fontWeight: "700", fontSize: 14, color: "#374151", marginBottom: 4 },
  explanationText: { fontSize: 14, fontStyle: "italic", color: "#6B7280" },

  button: { width: wp("65%"), height: 50, alignSelf: "center", backgroundColor: "#2563EB", borderRadius: 25, alignItems: "center", justifyContent: "center", marginTop: 10, marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  resultContainer: { alignItems: 'center', paddingVertical: 20, marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 10 },
  resultScoreText: { fontSize: 20, fontWeight: "600", color: "#4B5563" },
  resultScoreValue: { fontSize: 36, fontWeight: "900", marginVertical: 10 },
  backButton: { backgroundColor: "#F59E0B", marginTop: 15 },
});
