
import {
    View,
    Text,
    StyleSheet,
} from "react-native";


export default function ProfileScreen() {
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nâng cấp tài khoản</Text>
            <Text style={styles.description}>
                Để nâng cấp tài khoản, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
    },
});