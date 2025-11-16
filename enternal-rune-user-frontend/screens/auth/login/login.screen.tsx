import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Fontisto, Entypo, SimpleLineIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useFonts, Raleway_700Bold, Raleway_600SemiBold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";

export default function LoginScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [error, setError] = useState({ password: "" });

  let [fontsLoaded] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handlePasswordValidation = (value: string) => {
    const passwordSpecialCharacter = /(?=.*[!@#$&*])/;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{6,})/;

    if (!passwordSpecialCharacter.test(value)) {
      setError({ password: "Include at least one special character" });
    } else if (!passwordOneNumber.test(value)) {
      setError({ password: "Include at least one number" });
    } else if (!passwordSixValue.test(value)) {
      setError({ password: "At least 6 characters" });
    } else {
      setError({ password: "" });
      setUserInfo({ ...userInfo, password: value });
    }
  };

  const handleSignIn = async () => {
    setButtonSpinner(true);
    try {
      const res = await axios.post(`${SERVER_URI}/login`, {
        email: userInfo.email,
        password: userInfo.password,
      });

      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      setUserInfo({ email: "", password: "" });
      setButtonSpinner(false);
      router.push("/(tabs)");
    } catch (err: any) {
      setButtonSpinner(false);
      Toast.show(
        err.response?.data?.message || "Email or password is not correct!",
        { type: "danger" }
      );
    }
  };

  return (
    <LinearGradient colors={["#F6F7FF", "#E5ECF9"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingVertical: 50 }}>
        <Image
          style={styles.signInImage}
          source={require("@/assets/sign-in/sign_in.png")}
        />
        <Text style={[styles.welcomeText, { fontFamily: "Raleway_700Bold" }]}>
          Welcome Back!
        </Text>
        <Text style={styles.learningText}>
          Login to your Elearning account
        </Text>

        <View style={styles.inputContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Fontisto
              style={styles.iconLeft}
              name="email"
              size={20}
              color="#A1A1A1"
            />
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="example@gmail.com"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, email: value })
              }
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputWrapper, { marginTop: 15 }]}>
            <SimpleLineIcons
              style={styles.iconLeft}
              name="lock"
              size={20}
              color="#A1A1A1"
            />
            <TextInput
              style={styles.input}
              secureTextEntry={!isPasswordVisible}
              placeholder="********"
              onChangeText={handlePasswordValidation}
            />
            <TouchableOpacity
              style={styles.iconRight}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={23}
                color="#747474"
              />
            </TouchableOpacity>
          </View>
          {error.password && (
            <View style={styles.errorContainer}>
              <Entypo name="cross" size={16} color="red" />
              <Text style={styles.errorText}>{error.password}</Text>
            </View>
          )}

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push("/(routes)/forgot-password")}
          >
            <Text style={styles.forgotSection}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
            {buttonSpinner ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Redirect */}
          <View style={styles.signupRedirect}>
            <Text style={{ fontSize: 16, fontFamily: "Raleway_600SemiBold" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(routes)/sign-up")}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  signInImage: {
    width: "60%",
    height: 220,
    alignSelf: "center",
    marginBottom: 25,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: 26,
    color: "#333",
  },
  learningText: {
    textAlign: "center",
    color: "#666",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 30,
  },
  inputContainer: {
    marginHorizontal: 20,
    rowGap: 20,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 55,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    paddingLeft: 45,
    paddingRight: 45,
    color: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  iconLeft: {
    position: "absolute",
    left: 15,
    zIndex: 10,
  },
  iconRight: {
    position: "absolute",
    right: 15,
    zIndex: 10,
  },
  forgotSection: {
    marginTop: 10,
    textAlign: "right",
    fontSize: 15,
    color: "#2467EC",
  },
  signInBtn: {
    marginTop: 20,
    marginHorizontal: 0,
    borderRadius: 12,
    paddingVertical: 15,
    backgroundColor: "#2467EC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2467EC",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway_700Bold",
  },
  signupRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    marginBottom: 30,
  },
  signUpText: {
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    color: "#2467EC",
    marginLeft: 5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginLeft: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 5,
  },
});
