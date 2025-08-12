import { FaXbox, FaPlaystation, FaSteam, FaWindows, FaApple, FaLinux } from "react-icons/fa";
import defaultProfilePicture from '../../assets/default-user-icon.jpg';
const platformIcons: Record<string, JSX.Element> = {
  Xbox: <FaXbox color="#107C10" title="Xbox" />,
  PlayStation: <FaPlaystation color="#003087" title="PlayStation" />,
  Steam: <FaSteam color="#171A21" title="Steam" />,
  PC: <FaWindows color="#00ADEF" title="PC" />,
  Mac: <FaApple color="#A2AAAD" title="Mac" />,
  Linux: <FaLinux color="#FCC624" title="Linux" />,
};

type FriendProfileProps = {
  userId: string;
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
  onCloseProfile: () => void;
};

const bioFields = [
  { key: "region", label: "Region", isArray: false },
  { key: "favoriteGames", label: "Favorite Games", isArray: true },
  { key: "favoriteGenres", label: "Favorite Genres", isArray: true },
  { key: "platforms", label: "Platforms", isArray: true },
  { key: "availability", label: "Availability", isArray: true },
  { key: "gamesLookingForPartner", label: "Looking For Partner (Games)", isArray: true },
  { key: "otherKeywords", label: "Other Keywords", isArray: true },
] as const;

export default function FriendProfile({ userId , userProfile, onCloseProfile }: FriendProfileProps) {
  const { name, userIcon, aboutMe, bio } = userProfile;

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
      {/* Header */}
      <div className="d-flex align-items-start mb-4">
        <button
          className="btn btn-outline-secondary me-4 mt-2"
          onClick={onCloseProfile}
          aria-label="Go back"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="d-flex flex-column align-items-center" style={{ minWidth: 110 }}>
          <img
            src={userIcon || userIcon === "default"? defaultProfilePicture : userIcon}
            alt="Profile"
            className="rounded-circle mb-2"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              border: "2px solid #e3e8ee",
              background: "#fff",
            }}
          />
        </div>
        <div className="ms-4 flex-grow-1">
          <h2 className="mb-1" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: 1, fontWeight: 600 }}>
            {name}
          </h2>
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ color: "#444" }}>
              About Me
            </label>
            <div>
              {aboutMe ? aboutMe : <span className="text-muted">No about me yet.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Fields */}
      <div
        className="card shadow-sm p-4"
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e3e8ee",
          boxShadow: "0 2px 8px #b3e0fc40",
        }}
      >
        <h5 className="mb-3 fw-bold" style={{ color: "#222", fontFamily: "'Orbitron', monospace" }}>
          Gaming Bio
        </h5>
        <div className="d-flex flex-column" style={{ gap: "20px" }}>
          {bioFields.map(({ key, label, isArray }) => (
            <div
              key={key}
              style={{
                padding: "15px",
                background: "#f9f9f9",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            >
              <label className="form-label fw-semibold" style={{ color: "#333" }}>
                {label}
              </label>
              <div className="d-flex align-items-center flex-wrap mt-1">
                {isArray && Array.isArray(bio[key]) && bio[key].length > 0 ? (
                  bio[key].map((item, idx) => (
                    <span
                      key={item + idx}
                      className="badge bg-light border me-2 mb-2 d-inline-flex align-items-center"
                      style={{ color: "#444", fontWeight: 500, fontSize: "1em" }}
                    >
                      {key === "platforms" && platformIcons[item] ? (
                        <span className="me-1">{platformIcons[item]}</span>
                      ) : null}
                      {item}
                    </span>
                  ))
                ) : !isArray && typeof bio[key] === "string" ? (
                  <span style={{ color: "#444" }}>{bio[key]}</span>
                ) : (
                  <span className="text-muted">Not set</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
