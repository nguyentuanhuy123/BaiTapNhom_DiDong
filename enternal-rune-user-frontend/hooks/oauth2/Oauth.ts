import { makeRedirectUri } from "expo-auth-session";

export const Oauth = {
  clientId: "YOUR_CLIENT_ID", // Thay bằng clientId của bạn (hoặc lấy từ env / secrets)
  scopes: ["openid", "profile", "email"],
  // Nếu dev với Expo Go: useProxy: true, production để false
  redirectUri: makeRedirectUri({ scheme: "myapp", useProxy: false }),
  discovery: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  },
};