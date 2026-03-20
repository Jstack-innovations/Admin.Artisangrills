import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../Config/api";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch(
        `${API_BASE}/adminLogout`,
          {
            method: "POST",
            credentials: "include", // important to send session cookies
          }
        );
      } catch (err) {
        console.error("Logout failed:", err);
      } finally {
        navigate("/login"); // redirect to login page
      }
    };

    doLogout();
  }, [navigate]);

  return <div></div>;
}
