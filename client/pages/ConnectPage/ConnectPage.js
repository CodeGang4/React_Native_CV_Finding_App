import { View, Text, StyleSheet } from "react-native";

const ConnectPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ConnectPage</Text>
    </View>
  );
};

export default ConnectPage;

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
