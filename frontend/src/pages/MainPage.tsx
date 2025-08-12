import defaultUserIcon from '../assets/default-user-icon.jpg';

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

import SidebarUserProfile from './components/SidebarUserProfile';
import FriendsList from './components/FriendsList';
import Chat from './components/Chat';
import UserProfile from './components/UserProfile';
import LogOut from './components/LogOut';
import Recommendations from './components/Recommendations';


type Friend = {
    id: string;
    name: string;
    profilePicture: string;
    chatId: string;
    lastMessageTime?: string;
}

type UserProfile = {
    name: string;
    userIcon: string;
    aboutMe?: string;
    bio: {
        region: string;
        favoriteGames: string[];
        favoriteGenres: string[];
        platforms: string[];
        availability: string[];
        gamesLookingForPartner: string[];
        otherKeywords: string[];
        searchEnabled?: boolean;
    };
};

export default function MainPage(){
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: '',
        userIcon: defaultUserIcon,
        aboutMe: '',
        bio: {
            region: '',
            favoriteGames: [],
            favoriteGenres: [],
            platforms: [],
            availability: [],
            gamesLookingForPartner: [],
            otherKeywords: []

        }
    });
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [hasRecommendations, setHasRecommendations] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Friend | null>(null);
    const [currentChatId, setCurrentChatId] = useState("");
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId') || '';
    const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);

    async function checkProfileCompletion(){

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }
        const res = await fetch('http://localhost:8080/api/users/' + userId + '/profile-completed', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const isCompleted = await res.json();
        setIsProfileCompleted(isCompleted);


        if (!isCompleted) {
            setShowProfileEditor(true);
        }
        console.log("profile completed: ", isCompleted);

        return isCompleted;
    }

    async function fetchFriends() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        // Fetch each friend's public profile
        const friendsProfiles = await Promise.all(
            (data.connections || []).map(async (friendId: string) => {
                const res = await fetch(`/api/users/${friendId}/public-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await res.json();
                return {
                    id: friendId,
                    name: profile.name,
                    profilePicture: profile.profilePictureUrl || "https://randomuser.me/api/portraits/lego/2.jpg",
                    chatId: await getOrCreateChatId(friendId)
                };
            })
        );
        setFriends(friendsProfiles);
    }
    async function checkRecommendations() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/recommendations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setHasRecommendations(data.recommendations && data.recommendations.length > 0);

    }

    async function checkInbound() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections/pending', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        setHasRecommendations(data && data.length > 0);
    }


    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !isTokenValid(token)) {
            navigate('/login');
            return;
        }
        
        fetchFriends();
        setInterval(()=> {
            checkRecommendations();
            checkInbound();
            fetchFriends();

        }, 3000) // check recs every 5 seconds

        if (!userId) {
            navigate('/login');
            return;
        }
        async function fetchProfile() {
            const [basicRes, profileRes, bioRes] = await Promise.all([
                fetch(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/users/${userId}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/users/${userId}/bio`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            // Combine all the data into one object.
            const basic = await basicRes.json();
            const profile = await profileRes.json();
            const bio = await bioRes.json();
            setUserProfile({
                name: basic.name || '',
                userIcon: profile.userIcon || defaultUserIcon,
                aboutMe: profile.aboutMe || '',
                bio: {
                    region: bio.region || '',
                    favoriteGames: bio.favoriteGames || [],
                    favoriteGenres: bio.favoriteGenres || [],
                    platforms: bio.platforms || [],
                    availability: bio.availability || [],
                    gamesLookingForPartner: bio.gamesLookingForPartner || [],
                    otherKeywords: bio.otherKeywords || [],

                }
            });
            await checkProfileCompletion();
           

        }
        fetchProfile();
    }, [navigate, userId]);

    function isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!payload.exp) return false;

            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    async function getOrCreateChatId(friendId: string): Promise<string | null> {
        const token = localStorage.getItem('token');
  
        const res = await fetch(`/api/chats/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const chats = await res.json(); 
        console.log("chats", chats)
        const chat = chats.find((c: any) => c.userIds?.includes(friendId));
        if (chat) return chat.id;
        const createRes = await fetch(`/api/chats/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userIds: [userId, friendId] })
        });
    
        const newChat = await createRes.json();
        return newChat.id;
    }

    const HandleEditProfile = () => {
        setShowProfileEditor(true);
    };

    const handleProfileCompletionChange = (completed: boolean) => {
        setIsProfileCompleted(completed);
    };

    async function handleCloseProfileEditor(){
        const completed = await checkProfileCompletion();
        setIsProfileCompleted(completed);
        if(completed) {
            setShowProfileEditor(false);
        } else {
            alert("Please complete your profile before proceeding");
        } 
        
    };

    const handleShowRecommendations = () => {
        setShowRecommendations(true);
    };

    const handleCloseRecommendations= () => {
        checkRecommendations();
        checkInbound();
        setShowRecommendations(false);
    };
    const handleToggleHasRecommendations = (has: boolean) => {
        // setHasRecommendations(has);
    }
    const handleDisconnect = (friendId: string) => {
        // Filter out the disconnected friend from the friends list
        setFriends(friends.filter(friend => friend.id !== friendId));
        // Close the chat interface
        setSelectedChat(null);
    };

      return (
        <div
            className="container-fluid vh-100"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e3f6fd 100%)",
                fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif"
            }}
        >
            <div className="row h-100">
                {/* Sidebar */}
                {(!showProfileEditor && !showRecommendations)&& (
                    <div
                        className="col-auto d-flex flex-column p-0"
                        style={{
                            background: "#fff",
                            borderRight: "2px solid #00bfff",
                            minWidth: 270,
                            boxShadow: "2px 0 16px #00bfff20",
                            zIndex: 2
                        }}
                    >
                        <SidebarUserProfile
                            userId={userId}
                            name={userProfile.name}
                            onEditProfile={HandleEditProfile}
                            onShowRecommendations={handleShowRecommendations} 
                            profileUserIcon={userProfile.userIcon}
                            hasRecommendations={hasRecommendations}
                        />
                        <FriendsList 
                            friends={friends} 
                            onFriendClick={async (friend) => {
                
                                const chatId = await getOrCreateChatId(friend.id);

                                setCurrentChatId(chatId ? chatId : "");
                                setSelectedChat({ ...friend });
                                
                              
                     
                                
                            }} 
                        />
                    </div>
                )}

                {/* Main right area */}
                <div
                    className={showProfileEditor ? "col-12 d-flex flex-column p-0" : "col d-flex flex-column p-0"}
                    style={{
                        background: "transparent",
                        height: "100vh",
                        position: "relative"
                    }}
                >
                    {(showProfileEditor || showRecommendations) ? (

                        showProfileEditor ? (
                            <UserProfile
                                userId={userId}
                                userProfile={userProfile}
                                onCloseProfile={handleCloseProfileEditor}
                                onProfileUpdated={setUserProfile}
                                isProfileCompleted={isProfileCompleted}
                                checkProfileCompletion={checkProfileCompletion}
                                onProfileCompletionChange={handleProfileCompletionChange}
                                />
                        ) : (
                            <Recommendations
                                userId={userId}
                                userProfile={userProfile}
                                onCloseRecommendations={handleCloseRecommendations}
                                onFriendsChanged={fetchFriends}
                                toggleHasRecommendations={handleToggleHasRecommendations}
                            />
                        )
                    ) : (
                        <Chat
                          chatId={currentChatId} 
                          friendId={selectedChat?.id}
                          userId={userId}
                          friendName={selectedChat?.name}
                          onDisconnect={handleDisconnect}
                        />
                    )}


                </div>
            </div>
            <LogOut />
        </div>
    );
}