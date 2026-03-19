import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Banner.css";
import { API_BASE } from "../Config/api";

const GET_URL = `${API_BASE}/GET/CORS/BannerJson.php`;
const SAVE_URL = `${API_BASE}/admins/POST/save_banner.php`;

export default function BannerAdmin() {
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();
  
  
  
  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await fetch(
             `${API_BASE}/admins/GET/check_session.php`,
        { credentials: "include" } // include cookies
      );
      const data = await res.json();

      if (!data.loggedIn) {
        navigate("/login"); // redirect to login if no session
      }
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/login");
    }
  };

  checkSession();
}, [navigate]);




  useEffect(() => {
    fetch(GET_URL)
      .then((res) => res.json())
      .then((data) => setBanner(data));
  }, []);

  const updateAddress = (value) => {
    setBanner({ ...banner, address: value });
  };

  const updateDiscount = (key, value) => {
    setBanner({
      ...banner,
      discount: {
        ...banner.discount,
        [key]: value,
      },
    });
  };

  const save = () => {
    fetch(SAVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(banner),
    });
  };

  if (!banner) return <p>Loading...</p>;

  return (
    <div className="page">
      <h2 className="title">Banner Editor</h2>

      <div className="card">
        <input
          value={banner.address}
          onChange={(e) => updateAddress(e.target.value)}
          placeholder="Address"
        />
      </div>

      <div className="card">
        <input
          value={banner.discount.title}
          onChange={(e) => updateDiscount("title", e.target.value)}
          placeholder="Discount Title"
        />

        <input
          value={banner.discount.subtitle}
          onChange={(e) => updateDiscount("subtitle", e.target.value)}
          placeholder="Discount Subtitle"
        />
      </div>

      <div className="actions">
        <button className="save" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
