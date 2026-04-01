import { Network, NetworkStatus } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

/**
 * Network utility for mobile apps
 * Monitors network connection status
 */

let networkListenerHandle: { remove: () => void } | null = null;

/**
 * Get current network status
 */
export const getNetworkStatus = async (): Promise<NetworkStatus | null> => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to navigator connection API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        connected: connection.type !== 'none',
        connectionType: connection.effectiveType || 'unknown',
      };
    }
    return null;
  }

  try {
    const status = await Network.getStatus();
    console.log('Network status:', status);
    return status;
  } catch (error) {
    console.error('Failed to get network status:', error);
    return null;
  }
};

/**
 * Check if device is connected to internet
 */
export const isOnline = async (): Promise<boolean> => {
  const status = await getNetworkStatus();
  return status?.connected ?? navigator.onLine;
};

/**
 * Check if device is offline
 */
export const isOffline = async (): Promise<boolean> => {
  const online = await isOnline();
  return !online;
};

/**
 * Get connection type (wifi, cellular, etc.)
 */
export const getConnectionType = async (): Promise<string | null> => {
  const status = await getNetworkStatus();
  return status?.connectionType || null;
};

/**
 * Add network status change listener
 */
export const addNetworkListener = (
  callback: (status: NetworkStatus) => void
) => {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to browser online/offline events
    const handleOnline = () => {
      callback({
        connected: true,
        connectionType: 'unknown',
      });
    };

    const handleOffline = () => {
      callback({
        connected: false,
        connectionType: 'none',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  try {
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      callback(status);
    }).then((handle) => {
      networkListenerHandle = handle;
    });

    // Return cleanup function
    return () => {
      if (networkListenerHandle) {
        networkListenerHandle.remove();
        networkListenerHandle = null;
      }
    };
  } catch (error) {
    console.error('Failed to add network listener:', error);
    return () => {};
  }
};

/**
 * Monitor network with initial check and listener
 */
export const monitorNetwork = (
  onOnline: () => void,
  onOffline: () => void
) => {
  // Initial check
  isOnline().then((online) => {
    if (online) {
      onOnline();
    } else {
      onOffline();
    }
  });

  // Add listener for changes
  const cleanup = addNetworkListener((status) => {
    if (status.connected) {
      onOnline();
    } else {
      onOffline();
    }
  });

  return cleanup;
};

/**
 * Wait for network connection
 */
export const waitForConnection = async (timeout: number = 30000): Promise<boolean> => {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkConnection = async () => {
      const online = await isOnline();
      if (online) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }

      // Check again after 1 second
      setTimeout(checkConnection, 1000);
    };

    checkConnection();
  });
};

/**
 * Log network status for debugging
 */
export const logNetworkStatus = async () => {
  const status = await getNetworkStatus();
  console.table({
    connected: status?.connected ?? 'unknown',
    connectionType: status?.connectionType ?? 'unknown',
  });
};
