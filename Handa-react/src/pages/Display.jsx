
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

  // GET
  async function getSupplies() {
    try {
      const response = await fetch(api);

      if (!response.ok) {
        throw new Error("Failed to get supplies.");
      }

      const data = await response.json();
      setSupplies(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getSupplies();
  }, []);

  // POST
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          quantity
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add supply.");
      }

      setName("");
      setCategory("");
      setQuantity("");

      await getSupplies();
    } catch (err) {
      console.log(err);
    }
  }

  // OPEN EDIT MODAL
  function openEditModal(supply) {
    setEditID(supply.id);
    setEditName(supply.name);
    setEditCategory(supply.category);
    setEditQuantity(String(supply.quantity));
    setIsEditModalOpen(true);
  }

  // PUT
  async function handleUpdate(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${api}/${editID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          quantity: editQuantity
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update supply.");
      }

      setIsEditModalOpen(false);
      await getSupplies();
    } catch (err) {
      console.log(err);
    }
  }

  // DELETE
  async function handleDelete(id) {
    try {
      const response = await fetch(`${api}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete supply.");
      }

      await getSupplies();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Emergency Supplies Management</h2>

      {/* ADD FORM */}
      <div className="card mb-4">
        <div className="card-header fw-bold">
          Add Emergency Supply
        </div>

        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Supply Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter supply name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="Food and Water">Food and Water</option>
                <option value="Medical">Medical</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Lighting">Lighting</option>
                <option value="Clothing and Shelter">Clothing and Shelter</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                placeholder="Quantity"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Add Supply
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="card">
        <div className="card-header fw-bold">
          Emergency Supply List
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Supply Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {supplies.map((supply) => (
                  <tr key={supply.id}>
                    <td>{supply.id}</td>
                    <td>{supply.name}</td>
                    <td>{supply.category}</td>
                    <td>{supply.quantity}</td>
                    <td>
                      <span
                        className={`badge ${
                          supply.status === "Low Stock"
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {supply.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => openEditModal(supply)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(supply.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {supplies.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      No emergency supplies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Emergency Supply</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsEditModalOpen(false)}
                  ></button>
                </div>

                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Supply Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Food and Water">Food and Water</option>
                        <option value="Medical">Medical</option>
                        <option value="Safety Equipment">Safety Equipment</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Clothing and Shelter">Clothing and Shelter</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="1"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
