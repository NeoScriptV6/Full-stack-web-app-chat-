import { useState, useEffect } from 'react';
import FriendProfile from './FriendProfile';

import defaultProfilePicture from '../../assets/default-user-icon.jpg';

type RecommendationsProps = {
    userId: string;
    onCloseRecommendations: () => void;
    userProfile: {
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
        };
    };
    onFriendsChanged?: () => void;
    toggleHasRecommendations: (has: boolean) => void;
};

type Recommendation = {
    id: string; 
    userId?: string; // for inbound/outbound
    username: string;
    profilePicture: string;
};

export default function Recommendations({ userId, userProfile, onCloseRecommendations, onFriendsChanged, toggleHasRecommendations }: RecommendationsProps) {
    const [realRecommendations, setRealRecommendations] = useState<Recommendation[]>([]);
    const [inboundRecommendations, setInboundRecommendations] = useState<Recommendation[]>([]);
    const [outboundRecommendations, setOutboundRecommendations] = useState<Recommendation[]>([]);
    const [showFriendProfile, setShowFriendProfile] = useState(false);
    const [friendId, setFriendId] = useState("");
    const [friendProfile, setFriendProfile] = useState<any>(null);
    const [loadingFriendProfile, setLoadingFriendProfile] = useState(false);

    function checkRecommendationsChange(){
        if (realRecommendations.length > 0 || inboundRecommendations.length > 0 ){
            toggleHasRecommendations(true);

        } else {
            toggleHasRecommendations(false);

        }

    }
    // Fetch Recommendations (people you can add)
    async function fetchRecommendations() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/recommendations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.recommendations) return;
        const profiles = await Promise.all(
            data.recommendations.map(async (recId: string) => {
                const res = await fetch(`/api/users/${recId}/public-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await res.json();
                const res2 = await fetchFriendProfilePicture(recId);
                profile.profilePictureUrl = res2 || defaultProfilePicture;
                return {
                    id: recId,
                    userId: recId, 
                    username: profile.name,
                    profilePicture: profile.profilePictureUrl || '',
                };
            })
        );
        setRealRecommendations(profiles.filter(Boolean));


    }

    // Fetch Inbound Recommendations (requests you received)
    async function fetchInbound() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections/pending', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const profiles = await Promise.all(
            (data || []).map(async (conn: any) => {
                const res = await fetch(`/api/users/${conn.from}/public-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await res.json();
                const res2 = await fetchFriendProfilePicture(conn.from);
                profile.profilePictureUrl = res2 || defaultProfilePicture;
                return {
                    id: conn.connectionId,
                    userId: conn.from,
                    username: profile.name,
                    profilePicture: profile.profilePictureUrl || '',
                };
            })
        );
        setInboundRecommendations(profiles.filter(Boolean));
    }

    // Fetch Outbound Recommendations (requests you sent)
    async function fetchOutbound() {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections/outbound', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const profiles = await Promise.all(
            (data || []).map(async (conn: any) => {
                const res = await fetch(`/api/users/${conn.to}/public-profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await res.json();
            const res2 = await fetchFriendProfilePicture(conn.to);
                profile.profilePictureUrl = res2 || defaultProfilePicture;
                return {
                    id: conn.connectionId,
                    userId: conn.to,
                    username: profile.name,
                    profilePicture: profile.profilePictureUrl || '',
                };
            })
        );
        setOutboundRecommendations(profiles.filter(Boolean));
    }
    async function fetchFriendProfilePicture(friendId: string) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/users/${friendId}/profile-picture`, {
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

    useEffect(() => {
        fetchRecommendations();
        checkRecommendationsChange();
    }, [userId]);

    useEffect(() => {
        fetchInbound();
        checkRecommendationsChange();
        

    }, [userId]);

    useEffect(() => {
        fetchOutbound();
    }, [userId]);
    useEffect(()=>{
        const fetchProfilePicture = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/profile-picture`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                });

                if (response.ok) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                userProfile.userIcon = imageUrl; 
                } else {
                // here was console.error
                }
            } catch (error) {
                // here was console.error
            }
        }

        fetchProfilePicture();   

    }, [userId]);
    // Accept/Decline handlers for Recommendations
    async function onAccept(id: string) {
        const token = localStorage.getItem('token');
        await fetch(`/api/connections/request/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchRecommendations();
        fetchOutbound();
        checkRecommendationsChange();
        onFriendsChanged?.();
    }
    async function onDecline(id: string) {
        const token = localStorage.getItem('token');
        await fetch(`/api/recommendations/dismiss/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        setRealRecommendations(prev => prev.filter(rec => rec.id !== id));
        checkRecommendationsChange();
    }

    // Accept/Decline handlers for Inbound
    async function onAcceptInbound(connectionId: string) {
        const token = localStorage.getItem('token');
        await fetch(`/api/connections/respond/${connectionId}?accept=true`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        setInboundRecommendations(prev => prev.filter(rec => rec.id !== connectionId));
        onFriendsChanged?.(); // refresh friends list
        checkRecommendationsChange();

    }
    async function onDeclineInbound(connectionId: string) {
        const token = localStorage.getItem('token');
        await fetch(`/api/connections/respond/${connectionId}?accept=false`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        setInboundRecommendations(prev => prev.filter(rec => rec.id !== connectionId));
        checkRecommendationsChange();

    }


    async function openUserProfile(id: string) {
        setFriendId(id);
        setShowFriendProfile(true);
        setLoadingFriendProfile(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/${id}/public-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profile = await res.json();
        setFriendProfile({
            name: profile.name,
            userIcon: profile.profilePictureUrl || "https://randomuser.me/api/portraits/lego/2.jpg",
            aboutMe: profile.aboutMe || "",
            bio: {
                region: profile.region || "",
                favoriteGames: profile.favoriteGames || [],
                favoriteGenres: profile.favoriteGenres || [],
                platforms: profile.platforms || [],
                availability: profile.availability || [],
                gamesLookingForPartner: profile.gamesLookingForPartner || [],
                otherKeywords: profile.otherKeywords || [],
            }
        });
        setLoadingFriendProfile(false);
    }
    function closeUserProfile() {
        setShowFriendProfile(false);
    }

    if (showFriendProfile) {
        if (loadingFriendProfile || !friendProfile) {
            return <div>Loading profile...</div>;
        }
        return (
            <FriendProfile
                userId={friendId}
                userProfile={friendProfile}
                onCloseProfile={closeUserProfile}
            />
        );
    }

    return (
        <div
            className="w-100 h-100 p-4"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e3f6fd 100%)",
                color: "#222",
                fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
        >
            <div className="d-flex align-items-start mb-4">
                <button
                    className="btn btn-outline-secondary me-4 mt-2"
                    onClick={onCloseRecommendations}
                    aria-label="Go back"
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
                <div className="d-flex flex-column align-items-center" style={{ minWidth: 110 }}>
                    <img
                        src={userProfile.userIcon}
                        alt="Profile"
                        className="rounded-circle mb-2"
                        style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            border: "2px solid #e3e8ee",
                            background: "#eee"

                          
                        }}
                    />
                </div>
                <div className="ms-4 flex-grow-1">
                    <h2 className="mb-1" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: 1, fontWeight: 600 }}>
                        {userProfile.name}
                    </h2>
                </div>
            </div>

            <div className="container mt-4">
                {/* Recommendations */}
                <div className="mb-5">
                    <h5 className="tab-header">Recommendations</h5>
                    <div className="list-group">
                        {realRecommendations.length > 0 ? (
                            realRecommendations.map((rec) => (
                                <div key={rec.id} className="list-group-item d-flex align-items-center recommendation-list-item">
                                    <img  src={!rec.profilePicture || rec.profilePicture === "default"? defaultProfilePicture : rec.profilePicture} alt={`${rec.username}'s profile`} className="rounded-circle mr-3"
                                        style={{
                                            width: 55,
                                            height: 55,
                                            objectFit: "cover",
                                            border: "1.5px solid #e3e8ee",
                                            background: "#fff"
                                        }}
                                    />
                                    <div className="flex-grow-1 d-flex flex-column">
                                        <span className="fw-semibold recommendation-list-item-name" style={{ fontSize: "1em", marginLeft: "10px" }}>{rec.username}</span>
                                        {/* View Profile button added here for Recommendations */}
                                        <button className="btn btn-sm btn-link text-decoration-none view-profile-button"
                                            style={{ color: "#339af0", width: "fit-content" }}
                                            aria-label="Open user profile"
                                            title="Open user profile"
                                            onClick={() => openUserProfile(rec.userId!)}>
                                            <span>View Profile</span>
                                        </button>
                                    </div>
                                    <button className="btn btn-success btn-sm mr-2" onClick={() => onAccept(rec.id)}>Accept</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => onDecline(rec.id)}>Decline</button>
                                </div>
                            ))
                        ) : (
                            <div className="list-group-item d-flex align-items-center justify-content-center">
                                <span className="text-center text-muted">No recommendations...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inbound Recommendations */}
                <div className="mb-5">
                    <h5 className="tab-header">Inbound Recommendations</h5>
                    <div className="list-group">
                        {inboundRecommendations.length > 0 ? (
                            inboundRecommendations.map((rec) => (
                                <div key={rec.id} className="list-group-item d-flex align-items-center recommendation-list-item">
                                    <img src={!rec.profilePicture || rec.profilePicture === "default"? defaultProfilePicture : rec.profilePicture} alt={`${rec.username}'s profile`} className="rounded-circle mr-3"
                                        style={{
                                            width: 55,
                                            height: 55,
                                            objectFit: "cover",
                                            border: "1.5px solid #e3e8ee",
                                            background: "#fff"
                                        }}
                                    />
                                    <div className="flex-grow-1 d-flex flex-column">
                                        <span className="fw-semibold recommendation-list-item-name" style={{ fontSize: "1em", marginLeft: "10px" }}>{rec.username}</span>
                                        <button className="btn btn-sm btn-link text-decoration-none view-profile-button"
                                            style={{ color: "#339af0", width: "fit-content" }}
                                            aria-label="Open user profile"
                                            title="Open user profile"
                                            onClick={() => openUserProfile(rec.userId!)}>
                                            <span>View Profile</span>
                                        </button>
                                    </div>
                                    <button className="btn btn-success btn-sm" style={{ marginRight: "10px" }} onClick={() => onAcceptInbound(rec.id)}>Accept</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => onDeclineInbound(rec.id)}>Decline</button>
                                </div>
                            ))
                        ) : (
                            <div className="list-group-item d-flex align-items-center justify-content-center">
                                <span className="text-center text-muted">No inbound recommendations...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Outbound Recommendations */}
                <div>
                    <h5 className="tab-header">Outbound Recommendations</h5>
                    <div className="list-group">
                        {outboundRecommendations.length > 0 ? (
                            outboundRecommendations.map((rec) => (
                                <div key={rec.id} className="list-group-item d-flex align-items-center recommendation-list-item">
                                    <img src={!rec.profilePicture || rec.profilePicture === "default"? defaultProfilePicture : rec.profilePicture} alt={`${rec.username}'s profile`} className="rounded-circle mr-3"
                                        style={{
                                            width: 55,
                                            height: 55,
                                            objectFit: "cover",
                                            border: "1.5px solid #e3e8ee",
                                            background: "#fff"
                                        }}
                                    />
                                    <div className="flex-grow-1 d-flex flex-column">
                                        <span className="fw-semibold recommendation-list-item-name" style={{ fontSize: "1em", marginLeft: "10px" }}>{rec.username}</span>
                                        <button className="btn btn-sm btn-link text-decoration-none view-profile-button"
                                            style={{ color: "#339af0", width: "fit-content" }}
                                            aria-label="Open user profile"
                                            title="Open user profile"
                                            onClick={() => openUserProfile(rec.userId!)}>
                                            <span>View Profile</span>
                                        </button>
                                    </div>
                                    <span className="text-muted">Waiting for acceptance</span>
                                </div>
                            ))
                        ) : (
                            <div className="list-group-item d-flex align-items-center justify-content-center">
                                <span className="text-center text-muted">No outbound recommendations...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

