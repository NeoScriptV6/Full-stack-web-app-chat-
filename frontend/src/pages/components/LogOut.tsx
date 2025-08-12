import { useNavigate } from "react-router-dom";

export default function LogOut() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <button
      className="btn btn-outline-danger btn-sm"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 10,
        fontWeight: 600,
        letterSpacing: 1,
        padding: "0.25rem 0.75rem",
      }}
      onClick={handleLogout}
      aria-label="Log out"
    >
      <i className="bi bi-box-arrow-right me-2"></i>
      Log out
    </button>
  );
}