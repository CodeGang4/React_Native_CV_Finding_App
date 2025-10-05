import React from "react";
import ImageViewer from "react-native-image-zoom-viewer";
import { useRoute } from "@react-navigation/native";
import { View } from "react-native";

export default function CV() {
  const route = useRoute();
  const { url } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageViewer
        imageUrls={[{ url }]}
        enableSwipeDown={true}
      />
    </View>
  );
}
