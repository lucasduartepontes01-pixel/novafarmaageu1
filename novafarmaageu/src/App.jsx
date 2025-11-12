import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./index.css";

// 🔹 Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBW6ZTGHyaYwVgT9dog2y-B2Xg44d_047o",
  authDomain: "novafarmaageu-5c519.firebaseapp.com",
  projectId: "novafarmaageu-5c519",
  storageBucket: "novafarmaageu-5c519.firebasestorage.app",
  messagingSenderId: "954166915495",
  appId: "1:954166915495:web:d90f95364e95c8e31b0682",
  measurementId: "G-XNDV0NKV3H",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [loja, setLoja] = useState("");
  const [ean, setEan] = useState("");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [faltas, setFaltas] = useState([]);

  // 🔹 Login fixo
  const handleLogin = () => {
    if (loginUser === "admin" && loginPass === "75611814lucas") {
      setLoggedIn(true);
    } else {
      alert("Usuário ou senha incorretos!");
    }
  };

  // 🔹 Carregar faltas
  useEffect(() => {
    const carregar = async () => {
      const querySnapshot = await getDocs(collection(db, "faltas"));
      const dados = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFaltas(dados);
    };
    carregar();
  }, []);

  // 🔹 Adicionar ou atualizar produto
  const handleAdd = async () => {
    if (!ean || !nome || !quantidade || !loja) {
      alert("Preencha todos os campos!");
      return;
    }

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString("pt-BR");

    const q = query(collection(db, "faltas"), where("ean", "==", ean), where("loja", "==", loja));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(db, "faltas", querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        quantidade: Number(quantidade),
        data: dataFormatada,
      });
      alert("Falta atualizada com sucesso!");
    } else {
      await addDoc(collection(db, "faltas"), {
        loja,
        ean,
        nome,
        quantidade: Number(quantidade),
        data: dataFormatada,
      });
      alert("Falta adicionada!");
    }

    setEan("");
    setNome("");
    setQuantidade("");
  };

  // 🔹 Excluir produto
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "faltas", id));
    setFaltas(faltas.filter((f) => f.id !== id));
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-yellow-100">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Login Nova Farma Ageu</h1>
        <input
          placeholder="Usuário"
          className="p-2 border rounded mb-2"
          value={loginUser}
          onChange={(e) => setLoginUser(e.target.value)}
        />
        <input
          placeholder="Senha"
          type="password"
          className="p-2 border rounded mb-4"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-3xl font-bold text-center text-red-700 mb-6">
        Sistema de Faltas - Nova Farma Ageu
      </h1>

      {/* Seleção de Loja */}
      <div className="mb-6 flex justify-center">
        <select
          value={loja}
          onChange={(e) => setLoja(e.target.value)}
          className="border p-2 rounded text-red-700"
        >
          <option value="">Selecione a loja</option>
          <option value="Nova Farma Ageu Primavera">Loja 1 – Nova Farma Ageu Primavera</option>
          <option value="Nova Farma Ageu P. Paulista">Loja 2 – Nova Farma Ageu P. Paulista</option>
          <option value="Nova Farma Ageu Vila S. Luiz">Loja 3 – Nova Farma Ageu Vila S. Luiz</option>
        </select>
      </div>

      {/* Formulário de Produto */}
      <div className="bg-white p-4 rounded-lg shadow-md max-w-xl mx-auto mb-6">
        <h2 className="text-xl font-semibold text-red-700 mb-4 text-center">Adicionar Produto</h2>
        <input
          placeholder="EAN"
          className="border p-2 rounded w-full mb-2"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
        <input
          placeholder="Nome do Produto"
          className="border p-2 rounded w-full mb-2"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Quantidade"
          type="number"
          className="border p-2 rounded w-full mb-4"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700 transition"
        >
          Adicionar Produto
        </button>
      </div>

      {/* Lista de Faltas */}
      <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-700 mb-4 text-center">Faltas Registradas</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-red-100">
              <th className="border p-2">Loja</th>
              <th className="border p-2">EAN</th>
              <th className="border p-2">Produto</th>
              <th className="border p-2">Qtd</th>
              <th className="border p-2">Data</th>
              <th className="border p-2">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {faltas.map((f) => (
              <tr key={f.id}>
                <td className="border p-2">{f.loja}</td>
                <td className="border p-2">{f.ean}</td>
                <td className="border p-2">{f.nome}</td>
                <td className="border p-2">{f.quantidade}</td>
                <td className="border p-2">{f.data}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

