// MainScreen.js (or create a separate file, e.g., backgroundTasks.js)
import * as TaskManager from 'expo-task-manager';
import * as NetInfo from '@react-native-community/netinfo'; // Install with: npx expo install @react-native-community/netinfo

// Define the background task name
const BACKGROUND_TASK_NAME = 'checkInternetStatus';

// Define the background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  // Check internet connection
  const netInfo = await NetInfo.fetch();
  const isConnected = netInfo.isConnected;
  const connectionType = netInfo.type;

  // Update AsyncStorage with the latest internet status
  await AsyncStorage.setItem('internetStatus', JSON.stringify({
    isConnected,
    connectionType: connectionType || 'unknown',
  }));

  console.log('Background task: Internet status updated - Connected:', isConnected, 'Type:', connectionType);
});