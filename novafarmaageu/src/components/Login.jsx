import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const handle = (e) => {
    e.preventDefault()
    if (user === 'admin' && pass === '75611814lucas') {
      onLogin({ username: 'admin' })
    } else {
      alert('Credenciais inválidas')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[var(--brand-red)] mb-3 text-center">Nova Farma Ageu</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">Login administrativo</p>
        <form onSubmit={handle} className="space-y-3">
          <input className="w-full p-3 border rounded" placeholder="Usuário" value={user} onChange={e=>setUser(e.target.value)} />
          <input className="w-full p-3 border rounded" placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="w-full p-3 bg-[var(--brand-red)] text-white rounded font-semibold">Entrar</button>
        </form>
        <p className="text-xs text-gray-500 mt-4">Usuário padrão: <strong>admin</strong> | Senha: <strong>75611814lucas</strong></p>
      </div>
    </div>
  )
}
