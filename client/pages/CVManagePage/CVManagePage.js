import { View, Text, StyleSheet } from "react-native";

const CVManagePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CVManagePage</Text>
    </View>
  );
};

export default CVManagePage;

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
