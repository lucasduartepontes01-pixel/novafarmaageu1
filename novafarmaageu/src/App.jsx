import React, { useState } from 'react'
import Login from './components/Login'
import StoreSelect, { STORES } from './components/StoreSelect'
import AddFalta from './components/AddFalta'
import ListFaltas from './components/ListFaltas'

export default function App(){
  const [user, setUser] = useState(null)
  const [selectedStore, setSelectedStore] = useState(null)

  if (!user) return <Login onLogin={(u)=>setUser(u)} />

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--brand-red)] font-bold">NF</div>
          <div>
            <h1 className="text-xl font-bold text-[var(--brand-red)]">Nova Farma Ageu</h1>
            <p className="text-sm text-gray-600">Sistema de Anotação de Faltas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">{user.username}</span>
          <button onClick={()=>{ setUser(null); setSelectedStore(null) }} className="p-2 bg-[var(--brand-red)] text-white rounded">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 bg-white p-4 rounded shadow">
          <StoreSelect selected={selectedStore} onSelect={setSelectedStore} />
          <div className="mt-4 text-xs text-gray-500">Cores: vermelho e amarelo (marca)</div>
        </section>

        <section className="md:col-span-1 bg-white p-4 rounded shadow">
          <AddFalta store={selectedStore} />
        </section>

        <section className="md:col-span-1 bg-white p-4 rounded shadow">
          <ListFaltas store={selectedStore} />
        </section>
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-xs text-gray-500">Nova Farma Ageu — Sistema de Anotação de Faltas</footer>
    </div>
  )
}
