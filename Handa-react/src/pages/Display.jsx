import { useState, useEffect } from "react";
import { auth } from "../components/firebase.js";

export default function Display({ onLogout }) {
  const [supplies, setSupplies] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editID, setEditID] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestActionId, setRequestActionId] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
  const api = `${API_BASE_URL}/api/supplies`;

  async function authorizedFetch(url, options = {}) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Please sign in again.");
    // Force-refresh the Firebase ID token to avoid sending an expired cached token.
    const token = await currentUser.getIdToken(true);
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  }

  async function throwApiError(response, fallbackMessage) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `${fallbackMessage} (HTTP ${response.status})`);
  }

  function getSupplyStatus(supply) {
    if (supply.status && supply.status.trim()) return supply.status;
    return Number(supply.quantity) <= 15 ? "Low Stock" : "Available";
  }

  async function getSupplies() {
    try {
      setError("");
      const response = await authorizedFetch(api);
      if (!response.ok) await throwApiError(response, "Failed to load emergency supplies.");
      const data = await response.json();
      setSupplies(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function getSupplyRequests() {
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/api/admin/supply-requests`);
      if (!response.ok) await throwApiError(response, "Failed to load supply requests.");
      setSupplyRequests(await response.json());
    } catch (err) {
      setError(err.message || "Unable to load supply requests.");
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    getSupplies();
    getSupplyRequests();
    const refreshId = window.setInterval(() => {
      getSupplies();
      getSupplyRequests();
    }, 15000);
    return () => window.clearInterval(refreshId);
  }, []);

  async function updateSupplyRequest(id, status) {
    setRequestActionId(id);
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/api/admin/supply-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) await throwApiError(response, "Failed to update request.");
      await getSupplyRequests();
    } catch (err) {
      setError(err.message || "Unable to update supply request.");
    } finally {
      setRequestActionId(null);
    }
  }

  async function releaseSupplyRequest(id) {
    if (!window.confirm("Release this approved supply request and deduct its quantity from inventory?")) return;
    setRequestActionId(id);
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/api/admin/supply-requests/${id}/release`, { method: "POST" });
      if (!response.ok) await throwApiError(response, "Failed to release supply request.");
      await Promise.all([getSupplyRequests(), getSupplies()]);
    } catch (err) {
      setError(err.message || "Unable to release supply request.");
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await authorizedFetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, quantity })
      });
      if (!response.ok) await throwApiError(response, "Failed to add supply.");
      setName("");
      setCategory("");
      setQuantity("");
      await getSupplies();
    } catch (err) {
      setError(err.message || "Unable to add supply. Please try again.");
      console.error(err);
    }
  }

  function openEditModal(supply) {
    setEditID(supply.id);
    setEditName(supply.name);
    setEditCategory(supply.category);
    setEditQuantity(String(supply.quantity));
    setIsEditModalOpen(true);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await authorizedFetch(`${api}/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, category: editCategory, quantity: editQuantity })
      });
      if (!response.ok) await throwApiError(response, "Failed to update supply.");
      setIsEditModalOpen(false);
      await getSupplies();
    } catch (err) {
      setError(err.message || "Unable to update supply. Please try again.");
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this supply?")) return;
    try {
      const response = await authorizedFetch(`${api}/${id}`, { method: "DELETE" });
      if (!response.ok) await throwApiError(response, "Failed to delete supply.");
      await getSupplies();
    } catch (err) {
      setError(err.message || "Unable to delete supply. Please try again.");
      console.error(err);
    }
  }

  const lowStockCount = supplies.filter((supply) => getSupplyStatus(supply) === "Low Stock").length;
  const totalQuantity = supplies.reduce((total, supply) => total + Number(supply.quantity || 0), 0);

  return (
    <div className="container-fluid display-page py-4 py-md-5 px-3 px-lg-5">
      <style>{`
        .display-page { width: 100%; max-width: 100%; margin: 0 auto; --supply-green: #16834a; --supply-green-dark: #11683a; --supply-green-light: #eaf6ee; --supply-border: #e1eae3; color: #263b2e; }
        .supply-page-title { color: #173c29; font-weight: 800; letter-spacing: -.035em; }
        .supply-page-subtitle { color: #718076; }
        .supply-card { width: 100%; margin-bottom: 28px !important; background: #fff; border: 1px solid var(--supply-border); border-radius: 17px; overflow: hidden; box-shadow: 0 6px 24px rgba(23,60,41,.055); }
        .supply-card-header { min-height: 68px; background: #fff; border-bottom: 1px solid var(--supply-border); padding: 19px 24px; color: #244b34; font-weight: 800; }
        .supply-section-icon { width: 37px; height: 37px; border-radius: 11px; background: var(--supply-green-light); color: var(--supply-green); display: inline-grid; place-items: center; margin-right: 11px; }
        .supply-form-label { font-size: .84rem; font-weight: 700; color: #405548; margin-bottom: 8px; }
        .display-page .form-control, .display-page .form-select { width: 100%; min-height: 50px; border-radius: 10px; border-color: #dce6df; font-size: .9rem; }
        .display-page .form-control:focus, .display-page .form-select:focus { border-color: var(--supply-green); box-shadow: 0 0 0 .2rem rgba(22,131,74,.13); }
        .supply-add-btn { min-height: 46px; border-radius: 10px; background: var(--supply-green); border-color: var(--supply-green); font-weight: 700; }
        .supply-add-btn:hover { background: var(--supply-green-dark); border-color: var(--supply-green-dark); }
        .supply-tip { background: #f1f8f3; border: 1px solid #dcefe2; color: #52705c; border-radius: 11px; padding: 12px 15px; font-size: .84rem; }
        .supply-stat { min-height: 104px; height: 100%; border: 1px solid var(--supply-border); border-radius: 14px; padding: 16px 18px; background: #fff; box-shadow: 0 4px 15px rgba(23,60,41,.035); }
        .supply-stat-label { color: #718076; font-size: .78rem; font-weight: 700; }
        .supply-stat-value { color: #203d2b; font-size: 1.55rem; font-weight: 800; line-height: 1.25; }
        .supply-table { width: 100%; min-width: 0; table-layout: fixed; }\n        .supply-table th:nth-child(1), .supply-table td:nth-child(1) { width: 7%; }\n        .supply-table th:nth-child(2), .supply-table td:nth-child(2) { width: 23%; }\n        .supply-table th:nth-child(3), .supply-table td:nth-child(3) { width: 19%; }\n        .supply-table th:nth-child(4), .supply-table td:nth-child(4) { width: 10%; }\n        .supply-table th:nth-child(5), .supply-table td:nth-child(5) { width: 17%; }\n        .supply-table th:nth-child(6), .supply-table td:nth-child(6) { width: 24%; }\n        .supply-table th, .supply-table td { overflow-wrap: anywhere; }\n        .supply-table .supply-name-cell { min-width: 0; }\n        .supply-table .supply-name-cell span:last-child { min-width: 0; overflow-wrap: anywhere; }\n        .supply-table .supply-actions { display: flex; justify-content: center; align-items: center; gap: 6px; flex-wrap: wrap; }\n        .supply-table .supply-actions .btn { margin: 0 !important; padding: 5px 8px; font-size: .76rem; }
        .supply-table thead th { padding: 14px 10px; background: #f0f7f2; color: #355342; border-bottom: 1px solid #dfeae2; font-size: .78rem; font-weight: 800; letter-spacing: .035em; text-transform: uppercase; padding: 15px 17px; white-space: normal; }
        .supply-table tbody td { padding: 16px 10px; vertical-align: middle; color: #405448; font-size: .88rem; border-color: #edf2ee; }
        .supply-table tbody tr:hover { background: #f8fbf9; }
        .supply-table th:nth-child(1), .supply-table td:nth-child(1) { width: 8%; }
        .supply-table th:nth-child(2), .supply-table td:nth-child(2) { width: 23%; }
        .supply-table th:nth-child(3), .supply-table td:nth-child(3) { width: 21%; }
        .supply-table th:nth-child(4), .supply-table td:nth-child(4) { width: 12%; }
        .supply-table th:nth-child(5), .supply-table td:nth-child(5) { width: 16%; }
        .supply-table th:nth-child(6), .supply-table td:nth-child(6) { width: 20%; }
        .supply-card .table-responsive { width: 100%; max-width: 100%; overflow-x: auto; padding: 0 22px 18px; }
        .supply-card .supply-table { display: table; width: 100% !important; min-width: 100% !important; max-width: 100%; table-layout: fixed; margin: 0; }
        .supply-card .supply-table thead th { padding: 15px 14px; }
        .supply-card .supply-table tbody td { padding: 17px 14px; }
        .supply-card .supply-table tbody tr:last-child td { border-bottom: 0; }
        .supply-card .supply-table .supply-actions { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: nowrap; width: 100%; margin: 0 auto; }
        .supply-card .supply-table .supply-actions-cell { text-align: center !important; vertical-align: middle; }
        .supply-card .supply-table .supply-action { min-width: 78px; margin: 0 !important; }
        @media (max-width: 767.98px) {
          .supply-card .table-responsive { padding: 0 12px 12px; }
          .supply-card .supply-table { min-width: 760px !important; width: 760px !important; table-layout: auto; }
        }
        .supply-table .supply-action { padding: 7px 10px; }
        .request-action { border-radius: 8px; font-weight: 700; letter-spacing: .01em; padding: 7px 11px; display: inline-flex; align-items: center; gap: 5px; transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease; }
        .request-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,.12); }
        .request-action:disabled { opacity: .6; cursor: wait; }
        .request-approve { background: #198754; border-color: #198754; color: #fff; }
        .request-approve:hover:not(:disabled) { background: #146c43; border-color: #146c43; color: #fff; }
        .request-reject { background: #dc3545; border-color: #dc3545; color: #fff; }
        .request-reject:hover:not(:disabled) { background: #b02a37; border-color: #b02a37; color: #fff; }
        .request-release { background: #0d6efd; border-color: #0d6efd; color: #fff; }
        .request-release:hover:not(:disabled) { background: #0a58ca; border-color: #0a58ca; color: #fff; }
        .supply-id { display: inline-flex; min-width: 32px; height: 30px; align-items: center; justify-content: center; border-radius: 8px; background: #f0f4f1; color: #52665a; font-weight: 700; font-size: .8rem; }
        .supply-name-icon { width: 36px; height: 36px; border-radius: 10px; background: #eaf6ee; color: #16834a; display: inline-grid; place-items: center; flex-shrink: 0; }
        .supply-category { display: inline-block; background: #f2f5f3; color: #52665a; border-radius: 8px; padding: 6px 9px; font-size: .78rem; font-weight: 600; }
        .supply-quantity { display: inline-flex; min-width: 38px; justify-content: center; padding: 6px 10px; border-radius: 8px; background: #f2f7f3; color: #315c40; font-weight: 800; }
        .supply-status { display: inline-flex; align-items: center; gap: 5px; border-radius: 30px; font-size: .74rem; font-weight: 700; padding: 7px 11px; white-space: nowrap; }
        .supply-low-stock { background: #fff0ed; color: #c04a3c; }
        .supply-in-stock { background: #eaf6ee; color: #16834a; }
        .supply-action { border-radius: 8px; font-weight: 700; }
        .supply-reminder { border: 1px solid #cfe4d5; background: #f1f8f3; color: #2f6843; border-radius: 14px; }
        @media (max-width: 767.98px) { .supply-table { min-width: 760px !important; table-layout: auto; } .supply-table th, .supply-table td { width: auto !important; } }
        @media (max-width: 575.98px) { .display-page { padding-left: 14px !important; padding-right: 14px !important; } .supply-card-header { padding: 15px; } .supply-table tbody td { padding: 14px; } }
      `}</style>

      <header className="mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 54, height: 54, background: "#eaf6ee", color: "#16834a", fontSize: "1.4rem" }}>
              <i className="bi bi-box-seam" />
            </div>
            <div>
              <h2 className="supply-page-title mb-1">Emergency Supplies</h2>
              <p className="supply-page-subtitle mb-0">Manage and monitor your emergency inventory.</p>
            </div>
          </div>
          <button type="button" className="btn btn-outline-danger rounded-3 fw-semibold px-3 py-2" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-2" />Logout
          </button>
        </div>
      </header>

      {error && <div className="alert alert-warning rounded-3" role="alert"><i className="bi bi-exclamation-triangle-fill me-2" />{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="supply-stat d-flex align-items-center gap-3">
            <span className="supply-section-icon mb-0"><i className="bi bi-box-seam fs-5" /></span>
            <div><div className="supply-stat-label">Total Items</div><div className="supply-stat-value">{supplies.length}</div></div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="supply-stat d-flex align-items-center gap-3">
            <span className="supply-section-icon mb-0"><i className="bi bi-stack fs-5" /></span>
            <div><div className="supply-stat-label">Total Quantity</div><div className="supply-stat-value">{totalQuantity}</div></div>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="supply-stat d-flex align-items-center gap-3">
            <span className="supply-section-icon mb-0" style={{ background: "#fff0ed", color: "#c04a3c" }}><i className="bi bi-exclamation-circle fs-5" /></span>
            <div><div className="supply-stat-label">Low Stock Items</div><div className="supply-stat-value">{lowStockCount}</div></div>
          </div>
        </div>
      </div>

      <section className="supply-card mb-4">
        <div className="supply-card-header d-flex align-items-center">
          <span className="supply-section-icon"><i className="bi bi-plus-circle" /></span>
          Add Emergency Supply
        </div>
        <div className="card-body p-3 p-md-4">
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            <div className="col-12 col-md-4">
              <label className="form-label supply-form-label"><i className="bi bi-box-seam me-2 text-success" />Supply Name</label>
              <input type="text" className="form-control" placeholder="Enter supply name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label supply-form-label"><i className="bi bi-tag me-2 text-success" />Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select category</option>
                <option value="Food and Water">Food and Water</option>
                <option value="Medical">Medical</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Lighting">Lighting</option>
                <option value="Clothing and Shelter">Clothing and Shelter</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label supply-form-label"><i className="bi bi-hash me-2 text-success" />Quantity</label>
              <input type="number" className="form-control" placeholder="Quantity" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button type="submit" className="btn btn-success supply-add-btn"><i className="bi bi-plus-lg me-2" />Add Supply</button>
            </div>
          </form>
          <div className="supply-tip mt-4"><i className="bi bi-info-circle-fill me-2" />Keep your inventory updated so essential supplies are ready when needed.</div>
        </div>
      </section>

      <section className="supply-card mb-4">
        <div className="supply-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center"><span className="supply-section-icon"><i className="bi bi-clipboard2-check" /></span>Emergency Supply List</div>
          <span className="small text-secondary">{supplies.length} record{supplies.length === 1 ? "" : "s"}</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover supply-table mb-0">
            <thead><tr><th>ID</th><th>Supply Name</th><th>Category</th><th>Quantity</th><th>Status</th><th className="text-center">Actions</th></tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5 text-secondary"><span className="spinner-border spinner-border-sm text-success me-2" role="status" />Loading emergency supplies...</td></tr>
              ) : supplies.map((supply) => {
                const status = getSupplyStatus(supply);
                const isLowStock = status === "Low Stock";
                return (
                  <tr key={supply.id}>
                    <td><span className="supply-id">{supply.id}</span></td>
                    <td><div className="d-flex align-items-center gap-2 supply-name-cell"><span className="supply-name-icon"><i className="bi bi-box-seam" /></span><span className="fw-bold text-dark">{supply.name}</span></div></td>
                    <td><span className="supply-category">{supply.category}</span></td>
                    <td><span className="supply-quantity">{supply.quantity}</span></td>
                    <td><span className={`supply-status ${isLowStock ? "supply-low-stock" : "supply-in-stock"}`}><i className={`bi ${isLowStock ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} />{status}</span></td>
                    <td className="supply-actions-cell">
                      <div className="supply-actions">
                        <button type="button" className="btn btn-sm btn-outline-success supply-action" onClick={() => openEditModal(supply)}><i className="bi bi-pencil me-1" />Edit</button>
                        <button type="button" className="btn btn-sm btn-outline-danger supply-action" onClick={() => handleDelete(supply.id)}><i className="bi bi-trash me-1" />Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && supplies.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-secondary"><i className="bi bi-inbox fs-2 d-block mb-2" />No emergency supplies found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="supply-card mb-4">
        <div className="supply-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center"><span className="supply-section-icon"><i className="bi bi-clipboard-check" /></span>Client Supply Requests</div>
          <span className="small text-secondary">{supplyRequests.length} request{supplyRequests.length === 1 ? "" : "s"}</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover supply-table mb-0">
            <thead><tr><th>Client</th><th>Supply</th><th>Qty</th><th>Date</th><th>Status</th><th>Admin Actions</th></tr></thead>
            <tbody>
              {requestsLoading ? (
                <tr><td colSpan="6" className="text-center py-4 text-secondary">Loading client requests...</td></tr>
              ) : supplyRequests.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-secondary">No client supply requests yet.</td></tr>
              ) : supplyRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.clientName}</strong><small className="d-block text-secondary">{request.clientEmail}</small></td>
                  <td>{request.supplyName}</td>
                  <td>{request.quantity}</td>
                  <td>{request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}</td>
                  <td><span className={`badge ${request.status === 'Rejected' ? 'text-bg-danger' : request.status === 'Released' ? 'text-bg-success' : request.status === 'Approved' ? 'text-bg-primary' : 'text-bg-warning'}`}>{request.status}</span></td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {request.status === "Pending" && <>
                        <button className="btn btn-sm request-action request-approve" disabled={requestActionId === request.id} onClick={() => updateSupplyRequest(request.id, "Approved")}><i className="bi bi-check-circle-fill" />Approve</button>
                        <button className="btn btn-sm request-action request-reject" disabled={requestActionId === request.id} onClick={() => updateSupplyRequest(request.id, "Rejected")}><i className="bi bi-x-circle-fill" />Reject</button>
                      </>}
                      {request.status === "Approved" && <button className="btn btn-sm request-action request-release" disabled={requestActionId === request.id} onClick={() => releaseSupplyRequest(request.id)}><i className="bi bi-box-seam" />{requestActionId === request.id ? "Please wait..." : "Release Supply"}</button>}
                      {(request.status === "Rejected" || request.status === "Released") && <span className="small text-secondary">{request.status === "Released" ? "Completed" : "Closed"}</span>}
                    </div>
                    {request.adminNote && <small className="d-block text-secondary mt-1">{request.adminNote}</small>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="supply-reminder p-3 p-md-4 d-flex gap-3 align-items-start">
        <i className="bi bi-info-circle-fill fs-4 text-success" />
        <div><strong className="d-block mb-1">Inventory Reminder</strong><span className="small">Supplies with 15 units or fewer are marked as low stock. Check these items regularly and restock when needed.</span></div>
      </div>

      {isEditModalOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setIsEditModalOpen(false)} />
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header px-4 py-3">
                  <h5 className="modal-title fw-bold text-success"><i className="bi bi-pencil-square me-2" />Edit Emergency Supply</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsEditModalOpen(false)} />
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body px-4">
                    <div className="mb-3"><label className="form-label supply-form-label">Supply Name</label><input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
                    <div className="mb-3"><label className="form-label supply-form-label">Category</label><select className="form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required><option value="">Select category</option><option value="Food and Water">Food and Water</option><option value="Medical">Medical</option><option value="Safety Equipment">Safety Equipment</option><option value="Lighting">Lighting</option><option value="Clothing and Shelter">Clothing and Shelter</option></select></div>
                    <div className="mb-3"><label className="form-label supply-form-label">Quantity</label><input type="number" className="form-control" min="0" step="1" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} required /></div>
                  </div>
                  <div className="modal-footer px-4 py-3"><button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setIsEditModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-success rounded-3 fw-bold"><i className="bi bi-check2 me-1" />Save Changes</button></div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
