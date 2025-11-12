import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";

const LOGIN_USER = "admin";
const LOGIN_PASS = "75611814lucas";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loja, setLoja] = useState("");
  const [faltas, setFaltas] = useState([]);
  const [ean, setEan] = useState("");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // 🔹 Efetuar login simples
  const handleLogin = () => {
    if (loginUser === LOGIN_USER && loginPass === LOGIN_PASS) {
      setLoggedIn(true);
    } else {
      alert("Usuário ou senha incorretos!");
    }
  };

  // 🔹 Carregar faltas da loja selecionada
  useEffect(() => {
    const fetchFaltas = async () => {
      if (!loja) return;
      const q = query(
        collection(db, "faltas"),
        where("loja", "==", loja),
        orderBy("data", "desc")
      );
      const querySnapshot = await getDocs(q);
      setFaltas(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchFaltas();
  }, [loja]);

  // 🔹 Adicionar ou atualizar produto
  const handleAdd = async () => {
    if (!ean || !nome || !quantidade || !loja) {
      alert("Preencha todos os campos!");
      return;
    }

    // Verifica se já existe o produto pelo EAN
    const q = query(collection(db, "faltas"), where("ean", "==", ean), where("loja", "==", loja));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Atualiza o registro existente
      const docRef = doc(db, "faltas", querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        quantidade: Number(quantidade),
        data: new Date().toISOString(),
      });
      alert("Falta atualizada com sucesso!");
    } else {
      // Cria novo registro
      await addDoc(collection(db, "faltas"), {
        loja,
        ean,
        nome,
        quantidade: Number(quantidade),
        data: new Date().toISOString(),
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
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 min-h-screen">
      <h1 className="text-center text-3xl font-bold text-red-700 mb-4">
        Nova Farma Ageu - Controle de Faltas
      </h1>

      {!loja ? (
        <div className="flex flex-col items-center">
          <h2 className="text-xl mb-4 font-semibold">Selecione a loja:</h2>
          {[
            "Loja 1 – Nova Farma Ageu Primavera",
            "Loja 2 – Nova Farma Ageu P. Paulista",
            "Loja 3 – Nova Farma Ageu Vila S. Luiz",
          ].map((nomeLoja) => (
            <button
              key={nomeLoja}
              onClick={() => setLoja(nomeLoja)}
              className="bg-red-600 text-white px-6 py-2 rounded mb-2"
            >
              {nomeLoja}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-red-700">{loja}</h2>
            <button
              onClick={() => setLoja("")}
              className="text-sm bg-gray-300 px-3 py-1 rounded"
            >
              Trocar loja
            </button>
          </div>

          {/* Cadastro */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h3 className="text-lg font-bold mb-2">Cadastrar falta</h3>
            <div className="flex gap-2">
              <input
                placeholder="EAN"
                className="border p-2 rounded flex-1"
                value={ean}
                onChange={(e) => setEan(e.target.value)}
              />
              <input
                placeholder="Nome do produto"
                className="border p-2 rounded flex-1"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                placeholder="Quantidade"
                type="number"
                className="border p-2 rounded w-24"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
              <button
                onClick={handleAdd}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-2">Faltas registradas</h3>
            {faltas.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-semibold">{f.nome}</p>
                  <p className="text-sm text-gray-600">
                    EAN: {f.ean} | Quantidade: {f.quantidade} | Data:{" "}
                    {new Date(f.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-sm bg-gray-200 px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

