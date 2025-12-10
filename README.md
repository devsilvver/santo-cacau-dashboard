# 🥃 Celeiro Admin | Painel de Gestão

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-Propriet%C3%A1rio-red?style=for-the-badge)

> Dashboard administrativo exclusivo para o e-commerce **Celeiro da Cachaça**. Oferece controle total sobre o catálogo de produtos, monitoramento de vendas em tempo real e segurança avançada.

### ✨ Funcionalidades

* **📦 Gestão de Estoque:**
    * CRUD completo (Criar, Ler, Atualizar, Deletar) de produtos.
    * Formulário detalhado com campos para preço, teor alcoólico, volume e imagem.
* **💰 Monitoramento de Vendas (Live):**
    * **Atualização em Tempo Real:** Sistema de *polling* que verifica novos pedidos a cada 5 segundos.
    * Visualização detalhada de pedidos com status (Pago, Pendente, Cancelado), dados do cliente e itens comprados.
    * Tratamento automático de pedidos "presos" (cancelamento automático após 24h sem pagamento).
* **🔒 Segurança Avançada (IP Whitelist):**
    * Controle de acesso restrito baseado em endereços IP permitidos.
    * Interface para liberar ou bloquear novos dispositivos remotamente.
* **📱 Interface Moderna:**
    * Design responsivo com sidebar retrátil para uso em mobile.
    * Feedback visual rico com *loaders*, modais de confirmação e notificações de erro.

---

### 🛠️ Tecnologias Utilizadas

* **[React 18](https://react.dev/)** - Biblioteca principal para construção da interface.
* **[Vite](https://vitejs.dev/)** - Build tool para desenvolvimento ágil.
* **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utilitária para design rápido e consistente.
* **[Lucide React](https://lucide.dev/)** - Ícones modernos e leves.
* **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para maior robustez e manutenção do código.

---

### 🚀 Como rodar o projeto

> **Nota:** Este é um painel frontend que depende de uma API Backend específica (`API_URL`) configurada no código para funcionar.

#### 1. Pré-requisitos
* Node.js (v18 ou superior)
* Acesso à API do Celeiro (configurada no arquivo `App.tsx`)

#### 2. Instalação
```bash
# Clone o repositório
git clone [https://github.com/devsilvver/celeiro-admin.git](https://github.com/devsilvver/celeiro-admin.git)
cd celeiro-admin

# Instale as dependências
npm install
```

#### 3. Execução
```bash
# Iniciar em modo de desenvolvimento
npm run dev
```
O painel estará acessível em `http://localhost:5173`.

---

### 📂 Estrutura do Projeto

```text
src/
├── App.tsx           # Lógica central (Roteamento, Estado, Chamadas API)
├── index.html        # Ponto de entrada e configuração do Tailwind
├── index.tsx         # Renderização do React
└── package.json      # Dependências e scripts
```

---

### 👤 Autor

Desenvolvido por **Guilherme Silvestrini**.

<a href="https://www.linkedin.com/in/guilherme-silvestrini-782226233/" target="_blank">
 <img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" target="_blank">
</a>
<a href="mailto:contatosilvestrini@gmail.com">
 <img src="https://img.shields.io/badge/-Gmail-%23D14836?style=for-the-badge&logo=gmail&logoColor=white" target="_blank">
</a>