import { SERVER_URI } from "@/utils/uri";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

// Giả định kiểu dữ liệu
interface CommentType {
  _id: string;
  question: string;
  user: {
    name: string;
    avatar?: { url: string };
  };
  questionReplies: ReplyType[];
}

interface ReplyType {
  _id: string;
  answer: string;
  user: {
    name: string;
    avatar?: { url: string };
  };
}

interface CoursesType {
  _id: string;
}

// Giả định font đã được load ở cấp độ cao hơn (để tránh lặp lại useFonts)

export default function QuestionsCard({
  item,
  fetchCourseContent,
  courseData,
  contentId,
}: {
  item: CommentType;
  fetchCourseContent: () => void;
  courseData: CoursesType;
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [showReplies, setshowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (reply.trim() === "") return;
    setIsSubmitting(true);
    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      await axios.put(
        `${SERVER_URI}/add-answer`,
        {
          answer: reply,
          courseId: courseData?._id,
          contentId: contentId,
          questionId: item?._id,
        },
        {
          headers: {
            "access-token": accessToken,
            "refresh-token": refreshToken,
          },
        }
      );
      setReply("");
      setOpen(false);
      fetchCourseContent();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HÀM RENDER RIÊNG CHO MỘT BÌNH LUẬN/TRẢ LỜI ---
  const renderComment = (
    comment: CommentType | ReplyType,
    isReply: boolean = false
  ) => {
    const containerStyle = isReply ? styles.replyContainer : styles.commentContainer;
    const textContent = (comment as CommentType).question || (comment as ReplyType).answer;

    return (
      <View style={containerStyle}>
        <Image
          style={styles.avatar}
          source={{
            uri:
              comment.user?.avatar?.url ||
              "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
          }}
        />
        <View style={styles.commentContent}>
          <Text style={styles.userName}>
            {comment.user.name}
            {isReply && <Text style={styles.replyBadge}> (Reply)</Text>}
          </Text>
          <Text style={styles.commentText}>
            {textContent}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainCard}>
      {/* 1. CÂU HỎI CHÍNH */}
      {renderComment(item)}

      {/* 2. NÚT HIỂN THỊ/ẨN TRẢ LỜI & THÊM TRẢ LỜI */}
      <View style={styles.actionsRow}>
        {item?.questionReplies.length > 0 ? (
          <TouchableOpacity onPress={() => setshowReplies(!showReplies)}>
            <Text style={styles.actionText}>
              {showReplies ? "Hide" : "Show"} {item?.questionReplies.length}{" "}
              {item?.questionReplies.length > 1 ? "Replies" : "Reply"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noReplyText}>No replies yet.</Text>
        )}

        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={{ marginLeft: item?.questionReplies.length > 0 ? 20 : 0 }}
        >
          <Text style={styles.actionText}>Add Reply</Text>
        </TouchableOpacity>
      </View>

      {/* 3. HIỂN THỊ TRẢ LỜI */}
      {showReplies && (
        <View style={styles.repliesSection}>
          {item?.questionReplies?.map((reply: ReplyType, index: number) => (
            <View key={index} style={styles.replyWrapper}>
              {renderComment(reply, true)}
            </View>
          ))}
        </View>
      )}

      {/* 4. MODAL TRẢ LỜI */}
      <Modal animationType="fade" transparent={true} visible={open}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to {item.user.name}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close-outline" size={28} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder="Type your reply here..."
              placeholderTextColor="#9CA3AF"
              style={styles.replyInput}
              multiline={true}
            />

            <TouchableOpacity
              style={[styles.submitButton, reply.trim() === "" && styles.disabledButton]}
              disabled={reply.trim() === "" || isSubmitting}
              onPress={handleReplySubmit}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // Màu xám nhẹ cho đường kẻ
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },

  // --- COMMENT STRUCTURE ---
  commentContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  replyContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // --- TYPOGRAPHY ---
  userName: {
    fontSize: 16,
    fontFamily: "Raleway_700Bold",
    color: "#1F2937",
  },
  commentText: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 22,
  },
  replyBadge: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: "#6B7280",
    marginLeft: 5,
  },

  // --- ACTIONS ---
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 55, // Căn chỉnh dưới avatar
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: "#2563EB", // Màu xanh dương nổi bật
  },
  noReplyText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#9CA3AF",
    marginRight: 20,
  },

  // --- REPLIES SECTION ---
  repliesSection: {
    paddingLeft: 30, // Thụt vào một chút để phân biệt
    borderLeftWidth: 2,
    borderLeftColor: "#F3F4F6", // Đường kẻ dọc mờ
    marginVertical: 5,
    marginLeft: 45, // Căn chỉnh dưới avatar
  },
  replyWrapper: {
    paddingLeft: 10, // Thụt đầu dòng trả lời
  },

  // --- MODAL STYLES ---
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền tối mờ
  },
  modalContent: {
    width: wp("90%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Raleway_700Bold",
    color: "#1F2937",
  },
  replyInput: {
    minHeight: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    marginBottom: 15,

  },
  submitButton: {
    width: wp("35%"),
    height: 45,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});