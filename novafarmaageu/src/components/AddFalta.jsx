import React, { useState } from 'react'
import { addDoc, faltasCollection, serverTimestamp } from '../firebase'
export default function AddFalta({ store }) {
  const [ean, setEan] = useState('')
  const [nome, setNome] = useState('')
  const [qtd, setQtd] = useState('')

  async function handle(e) {
    e.preventDefault()
    if (!store) return alert('Selecione uma loja')
    if (!ean || !nome || !qtd) return alert('Preencha todos os campos')
    const payload = {
      store: store.id,
      storeLabel: store.label,
      ean,
      nome,
      quantidade: Number(qtd),
      createdAt: serverTimestamp()
    }
    try {
      await addDoc(faltasCollection(store.id), payload)
      setEan(''); setNome(''); setQtd('')
      alert('Falta registrada com sucesso!')
    } catch (err) {
      console.error(err); alert('Erro ao gravar')
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-lg text-[var(--brand-red)]">Cadastro de Falta</h3>
      <div className="mt-3 text-sm text-gray-600">Loja: <strong>{store?store.label:'Nenhuma selecionada'}</strong></div>
      <form onSubmit={handle} className="mt-4 space-y-3">
        <input value={ean} onChange={e=>setEan(e.target.value)} placeholder="EAN (código)" className="w-full p-3 border rounded" />
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do produto" className="w-full p-3 border rounded" />
        <input value={qtd} onChange={e=>setQtd(e.target.value)} placeholder="Quantidade necessária" type="number" className="w-full p-3 border rounded" />
        <div className="flex gap-3">
          <button type="submit" className="flex-1 p-3 bg-[var(--brand-red)] text-white rounded font-semibold">Adicionar Falta</button>
          <button type="button" onClick={()=>{setEan(''); setNome(''); setQtd('')}} className="p-3 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded font-semibold">Limpar</button>
        </div>
      </form>
    </div>
  )
}
