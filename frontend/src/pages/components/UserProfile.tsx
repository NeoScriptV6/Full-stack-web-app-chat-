import { useState, useRef, useEffect } from "react";
import { FaXbox, FaPlaystation, FaSteam, FaWindows, FaApple, FaLinux, FaTimes } from "react-icons/fa";
import defaultProfilePicture from "../../assets/default-user-icon.jpg"; // Import the default profile picture

const platformIcons: Record<string, JSX.Element> = {
  Xbox: <FaXbox color="#107C10" title="Xbox" />,
  PlayStation: <FaPlaystation color="#003087" title="PlayStation" />,
  Steam: <FaSteam color="#171A21" title="Steam" />,
  PC: <FaWindows color="#00ADEF" title="PC" />,
  Mac: <FaApple color="#A2AAAD" title="Mac" />,
  Linux: <FaLinux color="#FCC624" title="Linux" />,
};

const regions = ["North America", "Europe", "Asia", "South America",
            "Australia", "Africa", "Eastern Europe", "Western Europe", "Southeast Asia", "Middle East"];

const genres = ["FPS", "MOBA", "RPG", "Simulation", "Strategy",
            "Sports", "Racing", "Puzzle", "Adventure", "Platformer", "Fighting", "Survival", "Horror",
            "Battle Royale", "MMO", "Open World", "Sandbox", "Card Game", "Roguelike", "Visual Novel"]


const platforms = ["PC", "PlayStation", "Xbox", "Nintendo Switch",
            "Mobile", "Steam", "Epic Games", "Origin", "Battle.net"]


const availabilities = ["Weekday Mornings", "Weekday Afternoons",
            "Weekday Evenings", "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings", "Late Night"];




type UserProfileProps = {
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
  onProfileUpdated?: (profile: any) => void;
  isProfileCompleted?: boolean;
  checkProfileCompletion : ()=> Promise<boolean>;
  onProfileCompletionChange : (completed: boolean) => void;
};

const bioFields = [
  { key: "region", label: "Region", isArray: false, required: true },
  { key: "favoriteGames", label: "Favorite Games",  isArray: true, required: true },
  { key: "favoriteGenres", label: "Favorite Genres", isArray: true, required: true},
  { key: "platforms", label: "Platforms", isArray: true, required: true },
  { key: "availability", label: "Availability", isArray: true, required: true},
  { key: "gamesLookingForPartner", label: "Looking For Partner (Games)", isArray: true, required: false },
  { key: "otherKeywords", label: "Other Keywords", isArray: true, required: false },
] as const;

type BioFieldKey = typeof bioFields[number]["key"];

