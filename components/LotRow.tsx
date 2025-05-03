"use client"

interface LotRowProps {
  value: {
    lot: string
    qty: number
    wt: string
  }
  onChange: (key: string, value: string | number) => void
  onDelete: () => void
}

export default function LotRow({ value, onChange, onDelete }: LotRowProps) {
  return (
    <div className="lot-row">
      <input value={value.lot} onChange={(e) => onChange("lot", e.target.value)} placeholder="LOT-001" required />
      <input
        type="number"
        value={value.qty || ""}
        onChange={(e) => onChange("qty", +e.target.value)}
        min={1}
        required
      />
      <input value={value.wt} onChange={(e) => onChange("wt", e.target.value)} placeholder="0.00" required />
      <button type="button" onClick={onDelete}>
        —
      </button>
    </div>
  )
}
