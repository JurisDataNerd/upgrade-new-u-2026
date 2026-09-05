import { ref, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuth } from "./useAuth";

export interface RealtimeFeedEvent {
  id: string;
  event: string;
  topic?: string;
  type?: string;
  title?: string;
  description?: string;
  data?: any;
  floorNumber?: number;
  teamName?: string;
  teamCode?: string;
  timestamp: string;
}

type EventCallback = (event: string, data: any) => void;

const isConnected = ref(false);
const feedEvents = ref<RealtimeFeedEvent[]>([]);
const eventListeners = new Set<EventCallback>();

let socket: WebSocket | null = null;
let reconnectTimer: any = null;
let keepAliveTimer: any = null;

export function useRealtime() {
  const config = useRuntimeConfig();
  const auth = useAuth();

  const getWsUrl = () => {
    const apiBase = config.public?.apiBase || "http://localhost:3001/api";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api$/, "/ws");
    const token = auth.token?.value;
    return token ? `${wsBase}?token=${encodeURIComponent(token)}` : wsBase;
  };

  const connect = () => {
    if (typeof window === "undefined") return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = getWsUrl();
      socket = new WebSocket(url);

      socket.onopen = () => {
        isConnected.value = true;
        // Subscribe to standard admin topics
        const topics = ["admin:feed", "leaderboard:global", "announcements:global"];
        topics.forEach((topic) => {
          socket?.send(JSON.stringify({ action: "SUBSCRIBE", topic }));
        });

        // Keepalive ping every 30 seconds
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        keepAliveTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "PING" }));
          }
        }, 30000);
      };

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === "PONG") return;

          const eventItem: RealtimeFeedEvent = {
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            event: msg.event || "MESSAGE",
            topic: msg.topic,
            type: msg.data?.type || msg.event,
            title: msg.data?.title || msg.event,
            description: msg.data?.message || msg.data?.description || JSON.stringify(msg.data || {}),
            data: msg.data,
            teamName: msg.data?.teamName,
            teamCode: msg.data?.teamCode,
            floorNumber: msg.data?.floorNumber,
            timestamp: msg.timestamp || new Date().toISOString(),
          };

          feedEvents.value.unshift(eventItem);
          if (feedEvents.value.length > 50) {
            feedEvents.value.pop();
          }

          // Notify all registered listeners
          eventListeners.forEach((callback) => {
            try {
              callback(msg.event, msg.data);
            } catch (err) {
              console.error("[useRealtime] Callback error:", err);
            }
          });
        } catch (err) {
          console.warn("[useRealtime] Failed to parse message:", err);
        }
      };

      socket.onclose = () => {
        isConnected.value = false;
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        // Attempt reconnect after 5 seconds
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 5000);
        }
      };

      socket.onerror = () => {
        isConnected.value = false;
      };
    } catch (err) {
      console.warn("[useRealtime] WebSocket connection failed:", err);
    }
  };

  const onEvent = (callback: EventCallback) => {
    eventListeners.add(callback);
    return () => {
      eventListeners.delete(callback);
    };
  };

  const subscribeTopic = (topic: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "SUBSCRIBE", topic }));
    }
  };

  const onLeaderboardUpdate = (callback: (data: any) => void) => {
    return onEvent((event, data) => {
      if (event === "LEADERBOARD_UPDATE" || event === "SCORE_SUBMITTED" || event === "SCORE_CORRECTION") {
        callback(data);
      }
    });
  };

  onMounted(() => {
    connect();
  });

  return {
    isConnected,
    feedEvents,
    onEvent,
    onLeaderboardUpdate,
    subscribeTopic,
    connect,
  };
}
