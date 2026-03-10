"use client";

export default function PrintPrescription({ patient, diagnosis, notes, items, selectedTests }) {
  function handlePrint() {
    const printWindow = window.open("", "_blank");
    const date = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
          .header h1 { font-size: 22px; font-weight: bold; }
          .header p { font-size: 12px; color: #444; }
          .patient-info { display: flex; justify-content: space-between; background: #f5f5f5; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 12px; }
          .patient-info span { margin-right: 16px; }
          .section-title { font-weight: bold; font-size: 13px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; margin-top: 14px; }
          .diagnosis-box { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th { background: #1a5276; color: white; padding: 7px 10px; text-align: left; font-size: 12px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e5e5e5; font-size: 12px; }
          tr:nth-child(even) td { background: #f9f9f9; }
          .tests-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .test-badge { background: #e8f5e9; border: 1px solid #66bb6a; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
          .notes-box { background: #e8f4fd; border-left: 4px solid #3498db; padding: 8px 12px; border-radius: 4px; font-size: 12px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
          .signature { text-align: right; }
          .signature-line { border-top: 1px solid #000; width: 160px; margin-top: 40px; text-align: center; padding-top: 4px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Medical Prescription</h1>
          <p>Date: ${date}</p>
        </div>

        <div class="patient-info">
          <span><b>Patient:</b> ${patient.name}</span>
          <span><b>Age:</b> ${patient.age || "—"}</span>
          <span><b>Gender:</b> ${patient.gender || "—"}</span>
          <span><b>Phone:</b> ${patient.phone || "—"}</span>
          <span><b>Complaint:</b> ${patient.complaint || "—"}</span>
        </div>

        <div class="diagnosis-box">
          <b>Diagnosis:</b> ${diagnosis}
        </div>

        ${items.length > 0 ? `
        <div class="section-title">💊 Medicines</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine</th>
              <th>Generic</th>
              <th>Dose</th>
              <th>Duration</th>
              <th>Instruction</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><b>${item.medicineName}</b></td>
                <td>${item.generic || "—"}</td>
                <td>${item.dose || "—"}</td>
                <td>${item.duration || "—"}</td>
                <td>${item.instruction}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        ` : ""}

        ${selectedTests.length > 0 ? `
        <div class="section-title">🧪 Investigations / Tests</div>
        <div class="tests-list">
          ${selectedTests.map(t => `<span class="test-badge">${t.name}</span>`).join("")}
        </div>
        ` : ""}

        ${notes ? `
        <div class="section-title">📋 Notes / Advice</div>
        <div class="notes-box">${notes}</div>
        ` : ""}

        <div class="footer">
          <div>Token #${patient.id}</div>
          <div class="signature">
            <div class="signature-line">Doctor's Signature</div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <button
      onClick={handlePrint}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-lg"
    >
      🖨️ Print Prescription
    </button>
  );
}