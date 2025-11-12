import React, { useEffect, useState } from 'react'
import { onSnapshot, query, where, orderBy, faltasCollection, deleteDoc, doc } from '../firebase'
import { jsPDF } from 'jspdf'

export default function ListFaltas({ store }) {
  const [faltas, setFaltas] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!store) { setFaltas([]); return; }
    setLoading(true)
    const col = faltasCollection(store.id)
    const q = query(col, where('store','==',store.id), orderBy('createdAt','desc'))
    const unsub = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFaltas(arr); setLoading(false)
    }, err=>{ console.error(err); setLoading(false) })
    return ()=>unsub()
  },[store])

  const filtered = faltas.filter(f=>{
    const q = filter.trim().toLowerCase()
    if (!q) return true
    return (f.nome && f.nome.toLowerCase().includes(q)) || (f.ean && f.ean.toString().includes(q))
  })

  function exportCSV() {
    if (!store) return alert('Selecione uma loja')
    const rows = filtered.map(f=>({
      EAN: f.ean, Nome: f.nome, Quantidade: f.quantidade || f.quantidade, Loja: f.storeLabel, Data: f.createdAt ? (f.createdAt.toDate ? f.createdAt.toDate().toLocaleString() : new Date(f.createdAt.seconds*1000).toLocaleString()) : ''
    }))
    const header = Object.keys(rows[0] || {EAN:'EAN',Nome:'Nome',Quantidade:'Quantidade',Loja:'Loja',Data:'Data'})
    const csv = [header.join(',')].concat(rows.map(r=>header.map(h=>`"${String(r[h]||'')}"`).join(','))).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${store.id}_faltas_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  function exportPDF() {
    if (!store) return alert('Selecione uma loja')
    const docpdf = new jsPDF({ unit:'pt' })
    docpdf.setFontSize(14); docpdf.text(`${store.label} - Relatório de Faltas`, 40, 40)
    let y = 70; const line = 16
    docpdf.setFontSize(10)
    docpdf.text('EAN',40,y); docpdf.text('Nome',140,y); docpdf.text('Qtd',380,y); docpdf.text('Data',430,y); y+=line
    filtered.forEach(r=>{
      if (y>750){ docpdf.addPage(); y=40 }
      docpdf.text(String(r.ean||''),40,y)
      const nomeLines = docpdf.splitTextToSize(String(r.nome||''),220)
      docpdf.text(nomeLines,140,y)
      docpdf.text(String(r.quantidade||''),380,y)
      const dateStr = r.createdAt ? (r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : new Date(r.createdAt.seconds*1000).toLocaleString()) : ''
      docpdf.text(dateStr,430,y)
      y+=line * Math.max(1,nomeLines.length)
    })
    docpdf.save(`${store.id}_faltas_${new Date().toISOString()}.pdf`)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este registro?')) return
    try {
      await deleteDoc(doc(faltasCollection().parent, id))
    } catch(err){
      // fallback: direct path
      try{ await deleteDoc(doc('faltas', id)) }catch(e){ console.error(e) }
      console.error(err)
      alert('Erro ao excluir')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-[var(--brand-red)]">Lista de Faltas</h3>
        <div className="text-sm text-gray-500">{store?store.label:''}</div>
      </div>
      <div className="mt-3">
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar por nome ou EAN" className="w-full p-2 border rounded" />
      </div>
      <div className="mt-4 max-h-96 overflow-auto">
        {loading && <div className="text-sm text-gray-500">Carregando...</div>}
        {!loading && filtered.length===0 && <div className="text-sm text-gray-500">Nenhum registro</div>}
        <ul className="space-y-2">
          {filtered.map(f=>(
            <li key={f.id} className="p-3 border rounded flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{f.nome}</div>
                <div className="text-xs text-gray-500">EAN: {f.ean} • Qtd: {f.quantidade}</div>
                <div className="text-xs text-gray-400">Loja: {f.storeLabel}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(f.ean)} className="text-xs p-1 border rounded">Copiar EAN</button>
                {/* Deleting handled via firestore doc delete */}
                <button onClick={()=>{ if(confirm('Excluir?')){ /* deletion handled elsewhere */ alert('Para excluir, abra o console admin (config) - ou implementar função delete') } }} className="text-xs p-1 bg-[var(--brand-red)] text-white rounded">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={exportCSV} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded">Exportar CSV</button>
        <button onClick={exportPDF} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded">Exportar PDF</button>
      </div>
    </div>
  )
}
