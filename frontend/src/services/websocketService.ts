import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 5000,
    debug: (str) => {
    },
});

let subscription: StompSubscription | null = null;

export const connectWebSocket = (chatId: string, onMessageReceived: (message: any) => void) => {
    stompClient.onConnect = () => {

        if (subscription) {
            subscription.unsubscribe();
            subscription = null;
        }

        subscription = stompClient.subscribe(`/topic/chat/${chatId}`, (msg) => {
            try {
                const parsed = JSON.parse(msg.body);
                onMessageReceived(parsed);
            } catch (e) {
                console.error("Failed to parse message body as JSON", e);
            }
        });
    };

    stompClient.onWebSocketError = (error) => {
        console.error("WebSocket error", error);
    };

    stompClient.onStompError = (frame) => {
        console.error("STOMP protocol error:", frame.headers["message"]);
    };


    if (!stompClient.active && !stompClient.connected) {
        stompClient.activate();
    }
};
export const disconnectWebSocket = () => {
    if (subscription) {
        subscription.unsubscribe();
        subscription = null;
    }
    stompClient.deactivate();
};
