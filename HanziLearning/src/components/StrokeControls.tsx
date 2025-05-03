import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StrokeControlsProps {
  title: string;
  currentStrokeName: string;
  strokeDesc: string;
  onPrevious: () => void;
  onNext: () => void;
  onClear: () => void;
  onPlayGuide: () => void;
}

/**
 * 笔画控制组件
 * 包含标题、笔画指示和控制按钮
 */
const StrokeControls: React.FC<StrokeControlsProps> = ({
  title,
  currentStrokeName,
  strokeDesc,
  onPrevious,
  onNext,
  onClear,
  onPlayGuide
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.practiceHeader}>
        <Text style={styles.practiceTitle}>
          {title}
          <Text style={styles.currentStrokeText}>{currentStrokeName}</Text>
          <Text style={styles.strokeDesc}> ({strokeDesc})</Text>
        </Text>
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onPrevious}
          >
            <Text style={styles.controlButtonText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onPlayGuide}
          >
            <Text style={styles.controlButtonText}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onClear}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onNext}
          >
            <Text style={styles.controlButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  practiceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  currentStrokeText: {
    fontWeight: 'bold',
    color: '#e74c3c',
    fontSize: 18,
  },
  strokeDesc: {
    fontSize: 13,
    color: '#666',
  },
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 5,
    marginLeft: 2,
  },
  controlButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default StrokeControls; 