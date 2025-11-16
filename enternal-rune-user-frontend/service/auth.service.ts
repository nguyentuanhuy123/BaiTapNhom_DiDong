import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { SERVER_URI } from "@/utils/uri"; // ví dụ: http://192.168.1.10:5000/api/v1

export const emailLogin = async (email: string, password: string) => {
  const res = await axios.post(`${SERVER_URI}/auth/login`, { email, password });
  return res.data; // { token, refreshToken, user }
};

export const googleLogin = async (code: string, code_verifier?: string) => {
  const res = await axios.post(`${SERVER_URI}/auth/google/mobile/callback`, { code, code_verifier });
  return res.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await axios.post(`${SERVER_URI}/auth/refresh`, { refreshToken });
  return res.data.token;
};

// --- Secure Storage ---
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

export const getTokens = async () => {
  const accessToken = await SecureStore.getItemAsync("accessToken");
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  return { accessToken, refreshToken };
};

export const removeTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
};
