import { useState } from "react";
import { FaUserTimes } from "react-icons/fa";

type DisconnectButtonProps = {
  friendId: string;
  friendName?: string;
  onDisconnect: (friendId: string) => void;
};

export default function DisconnectButton({ friendId, friendName, onDisconnect }: DisconnectButtonProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (window.confirm(`Are you sure you want to disconnect from ${friendName || "this user"}?`)) {
      setIsDisconnecting(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/connections/disconnect/${friendId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          onDisconnect(friendId);
        } else {
          alert("Failed to disconnect. Please try again.");
        }
      } catch (error) {
        console.error("Error disconnecting:", error);
        alert("An error occurred while disconnecting");
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  return (
    <button 
      className="btn btn-outline-danger btn-sm" 
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      title="Disconnect from this user"
    >
      <FaUserTimes className="me-1" />
      Disconnect
    </button>
  );
}