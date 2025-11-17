import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import {
  useFonts,
  Raleway_600SemiBold,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

interface CourseItemType {
  _id: string;
  name: string;
  ratings: number;
  purchased: number;
  price: number;
  estimatedPrice: number;
  thumbnail: { url: string };
  courseData: any[];
}

export default function CourseCard({ item }: { item: CourseItemType }) {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  const ratingValue = parseFloat(item?.ratings?.toFixed(1) || "0");
  const lessonCount = item.courseData.length;

  const scale = new Animated.Value(1);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() =>
          router.push({
            pathname: "/(routes)/course-details",
            params: { item: JSON.stringify(item) },
          })
        }
      >
        {/* IMAGE + GRADIENT OVERLAY */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.thumbnail.url }} style={styles.courseImage} />
          <View style={styles.overlay}>
            <View style={styles.ratingBadge}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{ratingValue}</Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.row}>
            <Text style={styles.studentsText}>{item.purchased} Students</Text>
            <View style={styles.lessonsContainer}>
              <MaterialCommunityIcons name="television-play" size={16} color="#A0AEC0" />
              <Text style={styles.lessonText}>{lessonCount} Lessons</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>${item.price}</Text>
            {item.estimatedPrice > item.price && (
              <Text style={styles.oldPrice}>${item.estimatedPrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  imageWrapper: {
    width: "100%",
    height: wp(48) * 0.75,
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#D97706",
    fontFamily: "Nunito_700Bold",
  },

  contentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  courseName: {
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    color: "#1F2937",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  studentsText: {
    fontSize: 12,
    color: "#718096",
    fontFamily: "Nunito_400Regular",
  },
  lessonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#718096",
    fontFamily: "Nunito_400Regular",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currentPrice: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    color: "#2563EB",
  },
  oldPrice: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "#A0AEC0",
    marginLeft: 6,
    textDecorationLine: "line-through",
  },
});
