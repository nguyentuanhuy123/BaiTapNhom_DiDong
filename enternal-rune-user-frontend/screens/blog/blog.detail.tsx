import { SERVER_URI } from "@/utils/uri";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const BlogDetail = () => {
  const { id } = useLocalSearchParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    console.log(id);
    fetch(`${SERVER_URI}/blogs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Đang tải chi tiết blog...</Text>
      </View>
    );
  }
  if (!blog) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Không tìm thấy blog!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Quay lại</Text>
      </TouchableOpacity>
      <Image source={{ uri: blog.coverImageUrl }} style={styles.image} />
      <Text style={styles.title}>{blog.title}</Text>
      <Text style={styles.content}>{blog.content}</Text>
      <View style={styles.authorBox}>
        <Text style={styles.authorLabel}>Tác giả:</Text>
        <Text style={styles.authorName}>
          {blog.authorInfo?.name || "Ẩn danh"}
        </Text>
        <Text style={styles.authorEmail}>{blog.authorInfo?.email}</Text>
      </View>
      <Text style={styles.date}>
        Ngày đăng: {new Date(blog.createdAt).toLocaleDateString()}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
    backgroundColor: '#e0e7ef',
    alignItems: 'center',
    minHeight: '100%',
  },
  loading: {
    marginTop: 60,
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  backBtn: {
    marginTop: 66,
    marginBottom: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  image: {
    width: '92%',
    height: 200,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#dbeafe',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  content: {
    fontSize: 17,
    color: '#334155',
    marginBottom: 22,
    textAlign: 'left',
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2,
    paddingHorizontal: 10,
  },
  authorBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#dbeafe',
    width: '90%',
    alignSelf: 'center',
  },
  authorLabel: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  authorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  authorEmail: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
    fontStyle: 'italic',
    alignSelf: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default BlogDetail;
