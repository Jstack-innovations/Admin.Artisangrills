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
  amount: number;
};

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);


  // ---- FETCH TABLES ----
  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE}/getTable`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      const allTables = Object.values(data.floors || {}).flat();
      setTables(allTables as Table[]);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ---- UPDATE TABLE ----
  const handleTableEdit = async (table: Table) => {
    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "edit",
          id: table.id,
          number: table.number,
          seats: table.seats,
          description: table.description,
          image: table.image,
          amount: table.amount,
        }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      if (!data.success) {
        alert("Update failed: " + data.error);
        fetchTables();
      }
    } catch (err) {
      console.error("Update failed:", err);
      navigate("/login", { replace: true });
    }
  };

  const handleUpdate = async (table: Table, booked: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, booked } : t))
    );

    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: table.id,
          booked_id: table.booked_id,
          action: "update",
          booked,
        }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      if (!data.success) {
        alert("Update failed: " + data.error);
        setTables((prev) =>
          prev.map((t) =>
            t.id === table.id ? { ...t, booked: table.booked } : t
          )
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
      navigate("/login", { replace: true });
    }
  };

  const handleDelete = async (table: Table) => {
    if (!table.booked_id) return alert("Nothing to delete");

    try {
      const res = await fetch(`${API_BASE}/adminUpdateTable`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: table.id,
          booked_id: table.booked_id,
          action: "delete",
        }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      if (data.success) fetchTables();
      else alert("Delete failed: " + data.error);
    } catch (err) {
      console.error("Delete failed:", err);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div>
      {/* HEADER */}
      <header>
        <div className="brand">
          ARTISAN <span>GRILLS</span>
        </div>

        <nav className="nav">
          <a href="/">All Orders</a>
          <a href="/tables">Available Tables</a>
          <a href="/menu">Add Menu</a>
          <a href="/tax">Set Tax</a>
          <a href="/check-reservations">View Reservations</a>
        </nav>

        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
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

              <h3>
                Table {table.number} • {table.seats} seats
              </h3>

              <p>{table.description}</p>

              <p>
                <strong>Amount:</strong> ₦{table.amount}
              </p>

              <div className={`status ${table.booked ? "booked" : "available"}`}>
                {table.booked ? "Booked" : "Available"}
              </div>

              {/* EDIT FIELDS */}
              <div className="form-row">
                <input
                  value={table.number}
                  onChange={(e) =>
                    setTables((prev) =>
                      prev.map((t) =>
                        t.id === table.id
                          ? { ...t, number: e.target.value }
                          : t
                      )
                    )
                  }
                />

                <input
                  type="number"
                  value={table.seats}
                  onChange={(e) =>
                    setTables((prev) =>
                      prev.map((t) =>
                        t.id === table.id
                          ? { ...t, seats: parseInt(e.target.value) }
                          : t
                      )
                    )
                  }
                />
              </div>

              <div className="form-row">
                <input
                  value={table.image}
                  onChange={(e) =>
                    setTables((prev) =>
                      prev.map((t) =>
                        t.id === table.id
                          ? { ...t, image: e.target.value }
                          : t
                      )
                    )
                  }
                />
              </div>

              <div className="form-row">
                <input
                  value={table.description}
                  onChange={(e) =>
                    setTables((prev) =>
                      prev.map((t) =>
                        t.id === table.id
                          ? { ...t, description: e.target.value }
                          : t
                      )
                    )
                  }
                />
              </div>

              {/* AMOUNT EDIT */}
              <div className="form-row">
                <input
                  type="number"
                  value={table.amount}
                  onChange={(e) =>
                    setTables((prev) =>
                      prev.map((t) =>
                        t.id === table.id
                          ? { ...t, amount: parseFloat(e.target.value) }
                          : t
                      )
                    )
                  }
                />
              </div>

              {/* BOOKING */}
              <div className="form-rowT">
                <select
                  value={table.booked}
                  onChange={(e) =>
                    handleUpdate(table, parseInt(e.target.value))
                  }
                >
                  <option value={0}>Available</option>
                  <option value={1}>Booked</option>
                </select>

                <button className="btn" onClick={() => handleDelete(table)}>
                  Delete
                </button>
              </div>

              <button className="btn" onClick={() => handleTableEdit(table)}>
                Save Changes
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                      }
