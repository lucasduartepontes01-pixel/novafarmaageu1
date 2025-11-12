import React from 'react'
export const STORES = [
  { id: 'primavera', label: 'Nova Farma Ageu Primavera' },
  { id: 'paulista', label: 'Nova Farma Ageu P. Paulista' },
  { id: 'vilasluiz', label: 'Nova Farma Ageu Vila S. Luiz' }
]
export default function StoreSelect({ selected, onSelect }) {
  return (
    <div>
      <h2 className="font-semibold text-lg text-[var(--brand-red)] mb-3">Faltas – Nova Farma Ageu</h2>
      <div className="space-y-3">
        {STORES.map(s => (
          <button key={s.id} onClick={()=>onSelect(s)} className={`w-full text-left p-3 rounded ${selected && selected.id===s.id ? 'ring-4 ring-yellow-300' : ''} bg-[var(--brand-red)] text-white font-medium`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
