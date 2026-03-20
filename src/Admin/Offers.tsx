import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Offers.css";
import { API_BASE } from "../Config/api";

const GET_URL = `${API_BASE}/offer`;
const SAVE_URL = `${API_BASE}/adminOffer`;

type Offer = {
  title: string;
  main: string;
  sub: string;
  bg: string;
  image: string;
};

export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/checkSession`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!data.loggedIn) {
          navigate("/login");
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
      .then((data) => setOffers(data));
  }, []);

  const update = (i: number, key: keyof Offer, value: string) => {
    const copy = [...offers];
    copy[i] = {
      ...copy[i],
      [key]: value,
    };
    setOffers(copy);
  };

  const add = () => {
    setOffers([
      ...offers,
      { title: "", main: "", sub: "", bg: "#fff", image: "" },
    ]);
  };

  const remove = (i: number) => {
    setOffers(offers.filter((_, index) => index !== i));
  };

  const save = () => {
    fetch(SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offers),
    });
  };

  return (
    <div className="page">
      <h2 className="title">Offers Admin Panel</h2>

      {offers.map((o, i) => (
        <div key={i} className="card">
          <input
            value={o.title}
            placeholder="Title"
            onChange={(e) => update(i, "title", e.target.value)}
          />

          <input
            value={o.main}
            placeholder="Main"
            onChange={(e) => update(i, "main", e.target.value)}
          />

          <input
            value={o.sub}
            placeholder="Sub"
            onChange={(e) => update(i, "sub", e.target.value)}
          />

          <input
            value={o.bg}
            placeholder="BG Color"
            onChange={(e) => update(i, "bg", e.target.value)}
          />

          <input
            value={o.image}
            placeholder="Image URL"
            onChange={(e) => update(i, "image", e.target.value)}
          />

          <button className="delete" onClick={() => remove(i)}>
            Delete
          </button>
        </div>
      ))}

      <div className="actions">
        <button onClick={add}>Add Offer</button>
        <button onClick={save} className="save">
          Save Changes
        </button>
      </div>
    </div>
  );
            }
