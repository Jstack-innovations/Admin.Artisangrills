import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Tax.css";
import { API_BASE } from "../Config/api";

type Tax = {
  tax: number;
  delivery_fee: number;
  service_fee: number;
};

export default function TaxPage() {
  const navigate = useNavigate();

  const [tax, setTax] = useState<Tax>({
    tax: 0,
    delivery_fee: 0,
    service_fee: 0
  });
  
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


  const fetchTax = async () => {
    const res = await fetch(
        `${API_BASE}/getTax`
    );
    const data = await res.json();
    setTax(data);
  };

  useEffect(() => {
    fetchTax();
  }, []);

  const updateTax = async () => {

    await fetch(
        `${API_BASE}/adminUpdateTax`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update",
          tax: tax.tax,
          delivery_fee: tax.delivery_fee,
          service_fee: tax.service_fee
        })
      }
    );

    fetchTax();
  };

  const resetTax = async () => {

    await fetch(
        `${API_BASE}/adminUpdateTax`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "delete"
        })
      }
    );

    fetchTax();
  };

  return (

    <div className="tax-page">

      <div className="tax-container">

        <h1>Tax Management</h1>

        <div className="tax-values">
          <p><strong>Tax:</strong> {tax.tax}</p>
          <p><strong>Delivery Fee:</strong> {tax.delivery_fee}</p>
          <p><strong>Service Fee:</strong> {tax.service_fee}</p>
        </div>

        <input
          type="number"
          step="0.01"
          value={tax.tax}
          onChange={(e) =>
            setTax({ ...tax, tax: Number(e.target.value) })
          }
          placeholder="Tax"
        />

        <input
          type="number"
          step="0.01"
          value={tax.delivery_fee}
          onChange={(e) =>
            setTax({ ...tax, delivery_fee: Number(e.target.value) })
          }
          placeholder="Delivery Fee"
        />

        <input
          type="number"
          step="0.01"
          value={tax.service_fee}
          onChange={(e) =>
            setTax({ ...tax, service_fee: Number(e.target.value) })
          }
          placeholder="Service Fee"
        />

        <button className="update-btn" onClick={updateTax}>
          Update Settings
        </button>

        <button className="delete-btn" onClick={resetTax}>
          Reset All
        </button>

      </div>

    </div>
  );
}
