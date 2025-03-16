import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Alert, Modal, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"];
const { width } = Dimensions.get("window"); // Get screen width

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const getDifferentColor = (excludeColor) => {
    let newColor;
    do {
        newColor = getRandomColor();
    } while (newColor === excludeColor);
    return newColor;
};

export default function App() {
    const [grid, setGrid] = useState([]);
    const [targetColor, setTargetColor] = useState("");
    const [displayColor, setDisplayColor] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [bestScore, setBestScore] = useState(0);
    const [hardMode, setHardMode] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const { isDarkMode } = useContext(ThemeContext);
    const router = useRouter();

    const numColumns = score >= 65 ? 4 : 3;
    const tileSize = (width - 80) / numColumns - 10;

    useEffect(() => {
        if (isGameRunning) {
            generateGrid();
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isGameRunning]);

    useEffect(() => {
        if (timeLeft === 0) {
            saveBestScore();
            Alert.alert("Game Over", `Your final score: ${score}`, [{ text: "Restart", onPress: restartGame }]);
        }
    }, [timeLeft]);

    useEffect(() => {
        loadBestScore();
    }, []);

    useEffect(() => {
        if (score === 30 || score === 45 || score === 65) {
            setShowLevelUp(true);
            setIsGameRunning(false);
        }
    }, [score]);

    useEffect(() => {
        if (score >= 30) {
            setHardMode(true);
        }
    }, [score]);

    useEffect(() => {
        if (score >= 45) {
            const colorInterval = setInterval(() => {
                setDisplayColor(getDifferentColor(targetColor));
            }, 1000);
            return () => clearInterval(colorInterval);
        }
    }, [score, targetColor]);

    const generateGrid = () => {
        const gridSize = score >= 65 ? 16 : 12; // Level 4 has 16 tiles (4x4 grid)
        const newGrid = Array.from({ length: gridSize }, getRandomColor);
        setGrid(newGrid);
        const newTarget = newGrid[Math.floor(Math.random() * newGrid.length)];
        setTargetColor(newTarget);
        setDisplayColor(hardMode ? getDifferentColor(newTarget) : newTarget);
    };

    const handleTilePress = (color, index) => {
        if (!isGameRunning) return;

        if (color === targetColor) {
            setScore(score + 1);

            let timeBonus = score >= 30 && score < 45 ? 2 : 1;
            setTimeLeft((prev) => prev + timeBonus);

            let newGrid = [...grid];

            if (score >= 45) {
                const gridSize = score >= 65 ? 16 : 12; // Level 4 has 16 tiles
                newGrid = Array.from({ length: gridSize }, getRandomColor);
            } else {
                newGrid[index] = getRandomColor();
            }

            setGrid(newGrid);
            const newTarget = newGrid[Math.floor(Math.random() * newGrid.length)];
            setTargetColor(newTarget);
            setDisplayColor(hardMode ? getDifferentColor(newTarget) : newTarget);
        }
    };

    const saveBestScore = async () => {
        try {
            const savedBestScore = await AsyncStorage.getItem('bestScore');
            const bestScoreValue = savedBestScore ? parseInt(savedBestScore) : 0;
            if (score > bestScoreValue) {
                await AsyncStorage.setItem('bestScore', score.toString());
                setBestScore(score);
            }
        } catch (error) {
            console.error('Failed to save the best score', error);
        }
    };

    const loadBestScore = async () => {
        try {
            const savedBestScore = await AsyncStorage.getItem('bestScore');
            if (savedBestScore !== null) {
                setBestScore(parseInt(savedBestScore));
            }
        } catch (error) {
            console.error('Failed to load the best score', error);
        }
    };

    const restartGame = () => {
        setScore(0);
        setTimeLeft(10);
        setHardMode(false);
        setIsGameRunning(true);
        generateGrid();
    };

    const toggleGame = () => {
        setIsGameRunning(!isGameRunning);
    };

    const getLevel = () => {
        if (score >= 65) return "Level 4";
        if (score >= 45) return "Level 3";
        if (score >= 30) return "Level 2";
        return "Level 1";
    };

    const goBack = () => {
        router.push('meetPage');
    };

    const handleContinue = () => {
        setShowLevelUp(false);
        setIsGameRunning(true);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
                <Text style={[styles.title, { color: isDarkMode ? "#FFD700" : "#000" }]}>Color Hunt</Text>
                <Text style={[styles.levelText, { color: isDarkMode ? "#00FF00" : "#000" }]}>{getLevel()}</Text>
                <Text style={[styles.score, { color: isDarkMode ? "#FFF" : "#000" }]}>Score: {score} | Time Left: {timeLeft}s</Text>
                <Text style={[styles.targetText, { color: displayColor }]}>
                    Tap all: <Text style={{ fontWeight: "bold" }}>{targetColor}</Text>
                </Text>
                <FlatList
                    key={numColumns}
                    data={grid}
                    numColumns={numColumns}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[styles.tile, { backgroundColor: item, width: tileSize, height: tileSize }]}
                            onPress={() => handleTilePress(item, index)}
                        />
                    )}
                />

                <Text style={[styles.bestScore, { color: isDarkMode ? "#FFF" : "#000" }]}>Best Score: {bestScore}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
                    <Text style={styles.buttonText}>Restart Game</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={toggleGame}>
                    <Text style={styles.buttonText}>{isGameRunning ? "Pause Game" : "Continue Game"}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showLevelUp}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Congratulations! You've passed to the {getLevel()}!</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleContinue}>
                            <Text style={styles.buttonText}>Continue to Next Level</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 10,
    },
    levelText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#00FF00",
        marginBottom: 10,
    },
    targetText: {
        fontSize: 20,
        marginBottom: 10,
        backgroundColor: "rgba(83, 83, 83, 0.25)",
        padding: 10,
        borderRadius: 10,
    },
    score: {
        fontSize: 18,
        color: "#FFF",
        marginBottom: 10,
    },
    tile: {
        margin: 5,
        borderRadius: 10,
    },
    bestScore: {
        fontSize: 18,
        color: "#FFF",
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    restartButton: {
        backgroundColor: "#FF4500",
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
    },
    continueButton: {
        backgroundColor: "#32CD32",
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(192, 192, 192, 0.25)',
        width: 40,
        height: 40,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: "#32CD32",
        padding: 15,
        borderRadius: 10,
        width: '100%',
    },
});