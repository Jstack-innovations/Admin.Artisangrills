import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./Config/api";
import "./App.css";

type OrderItem = {
  image: string;
  name: string;
  qty: number;
};

type OrderInfo = {
  order_id: number;
  plate_order_no: string;
  user_id: number;
  name: string;
  phone: string;
  order_type: string;
  table_no?: string;
  total_amount: string;
  payment_ref: string;
  status: string;
  order_status: string;
  full_address?: string;
  pickup_time?: string;
  created_at: string;
};

type Order = {
  info: OrderInfo;
  items: OrderItem[];
};

type Stats = {
  totalPlaced?: number;
  totalServed?: number;
  totalDelivered?: number;
  totalPickup?: number;
  totalRevenue?: number;
};

export default function PaidOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/getOrder`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await res.json();
        setOrders(Object.values(data.orders || {}));
        setStats(data.stats || {});
      } catch (err) {
        console.error(err);
        navigate("/login", { replace: true });
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  const deleteOrder = async (id: number) => {
    if (!confirm("Delete this order?")) return;

    try {
      const res = await fetch(`${API_BASE}/adminDeleteOrder?id=${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.info.order_id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Helpers to show skeleton if not loaded yet
  const renderStat = (value?: number) => (
    <p className={!authChecked ? "skeleton" : ""}>
      {authChecked ? value ?? 0 : ""}
    </p>
  );

  const renderOrders = () => {
    if (!authChecked) {
      // Skeleton rows
      return Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx}>
          {Array.from({ length: 15 }).map((__, jdx) => (
            <td key={jdx} className="skeleton">
              &nbsp;
            </td>
          ))}
        </tr>
      ));
    }

    if (orders.length === 0) {
      return (
        <tr>
          <td colSpan={15}>No orders found</td>
        </tr>
      );
    }

    return orders.map((o) => (
      <tr key={o.info.order_id}>
        <td>{o.info.order_id}</td>
        <td>{o.info.plate_order_no}</td>
        <td>{o.info.user_id}</td>
        <td>
          {o.info.name}
          <br />
          {o.info.phone}
        </td>
        <td>{o.info.order_type.toUpperCase()}</td>
        <td>{o.info.table_no || "-"}</td>
        <td>
          <div className="order-items">
            {(o.items || []).map((i, idx) => (
              <div className="item" key={idx}>
                <img src={i.image} alt="" />
                <div>
                  {i.name} x{i.qty}
                </div>
              </div>
            ))}
          </div>
        </td>
        <td>${parseFloat(o.info.total_amount).toFixed(2)}</td>
        <td>{o.info.payment_ref}</td>
        <td>{o.info.status}</td>
        <td>{o.info.order_status}</td>
        <td>{o.info.full_address || "-"}</td>
        <td>{o.info.pickup_time || "-"}</td>
        <td>{new Date(o.info.created_at).toLocaleString()}</td>
        <td>
          <button
            className="btn"
            onClick={() => navigate(`/edit-order/${o.info.order_id}`)}
          >
            Edit
          </button>
          <button
            className="btn"
            onClick={() => deleteOrder(o.info.order_id)}
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="wrapper">
        <h2>Paid Orders</h2>

        <div className="cards">
          <div className="card">
            <h3>Total Placed Orders</h3>
            {renderStat(stats.totalPlaced)}
          </div>

          <div className="card">
            <h3>Total Served Orders</h3>
            {renderStat(stats.totalServed)}
          </div>

          <div className="card">
            <h3>Total Delivered Orders</h3>
            {renderStat(stats.totalDelivered)}
          </div>

          <div className="card">
            <h3>Total Pickup Orders</h3>
            {renderStat(stats.totalPickup)}
          </div>

          <div className="card">
            <h3>Total Revenue</h3>
            <p className={!authChecked ? "skeleton" : ""}>
              {authChecked
                ? `$${typeof stats.totalRevenue === "number" ? stats.totalRevenue.toFixed(2) : "0.00"}`
                : ""}
            </p>
          </div>
        </div>

        <button className="btn" onClick={() => navigate("/add-order")}>
          Add Order
        </button>

        <div className="scroll-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Plate Order No</th>
                <th>User ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Ref</th>
                <th>Status</th>
                <th>Order Status</th>
                <th>Full Address</th>
                <th>Pickup Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderOrders()}</tbody>
          </table>
        </div>
      </div>
    </>
  );
            }              
