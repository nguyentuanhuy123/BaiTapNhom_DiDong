import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const fetchUserFromStorage = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          setUser(JSON.parse(userStr));
        } else {
          setError("No user found in storage");
        }
      } catch (err: any) {
        setError(err?.message || "Error reading user from storage");
      } finally {
        setLoading(false);
      }
    };

    fetchUserFromStorage();
  }, [refetch]);

  return { loading, user, error, setRefetch, refetch,setUser };
}
