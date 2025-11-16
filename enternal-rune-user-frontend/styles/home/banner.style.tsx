// src/styles/home/banner.style.ts (Phiên bản Tối ưu hóa)

import { StyleSheet, Dimensions } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Lấy chiều rộng màn hình để tính toán
// src/styles/home/banner.style.ts (Điều chỉnh cho Swiper)

// ... (imports giữ nguyên)

const { width } = Dimensions.get("window");
const PADDING_HORIZONTAL = 16;
// Swiper tự động căn giữa nếu không có margin/padding, SLIDE_WIDTH sẽ bằng chiều rộng màn hình.
// Tuy nhiên, vì bạn muốn padding 16px hai bên, chúng ta cần dùng cách sau:
const SLIDE_WIDTH = width; // Swiper sẽ chiếm toàn bộ chiều rộng

const BANNER_HEIGHT = hp("25%");

export const styles = StyleSheet.create({
  // ****************** CONTAINER & SWIPER ******************
  container: {
    marginTop: 12,
    height: BANNER_HEIGHT + 25, // Cao hơn banner để chứa dots và khoảng cách
    // Swiper không hỗ trợ paddingHorizontal trực tiếp trên View bao bọc nếu muốn slide chiếm 100%
  },

  // Swiper Container (Cần Wrapper để áp dụng padding)
  swiperWrapper: {
    // Swiper sẽ đặt margin/padding cho riêng nó, thường không cần style ở đây.
  },

  slide: {
    width: width - (PADDING_HORIZONTAL * 2), // Chiều rộng slide thực tế (đã trừ padding)
    height: BANNER_HEIGHT,
    marginHorizontal: PADDING_HORIZONTAL, // Đẩy slide vào giữa container
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    // Thêm shadow nhẹ cho card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // ****************** BACKGROUND IMAGE ******************
  background: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    zIndex: 1,
  },

  // ****************** DOTS ******************
  dot: {
    backgroundColor: '#C6C7CC',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#2467EC',
    width: 18,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  // Tùy chỉnh vị trí của dot
  paginationStyle: {
    bottom: 5,
    left: PADDING_HORIZONTAL,
    right: PADDING_HORIZONTAL,
  },

  // ****************** CONTENT OVERLAY (Lớp phủ nội dung) ******************
  backgroundView: {
    position: "absolute",
    zIndex: 5,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    // Thêm lớp phủ màu đen mờ nhẹ nếu cần, hoặc dùng màu nền cho backgroundView
    // backgroundColor: 'rgba(0,0,0,0.1)', 
  },

  backgroundViewContainer: {
    width: responsiveWidth(40), // Giảm nhẹ
    justifyContent: 'center',
    height: '100%',
  },

  backgroundViewText: {
    color: "white",
    fontSize: hp("2.4%"), // Giữ nguyên, hoặc 2.4%
    fontFamily: "Raleway_700Bold",
    lineHeight: hp("3%"),
  },

  backgroundViewOffer: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginTop: 5,
  },

  backgroundViewImage: {
    width: wp("35%"), // Giảm nhẹ
    height: wp("35%") * 0.9,
    resizeMode: 'contain',
  },

  backgroundViewButtonContainer: {
    borderWidth: 1.5,
    borderColor: "white",
    width: 130, // Rộng hơn
    height: 40, // Cao hơn
    borderRadius: 20, // Bo tròn nhiều hơn
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.1)' // Nền mờ cho nút
  },

  backgroundViewButtonText: {
    color: "#FFFF",
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
  },
});