import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as Progress from "react-native-progress";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function CourseCard({ item }: { item: CoursesType & { progress?: number } }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/(routes)/course-details",
          params: { item: JSON.stringify(item) },
        })
      }
    >
      <View style={{ paddingHorizontal: 10 }}>
        <Image
          style={{
            width: wp(86),
            height: 220,
            borderRadius: 5,
            alignSelf: "center",
            objectFit: "cover",
          }}
          source={{ uri: item.thumbnail.url }}
        />
        <View style={{ width: wp(85) }}>
          <Text
            style={{
              fontSize: 14,
              textAlign: "left",
              marginTop: 10,
              fontFamily: "Raleway_600SemiBold",
            }}
          >
            {item.name}
          </Text>
        </View>

        {/* Rating + Students */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: 60,
            justifyContent: "center",
            backgroundColor: "#141517",
            padding: 4,
            borderRadius: 5,
            gap: 4,
            paddingHorizontal: 10,
            height: 28,
            marginTop: 10,
          }}
        >
          <FontAwesome name="star" size={14} color={"#ffb800"} />
          <Text style={[styles.ratingText]}>
            {(Number(item?.ratings)?.toFixed(1)) ?? "0.0"}
          </Text>

        </View>


        {/* Price + Lectures */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 5,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={{ paddingTop: 10, fontSize: 18, fontWeight: "600" }}>
              ${item?.price}
            </Text>
            <Text
              style={{
                paddingLeft: 5,
                textDecorationLine: "line-through",
                fontSize: 16,
                fontWeight: "400",
              }}
            >
              ${item?.estimatedPrice}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="list-outline" size={20} color={"#8A8A8A"} />
            <Text style={{ marginLeft: 5 }}>
              {item.courseData.length} Lectures
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {item.progress !== undefined && (
          <View style={{ marginTop: 10 }}>
            <Progress.Bar
              progress={item.progress / 100}
              color="#2467EC"
              width={wp(80)}
              height={10}
              borderRadius={10}
            />
            <Text style={{ fontSize: 13, marginTop: 4 }}>
              {item.progress}% completed
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    marginHorizontal: 6,
    borderRadius: 12,
    width: "95%",
    height: "auto",
    overflow: "hidden",
    margin: "auto",
    marginVertical: 15,
    padding: 8,
  },
  ratingText: {
    color: "white",
    fontSize: 14,
  },
});
