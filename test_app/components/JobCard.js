import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, PanResponder, Alert } from 'react-native';

export default function JobCard({ job, onPress, onDelete, onSwipe, isOpen }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const cardHeight = useRef(new Animated.Value(1)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;

    // Effect để tự động đóng card khi isOpen thay đổi
    useEffect(() => {
        if (!isOpen) {
            // Đóng card mà không trigger onSwipe callback để tránh infinite loop
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    }, [isOpen]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Chỉ bắt đầu pan khi vuốt ngang đủ xa và không phải vuốt dọc
                return Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderGrant: () => {
                // Set lại value hiện tại để tránh jump
                translateX.setOffset(translateX._value);
                translateX.setValue(0);
            },
            onPanResponderMove: (evt, gestureState) => {
                // Chỉ cho phép vuốt sang trái (dx âm) và giới hạn tối đa
                const newValue = Math.min(0, Math.max(-120, gestureState.dx));
                translateX.setValue(newValue);
            },
            onPanResponderRelease: (evt, gestureState) => {
                // Flatten offset để tránh lỗi animation
                translateX.flattenOffset();
                
                if (gestureState.dx < -60) {
                    // Vuốt đủ xa -> hiện delete button
                    Animated.spring(translateX, {
                        toValue: -100,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                    // Notify parent component
                    if (onSwipe) {
                        onSwipe(job.id, true);
                    }
                } else {
                    // Vuốt chưa đủ xa -> reset về vị trí ban đầu
                    resetPosition();
                }
            },
            onPanResponderTerminate: () => {
                // Reset nếu gesture bị hủy
                translateX.flattenOffset();
                resetPosition();
            },
        })
    ).current;

    const handleDelete = () => {
        Alert.alert(
            'Xóa công việc',
            `Bạn có chắc muốn xóa "${job.title}"?`,
            [
                { text: 'Hủy', style: 'cancel', onPress: resetPosition },
                { 
                    text: 'Xóa', 
                    style: 'destructive',
                    onPress: () => {
                        // Animation ẩn card trước khi xóa
                        Animated.parallel([
                            Animated.timing(cardHeight, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: false,
                            }),
                            Animated.timing(cardOpacity, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            })
                        ]).start(() => {
                            if (onDelete) {
                                onDelete(job.id);
                            }
                        });
                    }
                }
            ]
        );
    };

    const resetPosition = () => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start(() => {
            // Notify parent component khi card đóng
            if (onSwipe) {
                onSwipe(job.id, false);
            }
        });
    };

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    transform: [{ scaleY: cardHeight }],
                    opacity: cardOpacity,
                }
            ]}
        >
            {/* Delete Button (hidden behind) */}
            <View style={styles.deleteContainer}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
            </View>

            {/* Main Card */}
            <Animated.View
                style={[
                    styles.cardWrapper,
                    {
                        transform: [{ translateX }],
                    }
                ]}
            >
                <View {...panResponder.panHandlers} style={styles.panHandlerWrapper}>
                    <TouchableOpacity 
                        style={styles.card} 
                        onPress={onPress} 
                        activeOpacity={0.8}
                        delayPressIn={100}
                    >
                        <View style={styles.leftContent}>
                            <Text style={styles.title}>{job.title}</Text>
                            <Text style={styles.location}>{job.location}</Text>
                            <Text style={styles.jobType}>{job.job_type}</Text>
                            <Text style={styles.views}>{job.views || 0} views</Text>
                        </View>
                        <View style={styles.rightContent}>
                            <Text style={styles.salary}>{job.salary}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardWrapper: {
        width: '100%',
    },
    panHandlerWrapper: {
        flex: 1,
    },
    card: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    deleteContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f44336',
        borderRadius: 8,
    },
    deleteButton: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    rightContent: {
        alignItems: 'flex-end',
    },
    title: { 
        fontSize: 16, 
        fontWeight: '600',
        marginBottom: 4,
        color: '#333'
    },
    location: { 
        fontSize: 13, 
        color: '#666', 
        marginBottom: 2 
    },
    jobType: { 
        fontSize: 12, 
        color: '#888', 
        marginBottom: 2,
        textTransform: 'capitalize'
    },
    views: { 
        fontSize: 11, 
        color: '#999' 
    },
    salary: { 
        fontSize: 14, 
        color: '#1a73e8', 
        fontWeight: '600' 
    },
});
