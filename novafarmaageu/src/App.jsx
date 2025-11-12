
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';

const ADMIN_USER = 'admin';
const ADMIN_PASS = '75611814lucas';

const STORES = [
  { id: 'primavera', label: 'Nova Farma Ageu Primavera' },
  { id: 'paulista', label: 'Nova Farma Ageu P. Paulista' },
  { id: 'vilasluiz', label: 'Nova Farma Ageu Vila S. Luiz' }
];

export default function App(){
  const [user, setUser] = useState(null);
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [ean, setEan] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [faltas, setFaltas] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!selectedStore){ setFaltas([]); return; }
    setLoading(true);
    const col = collection(db,'faltas');
    const q = query(col, where('store','==',selectedStore.id), orderBy('date','desc'));
    const unsub = onSnapshot(q, snap=>{
      setFaltas(snap.docs.map(d=>({id:d.id, ...d.data()})));
      setLoading(false);
    }, err=>{
      console.error(err);
      setLoading(false);
    });
    return ()=>unsub();
  }, [selectedStore]);

  function handleLogin(e){
    e?.preventDefault?.();
    if(u===ADMIN_USER && p===ADMIN_PASS){
      setUser({username:u});
      setU(''); setP('');
    } else {
      alert('Credenciais inválidas');
    }
  }

  function toUpperTrim(s){ return s? s.toUpperCase().trim() : ''; }

  async function handleAdd(e){
    e?.preventDefault?.();
    if(!selectedStore) return alert('Selecione uma loja');
    if(!ean || !nome || !quantidade) return alert('Preencha EAN, Nome e Quantidade');
    const col = collection(db,'faltas');
    const q = query(col, where('store','==',selectedStore.id), where('ean','==',ean));
    const snapPromise = await q.get?.() ?? null;
    // Firestore modular SDK doesn't allow q.get(); we'll use onSnapshot-like get through temporary query
    // Instead, fetch a one-time snapshot using onSnapshot with immediate unsubscribe pattern
    let existing = null;
    try {
      // use get via onSnapshot once
      const p = new Promise((resolve, reject)=>{
        const unsub = onSnapshot(q, s=>{
          resolve(s);
          unsub();
        }, err=>{ reject(err); unsub(); });
      });
      const s = await p;
      if(!s.empty) existing = s.docs[0];
    } catch(err){
      console.error(err);
    }

    const today = new Date().toLocaleDateString('pt-BR');
    const payload = {
      store: selectedStore.id,
      storeLabel: selectedStore.label,
      ean,
      nome: toUpperTrim(nome),
      quantidade: Number(quantidade),
      date: today
    };

    try {
      if(existing){
        await updateDoc(doc(db,'faltas', existing.id), payload);
      } else {
        await addDoc(col, payload);
      }
      setEan(''); setNome(''); setQuantidade('');
    } catch(err){
      console.error(err); alert('Erro ao salvar: '+err.message);
    }
  }

  async function handleDelete(id){
    if(!confirm('Excluir este registro?')) return;
    try {
      await deleteDoc(doc(db,'faltas',id));
    } catch(err){
      console.error(err); alert('Erro ao excluir');
    }
  }

  function filteredFaltas(){
    const q = filter.trim().toLowerCase();
    if(!q) return faltas;
    return faltas.filter(f=> (f.nome && f.nome.toLowerCase().includes(q)) || (f.ean && f.ean.includes(q)) );
  }

  function exportCSV(){
    if(!selectedStore) return alert('Selecione loja');
    const rows = filteredFaltas().map(f=>({
      Loja: f.storeLabel, EAN: f.ean, Nome: f.nome, Quantidade: f.quantidade, Data: f.date
    }));
    if(rows.length===0) return alert('Nenhum registro para exportar');
    const header = Object.keys(rows[0]).join(',');
    const csv = [header].concat(rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${selectedStore.id}_faltas_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function exportPDF(){
    if(!selectedStore) return alert('Selecione loja');
    const docpdf = new jsPDF({ unit:'pt' });
    docpdf.setFontSize(14); docpdf.text(`${selectedStore.label} - Relatório de Faltas`, 40, 40);
    let y=70;
    docpdf.setFontSize(10);
    docpdf.text('EAN',40,y); docpdf.text('Nome',160,y); docpdf.text('Qtd',420,y); docpdf.text('Data',470,y); y+=16;
    filteredFaltas().forEach(r=>{
      if(y>750){ docpdf.addPage(); y=40; }
      docpdf.text(String(r.ean||''),40,y);
      const nomeLines = docpdf.splitTextToSize(String(r.nome||''),240);
      docpdf.text(nomeLines,160,y);
      docpdf.text(String(r.quantidade||''),420,y);
      docpdf.text(String(r.date||''),470,y);
      y += 16 * Math.max(1,nomeLines.length);
    });
    docpdf.save(`${selectedStore.id}_faltas_${new Date().toISOString()}.pdf`);
  }

  return (
    <div className="min-h-screen bg-[var(--brand-yellow)] p-4">
      {!user ? (
        <div className="min-h-screen flex items-center justify-center">
          <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h1 className="text-2xl font-bold text-[var(--brand-red)] mb-4 text-center">Nova Farma Ageu</h1>
            <input value={u} onChange={e=>setU(e.target.value)} placeholder="Usuário" className="w-full p-3 border rounded mb-3" />
            <input value={p} onChange={e=>setP(e.target.value)} placeholder="Senha" type="password" className="w-full p-3 border rounded mb-3" />
            <button type="submit" className="w-full p-3 bg-[var(--brand-red)] text-white rounded">Entrar</button>
          </form>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-[var(--brand-red)] font-bold">NF</div>
              <div>
                <h1 className="text-xl font-bold text-[var(--brand-red)]">Sistema de Faltas - Nova Farma Ageu</h1>
                <p className="text-sm text-gray-700">Registre faltas rapidamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Pesquisar por nome ou EAN" className="p-2 border rounded" />
              <button onClick={()=>{ setUser(null); setSelectedStore(null); setFaltas([]); }} className="p-2 bg-[var(--brand-red)] text-white rounded">Logout</button>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="md:col-span-1 bg-white p-4 rounded shadow">
              <h2 className="font-semibold text-lg text-[var(--brand-red)] mb-3">Lojas</h2>
              <div className="space-y-3">
                {STORES.map(s=>(
                  <button key={s.id} onClick={()=>setSelectedStore(s)} className={`w-full text-left p-3 rounded ${selectedStore && selectedStore.id===s.id ? 'ring-4 ring-yellow-300' : ''} bg-[var(--brand-red)] text-white font-medium`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="md:col-span-1 bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-lg text-[var(--brand-red)]">Cadastrar Falta</h3>
              <div className="mt-3 text-sm text-gray-600">Loja: <strong>{selectedStore?selectedStore.label:'Nenhuma selecionada'}</strong></div>
              <form onSubmit={handleAdd} className="mt-4 space-y-3">
                <input value={ean} onChange={e=>setEan(e.target.value)} placeholder="EAN (código)" className="w-full p-3 border rounded" />
               <input
  value={nome}
  onChange={(e) => setNome(e.target.value.toUpperCase())}
  className="p-2 border rounded mb-2 uppercase"
  placeholder="Nome do Produto"
  required
/>

                <input value={quantidade} onChange={e=>setQuantidade(e.target.value)} placeholder="Quantidade necessária" type="number" className="w-full p-3 border rounded" />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 p-3 bg-[var(--brand-red)] text-white rounded font-semibold">Adicionar Falta</button>
                  <button type="button" onClick={()=>{ setEan(''); setNome(''); setQuantidade(''); }} className="p-3 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded font-semibold">Limpar</button>
                </div>
              </form>

              <div className="mt-6">
                <h4 className="text-sm font-medium">Exportar</h4>
                <div className="flex gap-2 mt-2">
                  <button onClick={exportCSV} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded text-sm">Exportar CSV</button>
                  <button onClick={exportPDF} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded text-sm">Exportar PDF</button>
                </div>
              </div>
            </section>

            <section className="md:col-span-1 bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-[var(--brand-red)]">Lista de Faltas</h3>
                <div />
              </div>
              <div className="mt-3">
                <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar por nome ou EAN" className="w-full p-2 border rounded" />
              </div>

              <div className="mt-4 max-h-96 overflow-auto">
                {loading && <div className="text-sm text-gray-500">Carregando...</div>}
                {(!selectedStore) && <div className="text-sm text-gray-500">Selecione uma loja para ver as faltas.</div>}
                <ul className="space-y-2 mt-2">
                  {filteredFaltas().map(f=>(
                    <li key={f.id} className="p-3 border rounded flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{f.nome}</div>
                        <div className="text-xs text-gray-500">EAN: {f.ean} • Qtd: {f.quantidade}</div>
                        <div className="text-xs text-gray-400">Loja: {f.storeLabel} • Data: {f.date}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={()=>navigator.clipboard && navigator.clipboard.writeText(f.ean)} className="text-xs p-1 border rounded">Copiar EAN</button>
                        <button onClick={()=>handleDelete(f.id)} className="text-xs p-1 bg-[var(--brand-red)] text-white rounded">Excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={exportCSV} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded">Exportar CSV</button>
                <button onClick={exportPDF} className="p-2 bg-[var(--brand-yellow)] text-[var(--brand-red)] rounded">Exportar PDF</button>
              </div>

            </section>
          </main>

          <footer className="mt-8 text-center text-xs text-gray-600">Nova Farma Ageu — Controle de Faltas</footer>
        </div>
      )}
    </div>
  )
}
