import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../Config/Utils/api";
import "./Css/AdminLogin.css";

type Admin = { id: number; email: string; password: string };

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [admins,setAdmins] = useState<Admin[]>([]);

  // Fetch admins
  useEffect(() => {
  const fetchAdmins = async () => {
    const res = await apiFetch("/admin");
    if (!res) return; // apiFetch already handled 401
    const data = await res.json();
    // handle both array or object with admins
    setAdmins(Array.isArray(data) ? data : data.admins || []);
  };
  fetchAdmins();
}, []);

  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const res = await apiFetch("/adminLogin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res) return; // apiFetch redirects if 401
    const data = await res.json();

    if (data.success) {
      navigate("/");
    } else {
      setError(data.error || "Invalid email or password");
    }
  } catch (err) {
    console.error(err);
    setError("Login failed. Try again.");
  }
};

  return(

   <div className="admin-login-wrapper">
  <div className="login-box">
    <div className="brand">ARTISAN <span>GRILLS</span></div>
    {error && <div className="error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <label>Email</label>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
    <div className="test-box">
      <h4 style={{ color: "#d6a86a" }}>Admins (Test Mode)</h4>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.email}</td>
              <td>{a.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );

}
