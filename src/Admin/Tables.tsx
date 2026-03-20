import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Tables.css";
import { API_BASE } from "../Config/api";

type Table = {
  id: number;
  number: string;
  seats: number;
  description: string;
  image: string;
  booked: number;
  booked_id: number | null;
};

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/checkSession`,
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

  const fetchTables = async () => {
    const res = await fetch(        `${API_BASE}/getTable`);
    const data = await res.json();
    setTables(data.tables);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleUpdate = async (table: Table, booked: number) => {
  // Optimistically update UI
  setTables(prev =>
    prev.map(t => t.id === table.id ? { ...t, booked } : t)
  );

  const res = await fetch(
        `${API_BASE}/adminUpdateTable`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: table.id,
        booked_id: table.booked_id,
        action: "update",
        booked,
      }),
    }
  );
  const data = await res.json();
  if (!data.success) {
    alert("Update failed: " + data.error);
    // Revert UI if update failed
    setTables(prev =>
      prev.map(t => t.id === table.id ? { ...t, booked: table.booked } : t)
    );
  }
};

  const handleDelete = async (table: Table) => {
    if (!table.booked_id) return alert("Nothing to delete");
    const res = await fetch(`${API_BASE}/adminUpdateTable`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, booked_id: table.booked_id, action: "delete" }),
    });
    const data = await res.json();
    if (data.success) fetchTables();
    else alert("Delete failed: " + data.error);
  };

  return (
    <div>
      {/* HEADER */}
      <header>
        <div className="brand">ARTISAN <span>GRILLS</span></div>
        <nav className="nav">
        <a href="/">All Orders</a>
        <a href="/tables">Available Tables</a>
        <a href="/menu">Add Menu</a>
        <a href="/tax">Set Tax</a>
        <a href="/check-reservations">View Reservations</a>
        </nav>
        <button className={`hamburger ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "" : "hidden"}`}>
        <a href="/">All Orders</a>
        <a href="/tables">Available Tables</a>
        <a href="/menu">Add Menu</a>
        <a href="/tax">Set Tax</a>
        <a href="/check-reservations">View Reservations</a>
      </div>

      {/* TABLE GRID */}
      <div className="wrapper">
        <div className="table-grid">
          {tables.map((table) => (
            <div className="card" key={table.id}>
              <img src={table.image} alt={`Table ${table.number}`} />
              <h3>Table {table.number} • {table.seats} seats</h3>
              <p>{table.description}</p>
              <div className={`status ${table.booked ? "booked" : "available"}`}>
  {table.booked ? "Booked" : "Available"}
</div>
              <div className="form-row">
                <select value={table.booked} onChange={e => handleUpdate(table, parseInt(e.target.value))}>
                  <option value={0}>Available</option>
                  <option value={1}>Booked</option>
                </select>
                <button className="btn" onClick={() => handleDelete(table)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
