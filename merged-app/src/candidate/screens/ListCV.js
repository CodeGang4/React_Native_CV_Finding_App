import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const API_BASE = Constants.expoConfig.extra.API;

export default function ListCV() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_BASE}/client/candidates/getProfile/${user.id}`);
      const profile = res.data;

      if (Array.isArray(profile?.cvs) && profile.cvs.length > 0) {
        setCvs(profile.cvs);
      } else if (profile?.cv_url) {
        setCvs([{ id: profile.id.toString(), name: "CV", url: profile.cv_url }]);
      } else {
        setCvs([]);
      }
    } catch (error) {
      console.error("Lỗi fetch CV:", error);
      Alert.alert("Lỗi", "Không thể lấy danh sách CV.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleEdit = async (cvId) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) return;

      const formData = new FormData();
      formData.append("cv", {
        uri: asset.uri,
        type: "image/png",
        name: `cv_${Date.now()}.png`,
      });

      const uploadRes = await axios.post(`${API_BASE}/client/candidates/uploadCV`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = uploadRes.data.url;

      await axios.put(`${API_BASE}/client/candidates/updateProfile/${user.id}`, {
        cv_url: newUrl,
      });

      Alert.alert("Thành công", "Cập nhật CV mới thành công!");
      fetchProfile();
    } catch (error) {
      console.error("Lỗi cập nhật CV:", error);
      Alert.alert("Lỗi", "Không thể cập nhật CV.");
    }
  };

  const handleDelete = async (cvId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa CV này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.put(`${API_BASE}/client/candidates/updateProfile/${user.id}`, {
              cv_url: null,
            });
            Alert.alert("Thành công", "Đã xóa CV");
            fetchProfile();
          } catch (error) {
            console.error("Lỗi xóa CV:", error);
            Alert.alert("Lỗi", "Không thể xóa CV.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text>Đang tải danh sách CV...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cvs.length === 0 ? (
        <Text>Chưa có CV nào</Text>
      ) : (
        <FlatList
          data={cvs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <TouchableOpacity
                style={styles.cvInfo}
                onPress={() => navigation.navigate("CV", { url: item.url })}
              >
                <Image
                  source={{ uri: item.url }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                <Text style={styles.itemText}>{item.name || `CV thứ ${index + 1}`}</Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item.id)}>
                  <MaterialIcons name="edit" size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => handleDelete(item.id)}
                >
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  cvInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  preview: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  itemText: { fontSize: 16, fontWeight: "500" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