export default function UserProfile({
  userId,
  userProfile,
  onCloseProfile,
  onProfileUpdated,
  isProfileCompleted,
  checkProfileCompletion,
  onProfileCompletionChange
}: UserProfileProps) {
  const [editingField, setEditingField] = useState<null | "aboutMe" | "userIcon" | BioFieldKey>(null);
  const [userIcon, setUserIcon] = useState(userProfile.userIcon);
  const [aboutMe, setAboutMe] = useState(userProfile.aboutMe || "");
  const [bio, setBio] = useState({ ...userProfile.bio });
  const [saving, setSaving] = useState(false);
  const [inputValues, setInputValues] = useState<Record<BioFieldKey, string>>({
    favoriteGames: "",
    favoriteGenres: "",
    platforms: "",
    availability: "",
    gamesLookingForPartner: "",
    otherKeywords: "",
    region: "",
  });
  const [profileCompleted, setIsProfileCompleted] = useState(isProfileCompleted);

  useEffect(() => {

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
          setUserIcon(imageUrl); 
        } else {
           // here was console.error
        }
      } catch (error) {
    // here was console.error
      }


    };

    fetchProfilePicture();



  }, [userId]);

  const inputRefs = {
    favoriteGames: useRef<HTMLInputElement>(null),
    favoriteGenres: useRef<HTMLInputElement>(null),
    platforms: useRef<HTMLInputElement>(null),
    availability: useRef<HTMLInputElement>(null),
    gamesLookingForPartner: useRef<HTMLInputElement>(null),
    otherKeywords: useRef<HTMLInputElement>(null),
    region: useRef<HTMLInputElement>(null),
  };

  // Save About Me
  async function saveAboutMe(newAboutMe: string) {

    setSaving(true);
    setAboutMe(newAboutMe);
    try {
      await fetch(`/api/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ aboutMe: newAboutMe }),
      });
      setEditingField(null);
      onProfileUpdated?.({ ...userProfile, aboutMe: newAboutMe, userIcon, bio });
      const isComplete = await checkProfileCompletion();
      setIsProfileCompleted(isComplete);
      onProfileCompletionChange(isComplete)
    } finally {
      setSaving(false);
    }

  }

  // Save Bio Field
  async function saveBioField(field: BioFieldKey, value: string[] | string) {
    setSaving(true);

    let newBio = { ...bio };
    if (field === "region") {
      newBio.region = typeof value === "string" ? value : value[0] || "";
    } else {
      newBio[field] = Array.isArray(value) ? value : [value];
    }

    const bioToSend = {
      ...newBio,
      region: typeof newBio.region === "string"
        ? newBio.region
        : Array.isArray(newBio.region)
          ? (newBio.region[0] || "")
          : ""
    };

    try {
      await fetch(`/api/users/${userId}/bio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(bioToSend),
      });
      setEditingField(null);
      setBio(newBio);
      onProfileUpdated?.({ ...userProfile, bio: newBio });
    } finally {
      const isComplete = await checkProfileCompletion();
      setIsProfileCompleted(isComplete);
      onProfileCompletionChange(isComplete);
      setSaving(false);
    }
  }

  // Save Profile Picture
  async function saveProfilePicture(file: File) {
    setSaving(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const res = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();

      if(res.ok){
          const imageResponse = await fetch(`/api/users/${userId}/profile-picture`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setUserIcon(imageUrl); // Update the user icon with the new image
        } else {
        }
      }


      setEditingField(null);
      onProfileUpdated?.({ ...userProfile, userIcon: data.profilePictureUrl, aboutMe, bio });
    } finally {
      setSaving(false);
    }
  }

  // Remove Profile Picture
  async function removeProfilePicture() {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/remove-profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        setUserIcon(defaultProfilePicture); // Revert to the default profile picture
        onProfileUpdated?.({ ...userProfile, userIcon: defaultProfilePicture });
      } else {
        alert("Failed to remove profile picture. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while removing the profile picture.");
    } finally {
      setSaving(false);
    }
  }

  // Handle profile picture change
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setUserIcon(ev.target.result as string);
      };
      reader.readAsDataURL(file);
      saveProfilePicture(file);
    }
  };



  // Handle chip/tag add for array fields
  function handleChipInputKeyDown(field: BioFieldKey, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const value = inputValues[field].trim();
      if (value && Array.isArray(bio[field]) && !bio[field].includes(value)) {
        const updated = [...bio[field], value];
        setBio(prev => ({ ...prev, [field]: updated }));
        setInputValues(prev => ({ ...prev, [field]: "" }));
      }
    }
  }

  // Remove chip/tag
  function handleRemoveChip(field: BioFieldKey, idx: number) {
    if (Array.isArray(bio[field])) {
      const updated = bio[field].filter((_, i) => i !== idx);
      setBio(prev => ({ ...prev, [field]: updated }));
    }
  }

  function isFieldInvalid(key: BioFieldKey) {
    const field = bioFields.find(f => f.key === key);
    if (!field?.required) return false;
    if (field.isArray) return !Array.isArray(bio[key]) || bio[key].length === 0;
    return !bio[key] || (typeof bio[key] === "string" && bio[key].trim() === "");
  }

  return (
    <div
      className="w-100  p-4"
      style={{
        height: "auto",
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
            src={userIcon || defaultProfilePicture} 
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
          <div className="d-flex">
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => setEditingField("userIcon")}
              aria-label="Edit profile picture"
              disabled={saving}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit Picture
            </button>
            {userIcon && userIcon !== defaultProfilePicture && ( 
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={removeProfilePicture}
                disabled={saving}
                aria-label="Remove profile picture"
              >
                <i className="bi bi-trash me-1"></i>
                Remove Picture
              </button>
            )}
          </div>
          {editingField === "userIcon" && (
            <div className="mt-2 w-100">
              <input
                type="file"
                accept="image/*"
                className="form-control form-control-sm profile-picture-input"
                onChange={handleIconChange}
                disabled={saving}
              />
            </div>
          )}
        </div>
        <div className="ms-4 flex-grow-1">
          <h2 className="mb-1" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: 1, fontWeight: 600 }}>
            {userProfile.name}
          </h2>
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ color: "#444" }}>
              About Me
            </label>
            {editingField === "aboutMe" ? (
              <div className="input-group">
                <textarea
                  className="form-control"
                  rows={2}
                  value={aboutMe}
                  onChange={e => setAboutMe(e.target.value)}
                  disabled={saving}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => saveAboutMe(aboutMe)}
                  disabled={saving}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <span className="me-2">{aboutMe || <span className="text-muted">No about me yet.</span>}</span>
                <button
                  className="btn btn-sm btn-link p-0"
                  onClick={() => setEditingField("aboutMe")}
                  disabled={saving}
                  style={{ color: "#0099ff" }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bio fields */}

   
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
          Your Gaming Bio
        </h5>
        {!profileCompleted && (
          <p style= {{color : 'red'}}>Please complete the profile before proceeding</p>
        )}   
        <div className="d-flex flex-column" style={{ gap: '20px' }}>
          {bioFields.map(({ key, label, isArray }) => (
  <div className="bio-item" key={key} style={{ width: '100%', padding: '15px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd' }}>
    <label className="form-label fw-semibold" style={{ marginBottom: '10px', display: 'block', color: '#333'  }}>
      {label}
    </label>
    {editingField === key ? (
      // REGION: single select
      key === "region" ? (
        <div className="input-group">
          <select
            className={`form-select${isFieldInvalid(key) ? " is-invalid" : ""}`}
            value={bio.region}
            onChange={e => setBio(prev => ({ ...prev, region: e.target.value }))}
            disabled={saving}
          >
            <option value="">Select region...</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={() => saveBioField("region", bio.region)}
            disabled={saving}
          >Done</button>
          {isFieldInvalid(key) && (
            <div className="invalid-feedback d-block">
              This field is required.
            </div>
          )}
        </div>
      )
      // MULTI-SELECT: genres, platforms, availability
      : (key === "favoriteGenres" || key === "platforms" || key === "availability") ? (
  <div>
    <div className="mb-2 d-flex flex-wrap" style={{ gap: "10px" }}>
      {(key === "favoriteGenres" ? genres : key === "platforms" ? platforms : availabilities).map(option => (
        <div key={option} className="form-check me-3">
          <input
            className="form-check-input"
            type="checkbox"
            id={`${key}-${option}`}
            checked={bio[key].includes(option)}
            onChange={e => {
              const checked = e.target.checked;
              setBio(prev => ({
                ...prev,
                [key]: checked
                  ? [...prev[key], option]
                  : prev[key].filter((v: string) => v !== option)
              }));
            }}
            disabled={saving}
          />
          <label className="form-check-label" htmlFor={`${key}-${option}`}>
            {option}
          </label>
        </div>
      ))}
    </div>
    <button
      className="btn btn-primary"
      onClick={() => saveBioField(key, bio[key])}
      disabled={saving}
    >Done</button>
    {isFieldInvalid(key) && (
      <div className="invalid-feedback d-block">
        This field is required.
      </div>
    )}
  </div>
) 
      // ALL OTHER FIELDS: original chips/tag or text input logic
      : isArray ? (
        <div style={{height: "fit-content"}}>
          <div className="d-flex flex-wrap mb-2">
            {Array.isArray(bio[key]) && bio[key].map((item, idx) => (
              <span
                key={item + idx}
                className="badge bg-light border me-2 mb-2 d-flex align-items-center"
                style={{ color: "#444", fontWeight: 500, fontSize: "1em" }}
              >
                
                {item}
                <FaTimes
                  style={{ marginLeft: 6, cursor: "pointer" }}
                  onClick={() => handleRemoveChip(key, idx)}
                />
              </span>
            ))}
          </div>
          <div className="input-group" >
            <input
              ref={inputRefs[key]}
              type="text"
              className={`form-control${isFieldInvalid(key) ? " is-invalid" : ""}`}
              placeholder={`Add ${label.slice(0, -1).toLowerCase()}...`}
              value={inputValues[key]}
              onChange={e =>
                setInputValues(prev => ({ ...prev, [key]: e.target.value }))
              }
              onKeyDown={e => handleChipInputKeyDown(key, e)}
              disabled={saving}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const pending = inputValues[key].trim();
                let updated = [...bio[key]];
                if (pending && !updated.includes(pending)) {
                  updated.push(pending);
                }
                setInputValues(prev => ({ ...prev, [key]: "" }));
                saveBioField(key, updated);
              }}
              disabled={saving}
            >
              Done
            </button>
          </div>
          {isFieldInvalid(key) && (
            <div className="invalid-feedback d-block">
              This field is required.
            </div>
          )}
        </div>
      ) : (
        <div style={{width: '100%'}}>
          <div className="input-group" >
            <input
              type="text"
              className={`form-control${isFieldInvalid(key) ? " is-invalid" : ""}`}
              value={bio[key] as string}
              onChange={e =>
                setBio(prev => ({ ...prev, [key]: e.target.value }))
              }
              disabled={saving}
            />
            <button
              className="btn btn-primary"
              onClick={() => saveBioField(key, bio[key] as string)}
              disabled={saving}
            >Done</button>
          </div>
          {isFieldInvalid(key) && (
            <div className="invalid-feedback d-block">
              This field is required.
            </div>
          )}
        </div>
      )
    ) : (
      // Display mode (unchanged)
      <div className="d-flex align-items-center flex-wrap" >
        {isArray && Array.isArray(bio[key]) && bio[key].length > 0 ? (
          <span className="me-2" style={{ color: "#444" }}>
            {bio[key].map((item, idx) => (
              <span
                key={item + idx}
                className="badge bg-light border me-2 mb-1 d-inline-flex align-items-center"
                style={{ color: "#444", fontWeight: 500, fontSize: "1em" }}
              >
                {key === "platforms" && platformIcons[item] ? (
                  <span className="me-1">{platformIcons[item]}</span>
                ) : null}
                {item}
              </span>
            ))}
          </span>
        ) : !isArray && typeof bio[key] === "string" ? (
          bio[key] || <span className="text-muted">Not set</span>
        ) : (
          <span className="text-muted">Not set</span>
        )}
        <button
          className="btn btn-sm btn-link p-0 ms-2"
          onClick={() => setEditingField(key)}
          disabled={saving}
          style={{ color: "#0099ff" }}
        >
          <i className="bi bi-pencil"></i>
        </button>
      </div>
    )}
  </div>
))}
        </div>
      </div>
    </div>
  );
}