import { useEffect, useState } from "react";
import "./Css/OrderScanner.css";
import { API_BASE } from "../Config/api";
import { Html5Qrcode } from "html5-qrcode";

type Order = {
  name: string;
  phone: string;
  total_amount: string;
  order_status: string;
};

export default function OrderScanner() {
  const [plate, setPlate] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const qr = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then((cams) => {
      if (!cams.length) return;

      const cam =
        cams.find((c) => /back|rear/i.test(c.label)) || cams[0];

      qr.start(
  cam.id,
  {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  },
  (msg) => {
    const match = msg.match(/Plate:\s*(.+)/);

    if (!match) {
      alert("Invalid QR Code");
      return;
    }

    const scannedPlate = match[1].trim();
    setPlate(scannedPlate);

    qr.stop();
    setShowModal(true);
    fetchOrder(scannedPlate);
  },
  (errorMessage) => {
    // REQUIRED for newer html5-qrcode versions
    console.log("QR scan error:", errorMessage);
  }
);
    });

    // cleanup
    return () => {
      try {
        qr.stop();
        qr.clear();
      } catch (e) {}
    };
  }, []);

  // FIXED: GET request with query param (NO BODY)
  const fetchOrder = async (plate: string) => {
    const res = await fetch(
      `${API_BASE}/fetchOrder?tracking_number=${plate}`
    );

    const data = await res.json();

    if (!data.name) {
      alert("Order not found");
      window.location.reload();
      return;
    }

    setOrder(data);
    setStatus(data.order_status);
  };

  const updateStatus = async () => {
    await fetch(`${API_BASE}/adminUpdateOrderStatus`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `plate=${plate}&status=${status}`,
    });

    alert("Status updated successfully");
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Order Scanner</h2>

      <div id="reader" style={{ maxWidth: 400, margin: "auto" }} />

      {showModal && order && (
        <div className="modal">
          <div className="modal-content">
            <h3>Order Details</h3>

            <p><b>Name:</b> {order.name}</p>
            <p><b>Phone:</b> {order.phone}</p>
            <p><b>Total:</b> ₦{order.total_amount}</p>
            <p><b>Status:</b> {order.order_status}</p>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Order placed</option>
              <option>Cooking</option>
              <option>Cooking done</option>
              <option>Out for delivery</option>
              <option>Delivered</option>
              <option>Served</option>
              <option>Picked up</option>
            </select>

            <p>Plate: {plate}</p>

            <button onClick={updateStatus}>Update Status</button>
            <button onClick={() => window.location.reload()}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
