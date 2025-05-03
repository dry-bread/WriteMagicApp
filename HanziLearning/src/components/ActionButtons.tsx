import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onTriggerHaptic: () => void;
  onClearCanvas: () => void;
}

/**
 * 操作按钮组件
 * 包含触感引导和重新书写按钮
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTriggerHaptic,
  onClearCanvas
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={styles.feedbackButton}
        onPress={onTriggerHaptic}
      >
        <Text style={styles.buttonText}>
          <Text style={{marginRight: 5}}>👆</Text>触感引导
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.clearButton}
        onPress={onClearCanvas}
      >
        <Text style={styles.buttonText}>
          <Text style={{marginRight: 5}}>🔄</Text>重新书写
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  feedbackButton: {
    flex: 0,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButton: {
    flex: 0,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ActionButtons; 