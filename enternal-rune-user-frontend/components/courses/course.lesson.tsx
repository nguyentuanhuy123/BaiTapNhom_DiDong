import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Entypo, Feather } from "@expo/vector-icons";

export default function CourseLesson({
  courseDetails,
}: {
  courseDetails: CoursesType;
}) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set<string>()
  );

  const videoSections: string[] = [
    ...new Set<string>(
      courseDetails.courseData.map((item: CourseDataType) => item.videoSection)
    ),
  ];

  const toggleSection = (section: string) => {
    const newVisibleSections = new Set(visibleSections);
    if (newVisibleSections.has(section)) {
      newVisibleSections.delete(section);
    } else {
      newVisibleSections.add(section);
    }
    setVisibleSections(newVisibleSections);
  };

  return (
    <View style={{ flex: 1, rowGap: 10, marginBottom: 10 }}>
      <View
        style={{
          padding: 10,
          borderWidth: 1,
          borderColor: "#E1E2E5",
          borderRadius: 8,
        }}
      >
        <View>
          {videoSections.map((section: string, sectionIndex: number) => {
            const isSectionVisible = visibleSections.has(section);

            const sectionVideos = courseDetails.courseData.filter(
              (i: any) => i.videoSection === section
            );

            return (
              <View key={section}>
                {/* Header Section */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    borderBottomColor: "#DCDCDC",
                    borderBottomWidth:
                      sectionIndex === videoSections.length - 1 ? 0 : 1,
                  }}
                >
                  <Text style={{ fontSize: 18, fontFamily: "Raleway_600SemiBold" }}>
                    {section}
                  </Text>

                  <TouchableOpacity onPress={() => toggleSection(section)}>
                    {isSectionVisible ? (
                      <Entypo name="chevron-up" size={23} color={"#6707FE"} />
                    ) : (
                      <Entypo name="chevron-down" size={23} color={"#6707FE"} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Videos Inside Section */}
                {isSectionVisible &&
                  sectionVideos.map((video: CourseDataType, videoIndex: number) => (
                    <View
                      key={video._id ?? videoIndex}
                      style={{
                        borderWidth: 1,
                        borderColor: "#E1E2E5",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <View style={styles.itemContainer}>
                        <View style={styles.itemContainerWrapper}>
                          <View style={styles.itemTitleWrapper}>
                            <Feather name="video" size={20} color={"#8a8a8a"} />
                            <Text
                              style={[
                                styles.itemTitleText,
                                { fontFamily: "Nunito_500Medium" },
                              ]}
                            >
                              {video.title}
                            </Text>
                          </View>

                          <View style={styles.itemDataContainer}>
                            <Text
                              style={{
                                marginRight: 6,
                                color: "#818181",
                                fontFamily: "Nunito_400Regular",
                              }}
                            >
                              {video.videoLength}{" "}
                              {video.videoLength > 60 ? "hour" : "minutes"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            );
          })}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E1E2E5",
    marginHorizontal: 10,
    paddingVertical: 12,
  },
  itemContainerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitleText: { marginLeft: 8, color: "#525258", fontSize: 16 },
  itemDataContainer: { flexDirection: "row", alignItems: "center" },
});
