import { FaGamepad } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import DisconnectButton from "./DisconnectButton";
import ChatPagination from "./ChatPagination";
import { stompClient, connectWebSocket, disconnectWebSocket } from "../../services/websocketService";

type ChatProps = {
  chatId: string;
  friendId?: string;
  userId?: string; 
  friendName?: string;
  onDisconnect?: (friendId: string) => void;
};

export default function Chat({chatId, friendId, userId, friendName, onDisconnect }: ChatProps) {
    console.log("Chat component mounted with chatId:", chatId);
    
    type Message = {
        id: string; 
        chatId: string;
        content: string;
        senderId: string;
        senderName?: string; 
        dateTime: string;
        read: boolean; 
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const readMessages = useRef<Set<string>>(new Set());

    // Update fetchMessages to use pagination
    const fetchMessages = async (page = 0) => {
        try {
            const res = await fetch(`http://localhost:8080/api/chats/${chatId}/messages?page=${page}&size=${pageSize}`);
            const data = await res.json();
            setMessages(data.content || data); 
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!chatId || !userId) return;
    fetchMessages(currentPage);

    const handleWebSocketMessage = (message: any) => {
      if (!message || !message.id) return;
      setMessages(prevMessages => {
        const idx = prevMessages.findIndex(m => m.id === message.id);
        if (idx !== -1) {
          const updated = [...prevMessages];
          updated[idx] = { ...prevMessages[idx], ...message };
          return updated;
        } else {
          return [...prevMessages, message];
        }
      });

     
      fetchMessages(currentPage);
    };


    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!stompClient.connected) {
      connectWebSocket(chatId, handleWebSocketMessage);
    } else {
      subscriptionRef.current = stompClient.subscribe(`/topic/chat/${chatId}`, msg => {
        try {
          const parsed = JSON.parse(msg.body);
          handleWebSocketMessage(parsed);
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!stompClient.connected) {
          connectWebSocket(chatId, handleWebSocketMessage);
        } else {
          if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
          subscriptionRef.current = stompClient.subscribe(`/topic/chat/${chatId}`, msg => {
            try {
              const parsed = JSON.parse(msg.body);
              handleWebSocketMessage(parsed);
            } catch (e) {
              console.error("Failed to parse message", e);
            }
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

  }, [chatId, userId, currentPage]);
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
        console.log("Messages updated:", messages);
    }, [messages]);

    // Intersection Observer to mark messages as read
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.getAttribute('data-id');
                        const messageSenderId = entry.target.getAttribute('data-sender-id');
                        if (messageId && messageSenderId !== userId) {
                            console.log("Marking message as read:", messageId);
                            markMessageAsRead(messageId);
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        const messageElements = document.querySelectorAll('.chatMessage');
        messageElements.forEach(el => observer.observe(el));

        return () => {
            messageElements.forEach(el => observer.unobserve(el));
        };
    }, [messages, userId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            if (stompClient) {
                if (stompClient.connected) { 
                    if (!chatId) {
                        console.error("chatId is missing!");
                        return;
                    }
                    console.log("Sending message:", newMessage);
                    stompClient.publish({
                        destination: "/app/chats/send",
                        body: JSON.stringify({
                            content: newMessage,
                            senderId: userId,
                            chatId: chatId,
                            read: false
                        }),
                    });
                    

                } else {
                    console.warn("Cannot send: STOMP not connected yet.");
                }
            } else {
            }
        }
        setNewMessage("");
    }

    async function markMessageAsRead(messageId: string) {
        if (readMessages.current.has(messageId)) return;
        readMessages.current.add(messageId);
        const token = localStorage.getItem('token');
        console.log("Marking message as read:", messageId);
        try {
            const response = await fetch(`http://localhost:8080/api/chats/messages/${messageId}/read`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`

                }

            });

            if (response.ok) {
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === messageId ? { ...msg, read: true } : msg
                    )
                );
            } else {
                console.error("Failed to update message read status");
            }
        } catch (error) {
            console.error("Error updating message read status:", error);
        }
    }

    return (
        <div
            className="d-flex flex-column h-100"
            style={{
                background: "#fff",
                borderRadius: 14,
                minHeight: 350,
                fontFamily: "'Segoe UI', Arial, sans-serif"
            }}
        >
            <div className="p-3 border-bottom bg-light rounded-top d-flex align-items-center" 
     style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                <h6 style={{ color: "black", fontWeight: 600, letterSpacing: 1, margin: 0, marginRight: 16 }}>
                    {friendName ? "Chat with " + friendName : "Click on a friend to open chat"}
                </h6>
                <div className="flex-grow-1 d-flex justify-content-center">
        {friendId && (
            <ChatPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        )}
    </div>
                {friendId && onDisconnect && (
                    <DisconnectButton 
                        friendId={friendId}
                        friendName={friendName}
                        onDisconnect={onDisconnect}
                    />
                )}
            </div>
            <div ref={chatBoxRef} className="flex-grow-1 overflow-y-scroll p-3" id="chat-box" style={{ background: "#f8fafc", height: "100vh"}}>
                {messages.length <= 0 ? 
                    <div className="text-center text-muted" style={{ marginTop: 60, fontSize: 16 }}>
                        No messages yet.
                    </div>
                    :
                    <div>
                        {messages.slice().reverse().map((msg, idx) => {
                            const isOwn = msg.senderId === userId;
                            return (
                                <div key={idx} data-id={msg.id} data-sender-id={msg.senderId} className="chatMessage">
                                    <div 
                                        style={{
                                            display: "flex",
                                            justifyContent: isOwn ? "flex-end" : "flex-start",
                                            marginBottom: 8
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: isOwn ? "#00bfff" : "#e5e7eb",
                                                color: isOwn ? "#fff" : "#222",
                                                borderRadius: 16,
                                                padding: "8px 16px",
                                                maxWidth: "70%",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                                            }}
                                        >
                                            <div style={{ fontSize: 15 }}>{msg.content}</div>
                                            <div className="chatMessageDateTime mt-1" style={{fontSize : "10px", display: "none", justifyContent: isOwn ? "flex-end" : "flex-start"}}>{new Date(msg.dateTime).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                }
            </div>
            <div className="p-3 border-top bg-light rounded-bottom" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                <form className="d-flex" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Type a message..."
                        style={{
                            borderRadius: 8,
                            border: "1.5px solid #00bfff",
                            fontFamily: "'Segoe UI', Arial, sans-serif"
                        }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="btn btn-primary d-flex align-items-center"
                        type="submit"
                        style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            color: "#fff",
                            border: "none"
                        }}
                        onClick={handleSendMessage}
                    >
                        <FaGamepad style={{ marginRight: 4 }} />
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}