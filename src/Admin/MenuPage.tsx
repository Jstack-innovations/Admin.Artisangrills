import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Menu.css";
import { API_BASE } from "../Config/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  badge?: string;
  available: boolean;
};

type Menu = Record<string, MenuItem[]>;

export default function MenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu>({});
  const [form, setForm] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    image: "",
    tags: "",
    badge: "",
    available: "1",
  });
  const [hamburgerActive, setHamburgerActive] = useState(false);

  // GET menu is free
  const fetchMenu = async () => {
    const res = await fetch(`${API_BASE}/getMenu`);
    const data = await res.json();
    setMenu(data.menu);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ✅ Guarded Add
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          category: form.category,
          name: form.name,
          description: form.description,
          price: form.price,
          image: form.image,
          tags: form.tags.split(","),
          badge: form.badge,
          available: form.available === "1",
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      fetchMenu();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  // ✅ Guarded Update
  const handleUpdate = async (category: string, item: MenuItem) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          category,
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          tags: item.tags,
          badge: item.badge,
          available: item.available,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      fetchMenu();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // ✅ Guarded Delete
  const handleDelete = async (category: string, id: number) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateMenu`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          category,
          id,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }
      fetchMenu();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="menu-page">
      {/* Header, mobile menu, and add form remain the same */}
      {/* ... */}

      <div className="container">
        <div className="add-form">
          <h2>Add New Menu Item</h2>
          <form onSubmit={handleAdd}>
            {/* form fields unchanged */}
            <button className="btn" type="submit">Add Item</button>
          </form>
        </div>

        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="category">
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div className="grid">
              {items.map((item) => (
                <div key={item.id} className="card">
                  {/* item display fields unchanged */}
                  <div className="form-rowT">
                    <select
                      value={item.available ? "1" : "0"}
                      onChange={(e) => {
                        const newItems = menu[category].map((i) =>
                          i.id === item.id ? { ...i, available: e.target.value === "1" } : i
                        );
                        setMenu({ ...menu, [category]: newItems });
                      }}
                    >
                      <option value="1">Available</option>
                      <option value="0">Not Available</option>
                    </select>
                    <button className="btn" onClick={() => handleUpdate(category, item)}>Update</button>
                  </div>
                  <button className="btn" onClick={() => handleDelete(category, item.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
      }
