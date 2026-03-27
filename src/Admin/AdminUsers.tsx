import { useEffect,useState } from "react";    
import { useNavigate } from "react-router-dom";    
import "./Css/AdminUsers.css";    
import { API_BASE } from "../Config/api";    
    
export default function AdminUsers(){    
  const navigate = useNavigate();    
    
  const [users,setUsers] = useState<any[]>([]);    
  const [verifications,setVerifications] = useState<any[]>([]);    
  const [editUser,setEditUser] = useState<any>(null);    
    
    
  const API = `${API_BASE}/UandV`;    
    
  useEffect(()=>{    
    fetch(API,{credentials:"include"})    
      .then(async res => {
        const data = await res.json();

        if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
          navigate("/login", { replace: true });
          return;
        }

        setUsers(data.users || []);    
        setVerifications(data.verifications || []);    
      })    
      .catch(err=>{
        console.error(err);
        navigate("/login", { replace: true });
      });    
  },[]);    
    
    
  function startEdit(user:any){    
    setEditUser({...user});    
  }    
    
    
  function saveEdit(){    
    fetch(`${API_BASE}/adminUpdateUser`, {    
      method:"PUT",    
      headers:{ "Content-Type":"application/json" },    
      credentials:"include",
      body:JSON.stringify(editUser)    
    })    
    .then(async res => {
      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      if(data.success){    
        setUsers(users.map(u => u.id === editUser.id ? editUser : u));    
        setEditUser(null);    
      } else {
        alert("Update failed: " + data.error);
      }
    })
    .catch(err=>{
      console.error("Save edit failed:", err);
      navigate("/login", { replace: true });
    });    
  }    
    
  function deleteUser(id:number){    
    if(!confirm("Delete this user?")) return;    
    
    fetch(`${API_BASE}/adminDeleteUser`, {    
      method:"DELETE",    
      headers:{ "Content-Type":"application/json" },    
      credentials:"include",
      body:JSON.stringify({id})    
    })    
    .then(async res => {
      const data = await res.json();

      if (res.status === 401 || data.error === "Unauthorized" || data.error === "Session expired") {
        navigate("/login", { replace: true });
        return;
      }

      if(data.success){    
        setUsers(users.filter(u => u.id !== id));    
      } else {
        alert("Delete failed: " + data.error);
      }
    })
    .catch(err=>{
      console.error("Delete failed:", err);
      navigate("/login", { replace: true });
    });    
  }    
    
  return(    
    <div className="admin-page">    
      <h2>Users</h2>    
      <div className="table-box">    
        <table>    
          <thead>    
            <tr>    
              <th>ID</th>    
              <th>Name</th>    
              <th>Email</th>    
              <th>Phone</th>    
              <th>Status</th>    
              <th>Actions</th>    
            </tr>    
          </thead>    
          <tbody>    
            {users.map((user:any)=>{    
              const editing = editUser?.id === user.id;    
              return(    
                <tr key={user.id}>    
                  <td>{user.id}</td>    
                  <td>    
                    {editing ?    
                      <input    
                        value={editUser.full_name}    
                        onChange={e=>setEditUser({...editUser,full_name:e.target.value})}    
                      />    
                    : user.full_name}    
                  </td>    
                  <td>    
                    {editing ?    
                      <input    
                        value={editUser.email}    
                        onChange={e=>setEditUser({...editUser,email:e.target.value})}    
                      />    
                    : user.email}    
                  </td>    
                  <td>    
                    {editing ?    
                      <input    
                        value={editUser.phone}    
                        onChange={e=>setEditUser({...editUser,phone:e.target.value})}    
                      />    
                    : user.phone}    
                  </td>    
                  <td>    
                    {editing ?    
                      <select    
                        value={editUser.status}    
                        onChange={e=>setEditUser({...editUser,status:e.target.value})}    
                      >    
                        <option value="pending">pending</option>    
                        <option value="active">active</option>    
                      </select>    
                    : user.status}    
                  </td>    
                  <td>    
                    {editing ?    
                      <button onClick={saveEdit}>Save</button>    
                    :    
                      <>    
                        <button onClick={()=>startEdit(user)}>Edit</button>    
                        <button    
                          style={{marginLeft:"8px",color:"red"}}    
                          onClick={()=>deleteUser(user.id)}    
                        >    
                          Delete    
                        </button>    
                      </>    
                    }    
                  </td>    
                </tr>    
              );    
            })}    
          </tbody>    
        </table>    
      </div>    
      <h2 style={{marginTop:"30px"}}>Login Verifications</h2>    
      <div className="table-box">    
        <table>    
          <thead>    
            <tr>    
              <th>ID</th>    
              <th>User</th>    
              <th>Email</th>    
              <th>Code</th>    
              <th>Attempts</th>    
              <th>Expires</th>    
            </tr>    
          </thead>    
          <tbody>    
            {verifications.map((v:any)=>(    
              <tr key={v.id}>    
                <td>{v.id}</td>    
                <td>{v.full_name}</td>    
                <td>{v.email}</td>    
                <td>{v.code}</td>    
                <td>{v.attempts}</td>    
                <td>{v.expires_at}</td>    
              </tr>    
            ))}    
          </tbody>    
        </table>    
      </div>    
    </div>    
  );    
          }
