import Ratings from "@/utils/ratings";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, Image } from "react-native";

export default function ReviewCard({ item }: { item: ReviewType }) {
  const userName =
  item.user && typeof item.user === "object"
    ? item.user.username || item.user.name || "Guest"
    : item.user || "Guest";

  const userAvatar =
  item.user && typeof item.user === "object" && item.user.avatar?.url
    ? item.user.avatar.url
    : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png";


  // Làm tròn rating 1 chữ số thập phân
  const roundedRating = Math.round((item.rating ?? 0) * 10) / 10;

  return (
    <View style={{ flexDirection: "row", marginVertical: 10 }}>
      <Image
        style={{ width: 50, height: 50, borderRadius: 100 }}
        source={{ uri: userAvatar }}
      />
      <View style={{ marginHorizontal: 8, flex: 1 }}>
        <Text style={{ fontSize: 18, fontFamily: "Raleway_700Bold" }}>
          {userName}
        </Text>
        <Ratings rating={roundedRating} />
        <Text
          style={{
            fontSize: 16,
            paddingVertical: 5,
            paddingHorizontal: 3,
            color: "#333",
          }}
        >
          {item.comment}
        </Text>
      </View>
    </View>
  );
}
