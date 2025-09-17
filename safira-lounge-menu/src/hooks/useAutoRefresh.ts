import { useEffect, useRef, useCallback } from 'react';

interface AutoRefreshEvent {
  type: string;
  data: any;
  message?: string;
}

interface UseAutoRefreshProps {
  onUpdate?: (event: AutoRefreshEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enabled?: boolean;
}

export const useAutoRefresh = ({
  onUpdate,
  onConnect,
  onDisconnect,
  enabled = true
}: UseAutoRefreshProps = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!enabled) return;
    
    try {
      const eventSource = new EventSource('/api/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔄 Auto-refresh verbunden');
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 Auto-refresh Event erhalten:', data);
          
          if (data.type === 'connected') {
            console.log('✅ Auto-refresh Verbindung bestätigt');
            return;
          }
          
          onUpdate?.(data);
        } catch (error) {
          console.error('Fehler beim Parsen des Auto-refresh Events:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Auto-refresh Verbindungsfehler:', error);
        eventSource.close();
        
        onDisconnect?.();
        
        // Automatic reconnection after 5 seconds, but only if enabled
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Versuche Auto-refresh Wiederverbindung...');
            connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Fehler beim Starten des Auto-refresh:', error);
    }
  }, [enabled, onUpdate, onConnect, onDisconnect]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect]);

  return {
    connect,
    disconnect,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN
  };
};