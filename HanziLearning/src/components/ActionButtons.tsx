import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ActionButtonsProps {
  onClearCanvas: () => void;
}

/**
 * 操作按钮组件
 * 包含重新书写按钮
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClearCanvas,
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClearCanvas}
      >
        <Text style={styles.buttonText}>
          <Text style={styles.iconText}>🔄</Text>重新书写
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
  clearButton: {
    flex: 0,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconText: {
    marginRight: 5,
  },
});

export default ActionButtons;
