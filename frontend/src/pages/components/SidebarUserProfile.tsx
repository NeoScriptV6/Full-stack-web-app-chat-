import { useState, useEffect } from "react";


type SidebarUserProfileProps = {
    userId: string;
    name: string;

    onEditProfile: () => void;
    onShowRecommendations: () => void;
    profileUserIcon: string;
    hasRecommendations: boolean;
};  

export default function SidebarUserProfile({ userId, name, onEditProfile, onShowRecommendations, profileUserIcon, hasRecommendations }: SidebarUserProfileProps) {

  const [userIcon, setUserIcon] = useState<string | undefined>(profileUserIcon);

    useEffect(() => {

        const fetchProfilePicture = async () => {

            const response = await fetch(`/api/users/${userId}/profile-picture`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            })

            if (response.ok) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setUserIcon(imageUrl); 
            } else {
                // here was console.error
            }
      
        };

        fetchProfilePicture();
    }, [userId]); 

   

    return (
        <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
                <img src={userIcon}
                        alt="Profile"
                        className="img-fluid rounded-circle"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />
                <div className="ms-3 flex-grow-1">
                    <div className="d-flex flex-column">
                        <h6 className=" mb-1" style={{ whiteSpace: "nowrap" }}>
                            {name}
                        </h6>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-sm btn-link p-0 text-decoration-none edit-profile-button"
                                    style={{ color: "#339af0", width: "fit-content" }}
                                    aria-label="Edit your profile"
                                    title="Edit your profile"
                                    onClick={onEditProfile}
                            > {/* Edit profile button*/ }
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit profile
                            </button>

                            <button className="btn btn-sm btn-link p-0 text-decoration-none recommendations-button"
                                    style={{ color: "#339af0", width: "fit-content", fontSize: "1.2em" }}
                                    aria-label="Show recommendations"
                                    title="Show recommendations"
                                    onClick={onShowRecommendations}
                            >
                            <i className="bi bi-bell" style={{position: "relative", display:"inline-block"}}> 
                                {hasRecommendations ? 
                                (<span className="has-reccomendations-dot"></span>)
                                :
                                (<></>)}
                            </i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}