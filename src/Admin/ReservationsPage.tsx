import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Reservations.css";
import { API_BASE } from "../Config/api";

type Table = {
  id: number;
  number: string;
  image: string;
};

type Reservation = {
  id: number;
  table_id: number;
  name: string;
  email: string;
  phone: string;
  booking_date: string;
  transaction_id: string;
  status: number;
  reservation_code: string;
  created_at: string;
};

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  
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

  // Fetch data from PHP API
  const fetchReservations = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/getReservations`
      );
      const data = await res.json();

      // Convert table_id and flatten tables if needed
      const flatTables: Table[] = data.tables.map((t: any) => ({
        id: Number(t.id),
        number: t.number,
        image: t.image,
      }));

      const resData: Reservation[] = data.reservations.map((r: any) => ({
        ...r,
        table_id: Number(r.table_id),
        status: Number(r.status),
      }));

      setTables(flatTables);
      setReservations(resData);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
    }
  };

  // Update reservation
  const handleUpdate = async (reservation: Reservation) => {
    try {
      await fetch(
                `${API_BASE}/adminUpdateReservations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", reservation }),
        }
      );
      fetchReservations();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Delete reservation
  const handleDelete = async (id: number) => {
    try {
      await fetch(
        `${API_BASE}/adminUpdateReservations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id }),
        }
      );
      fetchReservations();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Update a field in state safely
  const updateField = (id: number, field: keyof Reservation, value: any) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="reservations-page">
      <h1>Reservations</h1>
      <div className="grid">
        {reservations.map((r) => {
          const table = tables.find((t) => t.id === r.table_id);

          return (
            <div key={r.id} className="card">
              <img src={table?.image} alt={`Table ${table?.number ?? "?"}`} />
              <h3>Reservation • Table {table?.number ?? "?"}</h3>
              <p>
                <strong>Name:</strong> {r.name}
              </p>
              <p>
                <strong>Email:</strong> {r.email}
              </p>
              <p>
                <strong>Phone:</strong> {r.phone}
              </p>
              <p>
                <strong>Booking Date:</strong> {r.booking_date}
              </p>
              <p>
                <strong>Transaction ID:</strong> {r.transaction_id}
              </p>
              <p>
                <strong>Code:</strong> {r.reservation_code}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(r.created_at).toLocaleString()}
              </p>
              <div className={`status ${r.status === 1 ? "active" : "cancelled"}`}>
                {r.status === 1 ? "Active" : "Cancelled"}
              </div>

              {/* Editable form */}
              <div className="form-row">
                <input
                  value={r.name}
                  onChange={(e) => updateField(r.id, "name", e.target.value)}
                />
                <input
                  value={r.email}
                  onChange={(e) => updateField(r.id, "email", e.target.value)}
                />
              </div>
              <div className="form-row">
                <input
                  value={r.phone}
                  onChange={(e) => updateField(r.id, "phone", e.target.value)}
                />
                <input
                  value={r.booking_date}
                  onChange={(e) => updateField(r.id, "booking_date", e.target.value)}
                />
              </div>
              <div className="form-row">
                <input
                  value={r.transaction_id}
                  onChange={(e) =>
                    updateField(r.id, "transaction_id", e.target.value)
                  }
                />
              </div>
              <div className="form-row">
                <select
                  value={r.status.toString()}
                  onChange={(e) =>
                    updateField(r.id, "status", parseInt(e.target.value))
                  }
                >
                  <option value="1">Active</option>
                  <option value="0">Cancelled</option>
                </select>
                <input
                  value={r.reservation_code}
                  onChange={(e) =>
                    updateField(r.id, "reservation_code", e.target.value)
                  }
                />
              </div>
              <div className="form-row">
                <button className="btn" onClick={() => handleUpdate(r)}>
                  Save
                </button>
                <button className="btn" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
