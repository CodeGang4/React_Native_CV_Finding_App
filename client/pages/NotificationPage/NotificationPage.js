import { View, Text, StyleSheet } from "react-native";
import { TAB_BAR_PADDING } from "../../constants/layout";

const NotificationPage = () => {
  return (
    <View style={[styles.container, TAB_BAR_PADDING]}>
      <Text style={styles.text}>NotificationPage</Text>
    </View>
  );
};

export default NotificationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
