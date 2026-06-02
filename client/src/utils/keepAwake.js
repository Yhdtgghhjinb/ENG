// Keep backend server awake by pinging every 14 minutes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let intervalId = null;

export const startKeepAwake = () => {
  if (intervalId) return; // Already running

  // Ping immediately on start
  pingServer();

  // Then ping every 14 minutes (840000ms)
  intervalId = setInterval(pingServer, 14 * 60 * 1000);
  
  console.log('✅ Keep-awake service started - pinging every 14 minutes');
};

export const stopKeepAwake = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('⏹️ Keep-awake service stopped');
  }
};

const pingServer = async () => {
  try {
    const response = await fetch(`${API_URL}/api/vtu/branches`, {
      method: 'HEAD', // Use HEAD request (lighter than GET)
    });
    console.log(`🏓 Server pinged at ${new Date().toLocaleTimeString()} - Status: ${response.status}`);
  } catch (error) {
    console.log('❌ Server ping failed:', error.message);
  }
};
