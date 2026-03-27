import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Banner.css";
import { API_BASE } from "../Config/api";

const GET_URL = `${API_BASE}/banner`;
const SAVE_URL = `${API_BASE}/adminBanner`;

type Banner = {
  address: string;
  discount: {
    title: string;
    subtitle: string;
  };
};

export default function BannerAdmin() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const navigate = useNavigate();
  

  // ✅ Fetch banner and handle 401
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(GET_URL, { credentials: "include" });

        if (res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        setBanner(data);
      } catch (err) {
        console.error("Failed to fetch banner:", err);
        navigate("/login", { replace: true });
      }
    };

    fetchBanner();
  }, [navigate]);

  const updateAddress = (value: string) => {
    if (!banner) return;
    setBanner({ ...banner, address: value });
  };

  const updateDiscount = (key: keyof Banner["discount"], value: string) => {
    if (!banner) return;

    setBanner({
      ...banner,
      discount: {
        ...banner.discount,
        [key]: value,
      },
    });
  };

  // ✅ Save changes and handle 401
  const save = async () => {
    if (!banner) return;

    try {
      const res = await fetch(SAVE_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });

      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      await res.json();
      alert("Banner saved!");
    } catch (err) {
      console.error("Failed to save banner:", err);
      navigate("/login", { replace: true });
    }
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
