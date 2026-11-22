import { useState, useEffect } from "react";

export default function Display() {
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

  const api = "http://localhost:8080/api/supplies";

  function getSupplyStatus(supply) {
    if (supply.status && supply.status.trim()) return supply.status;
    return Number(supply.quantity) <= 15 ? "Low Stock" : "Available";
  }

  async function getSupplies() {
    try {
      setError("");
      const response = await fetch(api);
      if (!response.ok) throw new Error("Failed to load emergency supplies.");
      const data = await response.json();
      setSupplies(data);
    } catch (err) {
      setError("Unable to connect to the server. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getSupplies();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, quantity })
      });
      if (!response.ok) throw new Error("Failed to add supply.");
      setName("");
      setCategory("");
      setQuantity("");
      await getSupplies();
    } catch (err) {
      setError("Unable to add supply. Please try again.");
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
      const response = await fetch(`${api}/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, category: editCategory, quantity: editQuantity })
      });
      if (!response.ok) throw new Error("Failed to update supply.");
      setIsEditModalOpen(false);
      await getSupplies();
    } catch (err) {
      setError("Unable to update supply. Please try again.");
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this supply?")) return;
    try {
      const response = await fetch(`${api}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete supply.");
      await getSupplies();
    } catch (err) {
      setError("Unable to delete supply. Please try again.");
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
        .supply-id { display: inline-flex; min-width: 32px; height: 30px; align-items: center; justify-content: center; border-radius: 8px; background: #f0f4f1; color: #52665a; font-weight: 700; font-size: .8rem; }
        .supply-name-icon { width: 36px; height: 36px; border-radius: 10px; background: #eaf6ee; color: #16834a; display: inline-grid; place-items: center; flex-shrink: 0; }
        .supply-category { display: inline-block; background: #f2f5f3; color: #52665a; border-radius: 8px; padding: 6px 9px; font-size: .78rem; font-weight: 600; }
        .supply-quantity { display: inline-flex; min-width: 38px; justify-content: center; padding: 6px 10px; border-radius: 8px; background: #f2f7f3; color: #315c40; font-weight: 800; }
        .supply-status { display: inline-flex; align-items: center; gap: 5px; border-radius: 30px; font-size: .74rem; font-weight: 700; padding: 7px 11px; white-space: nowrap; }
        .supply-low-stock { background: #fff0ed; color: #c04a3c; }
        .supply-in-stock { background: #eaf6ee; color: #16834a; }
        .supply-action { border-radius: 8px; font-weight: 700; }
        .supply-reminder { border: 1px solid #cfe4d5; background: #f1f8f3; color: #2f6843; border-radius: 14px; }
        @media (max-width: 575.98px) { .display-page { padding-left: 14px !important; padding-right: 14px !important; } .supply-card-header { padding: 15px; } .supply-table tbody td { padding: 14px; } }
      `}</style>

      <header className="mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 54, height: 54, background: "#eaf6ee", color: "#16834a", fontSize: "1.4rem" }}>
            <i className="bi bi-box-seam" />
          </div>
          <div>
            <h2 className="supply-page-title mb-1">Emergency Supplies</h2>
            <p className="supply-page-subtitle mb-0">Manage and monitor your emergency inventory.</p>
          </div>
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
                    <td className="text-center text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-success supply-action me-2" onClick={() => openEditModal(supply)}><i className="bi bi-pencil me-1" />Edit</button>
                      <button type="button" className="btn btn-sm btn-outline-danger supply-action" onClick={() => handleDelete(supply.id)}><i className="bi bi-trash me-1" />Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && supplies.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-secondary"><i className="bi bi-inbox fs-2 d-block mb-2" />No emergency supplies found.</td></tr>}
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
