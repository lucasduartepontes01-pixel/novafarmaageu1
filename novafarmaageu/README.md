# Nova Farma Ageu - App

Projeto React + Vite + Tailwind + Firebase Firestore.

## Como usar localmente

1. Extraia o projeto.
2. No diretório do projeto, instale dependências:
   ```
   npm install
   ```
3. Rode em modo desenvolvimento:
   ```
   npm run dev
   ```
4. Abra no navegador (geralmente http://localhost:5173).

## Credenciais padrão
- Usuário: `admin`
- Senha: `75611814lucas`

## Firebase
O projeto já contém suas credenciais do Firebase em `src/firebase.js`. Certifique-se de ativar o **Firestore** no console do Firebase (collections -> faltas será criada automaticamente).

## Deploy na Vercel (passos rápidos)
1. Crie uma conta em https://vercel.com (ou entre com GitHub/Google).
2. Suba este repositório para o GitHub (ou use `vercel` CLI).
3. No painel Vercel, clique em "New Project" e conecte ao repositório.
4. Configure o build command: `npm run build` e output directory: `dist`.
5. Deploy. Em segundos o site ficará disponível.

> Alternativa: você pode usar o botão **Import Project** no Vercel para conectar diretamente ao GitHub.

## Observações
- O app foi criado com foco em usabilidade rápida. Recomendo revisar regras de segurança do Firestore (Firestore Rules) para proteger dados caso necessário.
- Para melhorar, podemos adicionar autenticação via Firebase Auth e controle por usuário/loja.

