import { StyleSheet } from 'react-native';

/**
 * 应用通用样式
 */
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 22,
    color: 'white',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  voiceAssistButton: {
    position: 'absolute',
    right: 12,
  },
  voiceAssistIcon: {
    fontSize: 20,
    color: 'white',
  },
  mainContent: {
    flex: 1,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  footer: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
  },
});

export default commonStyles; 