import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import axios from "axios";
import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
export default function PurchaseHistoryScreen() {
  const { user } = useUser();
  const userId = user?._id;
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {

    try {
      const res = await axios.get(`${SERVER_URI}/user-orders/${userId}`);
      console.log("Calling:", `${SERVER_URI}/user-orders/${userId}`);
      setOrders(res.data.orders);
    } catch (err) {
      console.log("Error loading orders:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#666" }}>
          Bạn chưa mua khóa học nào.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử mua hàng</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Image
              source={{
                uri:
                  typeof item.courseId.thumbnail === "string"
                    ? item.courseId.thumbnail
                    : item.courseId.thumbnail?.url || "https://via.placeholder.com/70",
              }}
              style={styles.thumbnail}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.courseName}>{item.courseId.name}</Text>
              <Text style={styles.price}>Giá: ${item.courseId.price}</Text>
              <Text style={styles.date}>
                Ngày mua:{" "}
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    marginTop: 4,
    color: "#333",
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
