"use client";
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background:"#10b981", color:"#fff", border:"none",
        padding:"8px 20px", borderRadius:"8px",
        fontSize:"13px", fontWeight:600, cursor:"pointer"
      }}
    >
      🖨️ Print / Save PDF
    </button>
  );
}