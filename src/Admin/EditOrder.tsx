import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Css/EditOrder.css";
import { API_BASE } from "../Config/api";

type Order = {
  name: string;
  phone: string;
  table_no: string;
  order_type: string;
  total_amount: string;
  payment_ref: string;
  order_status: string;
  full_address: string;
  plate_order_no: string;
};

export default function EditOrder() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/admins/GET/check_session.php`,
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
    if (!id) return;

    fetch(`${API_BASE}/admins/PUT/edit_order.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setOrder(prev =>
      prev ? { ...prev, [e.target.name]: e.target.value } : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !id) return;

    await fetch(`${API_BASE}/admins/PUT/edit_order.php?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    alert("Order updated!");
    navigate("/");
  };

  if (loading || !order) return <div>Loading...</div>;

  return (
    <div className="wrapper">
      <div className="form-card">
        <h2>Edit Order</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          {Object.entries(order as Record<string, string>).map(
            ([key, value]) => (
              <div key={key}>
                <label>{key.replace(/_/g, " ").toUpperCase()}</label>

                {key === "order_type" || key === "order_status" ? (
                  <select
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required
                  >
                    {key === "order_type" && (
                      <>
                        <option value="table">Table</option>
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                      </>
                    )}

                    {key === "order_status" && (
                      <>
                        <option value="Order placed">Order placed</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Cooking done">Cooking done</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Served">Served</option>
                        <option value="Picked up">Picked up</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input name={key} value={value} onChange={handleChange} />
                )}
              </div>
            )
          )}

          <div className="btn-row">
            <button type="submit" className="btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
                }
