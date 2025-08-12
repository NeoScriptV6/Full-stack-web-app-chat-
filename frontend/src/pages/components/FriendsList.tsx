import  { useState, useEffect, useRef } from 'react';
import defaultProfilePicture from '../../assets/default-user-icon.jpg';
import { FaEnvelope } from 'react-icons/fa'; 
import { stompClient } from '../../services/websocketService';

type FriendsListProps = {
    friends: Friend[];
    onFriendClick: (friend: Friend) => void; 
};

type Friend = {
    id : string;
    name: string;
    profilePicture: string;
    chatId: string;
};

export default function FriendsList({ friends, onFriendClick }: FriendsListProps) {
    const [profilePictures, setProfilePictures] = useState<{ [id: string]: string }>({});
    
    type Message = {
        id: string;
        senderId: string;
        content: string;
        read: boolean;
        dateTime: string;
        chatId: string;
    };

    const [lastMessages, setLastMessages] = useState<{ [id: string]: Message }>({});
    const subscriptionsRef = useRef<any[]>([]);

    async function fetchLastMessage(chatId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/api/chats/${chatId}/lastMessage`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 204) {
                return {
                    id: "",
                    senderId: "",
                    content: "No messages yet",
                    read: true,
                    dateTime: "",
                    chatId,
                };
            }
            const text = await response.text();
            if (!text) {
                return {
                    id: "",
                    senderId: "",
                    content: "No messages yet",
                    read: true,
                    dateTime: "",
                    chatId,
                };
            }
            const message = JSON.parse(text);
            return message;
        } catch (error) {
            return {
                id: "",
                senderId: "",
                content: "Error fetching messages",
                read: false,
                dateTime: "",
                chatId,
            };
        }
    }

    async function fetchFriendProfilePicture(friendId: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/api/users/${friendId}/profile-picture`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const imageBlob = await response.blob();
                return URL.createObjectURL(imageBlob);
            } else {
                return defaultProfilePicture; 
            }
        } catch (error) {
            return defaultProfilePicture;
        }
    }

    async function fetchAllLastMessages() {
        const messages: { [id: string]: Message }  = {};
        for (const friend of friends) {
            try {
                messages[friend.id] = await fetchLastMessage(friend.chatId);
            } catch {}
        }
        setLastMessages(messages);
    }

    useEffect(() => {
        async function fetchAllPictures() {
            const pics: { [id: string]: string } = {};
            for (const friend of friends) {
                pics[friend.id] = await fetchFriendProfilePicture(friend.id);
            }
            setProfilePictures(pics);
        }
        fetchAllPictures();
        fetchAllLastMessages();
    }, [friends]);

    useEffect(() => {
        if (!friends || friends.length === 0) return;

        function subscribeAll() {
            subscriptionsRef.current.forEach(sub => {
                try {
                    if (sub && typeof sub.unsubscribe === "function") {
                        sub.unsubscribe();
                    }
                } catch {}
            });
            subscriptionsRef.current = [];

            function handleIncomingMessage(message: any) {
                if (!message.chatId) return;
                const friend = friends.find(f => f.chatId === message.chatId);
                if (!friend) return;
                fetchLastMessage(message.chatId).then(latest => {
                    setLastMessages(prev => ({
                        ...prev,
                        [friend.id]: latest
                    }));
                });
            }

            friends.forEach(friend => {
                if (friend.chatId && stompClient.connected) {
                    const sub = stompClient.subscribe(`/topic/chat/${friend.chatId}`, msg => {
                        try {
                            const parsed = JSON.parse(msg.body);
                            handleIncomingMessage(parsed);
                        } catch (e) {
                            console.error("Failed to parse incoming message", e);
                        }
                    });
                    subscriptionsRef.current.push(sub);
                }
            });
        }

        if (!stompClient.connected) {
            stompClient.onConnect = () => {
                subscribeAll();
            };
            if (!stompClient.active) {
                stompClient.activate();
            }
        } else {
            subscribeAll();
        }

        return () => {
            subscriptionsRef.current.forEach(sub => {
                try {
                    if (sub && typeof sub.unsubscribe === "function") {
                        sub.unsubscribe();
                    }
                } catch {}
            });
            subscriptionsRef.current = [];
        };
    }, [friends, stompClient.connected]);

    // --- SORT FRIENDS BY LAST MESSAGE TIME ---
    const sortedFriends = [...friends].sort((a, b) => {
        const aTime = lastMessages[a.id]?.dateTime || "";
        const bTime = lastMessages[b.id]?.dateTime || "";
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        return bTime.localeCompare(aTime);
    });

    async function handleFriendClick(friend: Friend){
        await fetchAllLastMessages();
    }

    return (
        <div style={{ padding: "0 8px" }}>
            <div className="mb-2 mt-2 text-secondary text-center" style={{ letterSpacing: 1, fontSize: "1.1em" }}>
                Friends
            </div>
            <div>
                {sortedFriends.map((friend, idx) => (
                    <div
                        key={friend.id}
                        className="d-flex align-items-center mb-2 p-2"
                        style={{
                            background: "#f8fafc",
                            borderRadius: 10,
                            border: "1px solid #e3e8ee",
                            cursor: "pointer",
                        }}
                        onClick={async () => {
                            onFriendClick(friend);
                            handleFriendClick(friend);
                        }}
                    >
                        <img
                            src={profilePictures[friend.id] || defaultProfilePicture}
                            alt={friend.name}
                            className="rounded-circle border"
                            style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                            }}
                        />
                        <div className="ms-3 flex-grow-1">
                            <div style={{ fontSize: "1em" }}>
                                {friend.name}
                            </div>
                            <div className={`fw-muted ${!lastMessages[friend.id]?.read && lastMessages[friend.id]?.senderId == friend.id ? 'fw-bold' : ''} text-muted`} style={{ fontSize: "0.9em" }}>
                                {lastMessages[friend.id]?.content || "Loading..."}
                                {!lastMessages[friend.id]?.read && lastMessages[friend.id]?.senderId == friend.id && (
                                    <FaEnvelope style={{ marginLeft: '5px', color: '#007bff', opacity: '50%' }} /> 
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}