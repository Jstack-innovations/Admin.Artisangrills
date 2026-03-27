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


  useEffect(() => {
    fetch(GET_URL)
      .then((res) => res.json())
      .then((data) => setBanner(data));
  }, []);

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

  const save = () => {
    if (!banner) return;

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
