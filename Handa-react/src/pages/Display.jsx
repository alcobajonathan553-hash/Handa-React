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

  const api = "http://localhost:8080/api/supplies";

  async function getSupplies() {
    try {
      const response = await fetch(api);
      if (!response.ok) throw new Error("Failed to get supplies.");
      setSupplies(await response.json());
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
      console.log(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this supply from your inventory?")) return;
    try {
      const response = await fetch(`${api}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete supply.");
      await getSupplies();
    } catch (err) {
      console.log(err);
    }
  }

  const lowStockCount = supplies.filter((supply) => supply.status === "Low Stock").length;

  return (
    <div className="container display-page py-4 py-md-5">
      <style>{`
        .display-page { --supply-green: #18864b; --supply-green-dark: #12683a; --supply-green-light: #eaf6ee; --supply-border: #e0e9e2; }
        .supply-page-title { color: #173c29; font-weight: 800; letter-spacing: -.035em; }
        .supply-page-subtitle { color: #6b7b70; }
        .supply-card { border: 1px solid var(--supply-border); border-radius: 16px; overflow: hidden; box-shadow: 0 5px 20px rgba(23,60,41,.055); }
        .supply-card-header { background: #fff; border-bottom: 1px solid var(--supply-border); padding: 18px 22px; color: var(--supply-green); font-weight: 800; }
        .supply-section-icon { width: 36px; height: 36px; border-radius: 11px; background: var(--supply-green-light); display: inline-grid; place-items: center; margin-right: 10px; }
        .supply-form-label { font-size: .85rem; font-weight: 700; color: #354b3d; margin-bottom: 8px; }
        .display-page .form-control, .display-page .form-select { min-height: 46px; border-radius: 10px; border-color: #dce6df; font-size: .9rem; }
        .display-page .form-control:focus, .display-page .form-select:focus { border-color: var(--supply-green); box-shadow: 0 0 0 .2rem rgba(24,134,75,.13); }
        .supply-add-btn { min-height: 46px; border-radius: 10px; background: var(--supply-green); border-color: var(--supply-green); font-weight: 700; }
        .supply-add-btn:hover { background: var(--supply-green-dark); border-color: var(--supply-green-dark); }
        .supply-tip { background: #f1f8f3; border: 1px solid #dcefe2; color: #4e705a; border-radius: 11px; padding: 12px 15px; font-size: .84rem; }
        .supply-table thead th { background: #f0f7f2; color: #355342; border-bottom: 1px solid #dfeae2; font-size: .8rem; padding: 14px 16px; white-space: nowrap; }
        .supply-table tbody td { padding: 14px 16px; vertical-align: middle; color: #35483c; font-size: .88rem; }
        .supply-status { border-radius: 30px; font-size: .72rem; padding: 6px 10px; }
        .supply-low-stock { background: #fff0f0; color: #c23d49; }
        .supply-in-stock { background: #eaf6ee; color: #18864b; }
        .supply-action { border-radius: 8px; font-weight: 700; }
        .supply-reminder { border: 1px solid #cfe4d5; background: #f1f8f3; color: #2f6843; border-radius: 14px; }
        @media (max-width: 575.98px) { .supply-card-header { padding: 15px; } .supply-table tbody td { padding: 12px; } }
      `}</style>

      <header className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 54, height: 54, background: "#eaf6ee", color: "#18864b", fontSize: "1.35rem" }}>
            <i className="bi bi-box-seam" />
          </div>
          <div>
            <h2 className="supply-page-title mb-1">Emergency Supplies Management</h2>
            <p className="supply-page-subtitle mb-0">Add, update, and manage your emergency supplies inventory.</p>
          </div>
        </div>
      </header>

      <section className="supply-card mb-4">
        <div className="supply-card-header d-flex align-items-center">
          <span className="supply-section-icon"><i className="bi bi-plus-circle" /></span>
          Add Emergency Supplies
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
          <div className="supply-tip mt-4"><i className="bi bi-info-circle-fill me-2" />Keep your supplies updated to ensure you're always prepared.</div>
        </div>
      </section>

      <section className="supply-card mb-4">
        <div className="supply-card-header d-flex align-items-center">
          <span className="supply-section-icon"><i className="bi bi-clipboard2-check" /></span>
          Emergency Supply List
        </div>
        <div className="table-responsive">
          <table className="table table-hover supply-table mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Supply Name</th><th>Category</th><th>Quantity</th><th>Status</th><th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply) => (
                <tr key={supply.id}>
                  <td>{supply.id}</td>
                  <td className="fw-semibold"><span className="d-inline-flex align-items-center justify-content-center rounded-circle me-2" style={{ width: 34, height: 34, background: "#eaf6ee", color: "#18864b" }}><i className="bi bi-box-seam" /></span>{supply.name}</td>
                  <td>{supply.category}</td>
                  <td>{supply.quantity}</td>
                  <td><span className={`badge supply-status ${supply.status === "Low Stock" ? "supply-low-stock" : "supply-in-stock"}`}><i className={`bi ${supply.status === "Low Stock" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"} me-1`} />{supply.status}</span></td>
                  <td className="text-center text-nowrap">
                    <button type="button" className="btn btn-sm btn-warning supply-action me-2" onClick={() => openEditModal(supply)}><i className="bi bi-pencil me-1" />Edit</button>
                    <button type="button" className="btn btn-sm btn-danger supply-action" onClick={() => handleDelete(supply.id)}><i className="bi bi-trash me-1" />Delete</button>
                  </td>
                </tr>
              ))}
              {supplies.length === 0 && <tr><td colSpan="6" className="text-center py-5 text-secondary"><i className="bi bi-inbox fs-3 d-block mb-2" />No emergency supplies found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="supply-reminder p-3 p-md-4 d-flex gap-3 align-items-start">
        <i className="bi bi-info-circle-fill fs-4 text-success" />
        <div><strong className="d-block mb-1">Low Stock Reminder</strong><span className="small">Items with low stock are highlighted to help you restock on time and stay prepared.</span>{lowStockCount > 0 && <div className="small fw-bold mt-2">{lowStockCount} item{lowStockCount > 1 ? "s" : ""} currently marked low stock.</div>}</div>
      </div>

      {isEditModalOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setIsEditModalOpen(false)} />
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header px-4 py-3">
                  <h5 className="modal-title fw-bold text-success"><i className="bi bi-pencil-square me-2" />Edit Emergency Supply</h5>
                  <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)} />
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
