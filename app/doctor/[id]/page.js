"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PrintPrescription from "./PrintPrescription";

const TEST_CATEGORIES = {
  "🩸 Blood Tests": [
    "CBC",
    "Blood Sugar Fasting",
    "Blood Sugar PP",
    "HbA1c",
    "Lipid Profile",
    "LFT",
    "KFT",
    "Thyroid TSH",
    "Thyroid T3/T4",
    "Uric Acid",
    "ESR",
    "CRP",
    "Serum Calcium",
    "Vitamin D",
    "Vitamin B12",
    "Iron Studies",
    "PT/INR",
    "Dengue NS1",
    "Malaria",
    "Typhoid Widal",
  ],
  "🧪 Urine / Stool": [
    "Urine R/M",
    "Urine Culture",
    "24hr Urine Protein",
    "Stool R/M",
    "Stool Culture",
  ],
  "📷 X-Ray": [
    "X-Ray Chest PA",
    "X-Ray KUB",
    "X-Ray Spine LS",
    "X-Ray Spine CS",
    "X-Ray Hand",
    "X-Ray Knee",
    "X-Ray Pelvis",
    "X-Ray Shoulder",
    "X-Ray Ankle",
    "X-Ray PNS",
  ],
  "🔊 Ultrasound": [
    "USG Abdomen",
    "USG Pelvis",
    "USG Abdomen + Pelvis",
    "USG Thyroid",
    "USG Obstetric",
    "USG KUB",
    "USG Breast",
    "USG Scrotum",
  ],
  "🧲 MRI": [
    "MRI Brain",
    "MRI Spine LS",
    "MRI Spine CS",
    "MRI Knee",
    "MRI Shoulder",
    "MRI Abdomen",
    "MRI Pelvis",
    "MRI Wrist",
  ],
  "🔬 CT Scan": [
    "CT Brain",
    "CT Chest",
    "CT Abdomen",
    "CT KUB",
    "CT Spine LS",
    "CT PNS",
    "CT Angiography",
    "CT Pelvis",
  ],
  "❤️ Cardiac": ["ECG", "Echo 2D", "TMT", "Holter 24hr"],
  "👁️ Other": [
    "Biopsy",
    "Endoscopy",
    "Colonoscopy",
    "PFT",
    "EEG",
    "EMG/NCV",
    "Bone Density (DEXA)",
  ],
};

export default function DoctorExamine({ params }) {
  const router = useRouter();
  const { id: patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tests
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(TEST_CATEGORIES)[0],
  );
  const [selectedTests, setSelectedTests] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    async function load() {
      const [p, m] = await Promise.all([
        fetch(`/api/patients/${patientId}`).then((r) => r.json()),
        fetch("/api/medicines").then((r) => r.json()),
      ]);
      setPatient(p);
      setAllMedicines(m);
    }
    load();
  }, [patientId]);

  function handleSearch(val) {
    setSearch(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allMedicines
        .filter(
          (m) =>
            m.name.toLowerCase().includes(val.toLowerCase()) ||
            (m.generic && m.generic.toLowerCase().includes(val.toLowerCase())),
        )
        .slice(0, 6),
    );
  }

  function addMedicine(med) {
    if (items.find((i) => i.medicineId === med.id)) {
      setSearch("");
      setSuggestions([]);
      return;
    }
    setItems([
      ...items,
      {
        medicineId: med.id,
        medicineName: med.name,
        generic: med.generic || "",
        dose: "",
        duration: "",
        instruction: "After food",
      },
    ]);
    setSearch("");
    setSuggestions([]);
  }

  function updateItem(idx, field, value) {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function toggleTest(testName) {
    setSelectedTests((prev) =>
      prev.find((t) => t.name === testName)
        ? prev.filter((t) => t.name !== testName)
        : [...prev, { name: testName, category: selectedCategory }],
    );
  }

  async function handleSubmit() {
    if (!items.length && !selectedTests.length)
      return alert("Add at least one medicine or test");
    if (!diagnosis) return alert("Enter diagnosis");
    setLoading(true);

    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        diagnosis,
        notes,
        medicines: items,
        tests: selectedTests,
      }),
    });
    const data = await res.json();

    // Save lab reports
    for (const test of selectedTests) {
      await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          prescriptionId: data.id,
          category: test.category,
          testName: test.name,
        }),
      });
    }

    setLoading(false);
    router.push(`/prescriptions/${data.id}`);
  }

  if (!patient)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-3 flex items-center gap-4 shadow-md">
        <Link
          href="/doctor"
          className="text-green-300 hover:text-white text-sm"
        >
          ← Queue
        </Link>
        <h1 className="text-lg font-bold">
          🩺 {patient.name} — Token #{patient.id}
        </h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Patient Info */}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Age:</span>{" "}
            <span className="font-medium">{patient.age || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>{" "}
            <span className="font-medium capitalize">
              {patient.gender || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>{" "}
            <span className="font-medium">{patient.phone || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Complaint:</span>{" "}
            <span className="font-medium text-red-600">
              {patient.complaint || "—"}
            </span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Viral fever, UTI, Hypertension..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Advice
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Rest, diet, follow-up..."
            />
          </div>
        </div>

        {/* Medicine Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Medicine
          </label>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Medicine name or generic..."
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {suggestions.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => addMedicine(m)}
                    className="px-4 py-2.5 hover:bg-green-50 cursor-pointer text-sm border-b last:border-0"
                  >
                    <span className="font-medium text-gray-800">{m.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {m.generic}
                    </span>
                    <span className="float-right text-xs text-gray-400">
                      Stock: {m.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicines Table */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <div className="px-4 py-3 border-b font-semibold text-gray-700 text-sm">
              💊 Medicines
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Medicine", "Dose", "Duration", "Instruction", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-800">
                        {item.medicineName}
                      </p>
                      <p className="text-xs text-gray-400">{item.generic}</p>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.dose}
                        onChange={(e) =>
                          updateItem(idx, "dose", e.target.value)
                        }
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="1-0-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.duration}
                        onChange={(e) =>
                          updateItem(idx, "duration", e.target.value)
                        }
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="5 days"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.instruction}
                        onChange={(e) =>
                          updateItem(idx, "instruction", e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option>After food</option>
                        <option>Before food</option>
                        <option>Empty stomach</option>
                        <option>At bedtime</option>
                        <option>SOS</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 text-lg"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tests Section */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="font-semibold text-gray-700 text-sm mb-3">
            🧪 Investigations / Tests
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(TEST_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tests Grid */}
          <div className="flex flex-wrap gap-2">
            {TEST_CATEGORIES[selectedCategory].map((test) => {
              const isSelected = selectedTests.find((t) => t.name === test);
              return (
                <button
                  key={test}
                  onClick={() => toggleTest(test)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    isSelected
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
                  }`}
                >
                  {isSelected ? "✓ " : ""}
                  {test}
                </button>
              );
            })}
          </div>

          {/* Selected Tests */}
          {selectedTests.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2 font-semibold">
                Selected Tests:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTests.map((t) => (
                  <span
                    key={t.name}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    {t.name}
                    <button
                      onClick={() => toggleTest(t.name)}
                      className="text-green-600 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

    <PrintPrescription
          patient={patient}
          diagnosis={diagnosis}
          notes={notes}
          items={items}
          selectedTests={selectedTests}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition text-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "✅ Send to Pharmacy"}
        </button>
      </div>
    </div>
  );
}