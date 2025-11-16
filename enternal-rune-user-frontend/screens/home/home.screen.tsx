import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context"; // SỬ DỤNG SAFEAREAVIEW
import Header from "@/components/header/header";
import SearchInput from "@/components/common/search.input";
import HomeBannerSlider from "@/components/home/home.banner.slider";
import AllCourses from "@/components/courses/all.courses";

export default function HomeScreen() {
  return (
    // 1. CONTAINER CHÍNH VỚI GRADIENT TỐI ƯU
    <LinearGradient
      // Sử dụng dải màu nhẹ nhàng, hơi xanh xám để tạo cảm giác "sạch" và cao cấp
      colors={["#E6F0FF", "#F0F5F9"]} 
      style={styles.fullScreenGradient}
    >
      {/* 2. SAFEAREAVIEW ĐẢM BẢO NỘI DUNG KHÔNG BỊ CHE KHUẤT */}
      <SafeAreaView style={styles.safeAreaContainer}>
        
        {/* HEADER VÀ SEARCH INPUT: GIỮ NGUYÊN Ở TOP */}
        <View style={styles.topSection}>
            <Header />
            <View style={styles.searchInputMargin}>
              <SearchInput homeScreen={true} />
            </View>
        </View>

        {/* 3. SCROLLVIEW CHỨA NỘI DUNG CÒN LẠI */}
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent} 
        >
          <View style={styles.bannerMargin}>
            <HomeBannerSlider />
          </View>
          <AllCourses />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// 4. STYLES ĐƯỢC TỐI ƯU
export const styles = StyleSheet.create({
  fullScreenGradient: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
    // Xóa paddingTop cố định vì đã dùng SafeAreaView
  },
  topSection: {
    paddingHorizontal: 16, // Padding cho Header và Search Input
  },
  searchInputMargin: {
    marginBottom: 20, // Khoảng cách lớn hơn giữa Search Input và ScrollView
  },
  scrollContent: {
    paddingTop: 0, 
    paddingBottom: 80, 
  },
  bannerMargin: {
    marginBottom: 20, // Khoảng cách giữa Banner và danh sách Khóa học
  }
});