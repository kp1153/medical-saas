"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientActions({ patient }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    address: patient.address || "",
    age: patient.age || "",
    gender: patient.gender || "",
    complaint: patient.complaint || "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return alert("Name is required");
    setSaving(true);
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if ((await res.json()).success) {
      setShowEdit(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${patient.name}" permanently?`)) return;
    setDeleting(true);
    await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
    router.push("/patients");
  }

  return (
    <>
      {/* बटन */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setShowEdit(true)}
          style={{
            background: "#1d4ed8",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ✏️ Edit
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? "Deleting..." : "🗑️ Delete"}
        </button>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: "20px",
              }}
            >
              ✏️ Patient Edit — {patient.name}
            </h2>

            {[
              { label: "Name *", key: "name", type: "text" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Age", key: "age", type: "number" },
              { label: "Address", key: "address", type: "text" },
              { label: "Complaint", key: "complaint", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "5px",
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ))}

            {/* Gender */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: "5px",
                }}
              >
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  fontFamily: "inherit",
                }}
              >
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1d4ed8",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "✅ Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
