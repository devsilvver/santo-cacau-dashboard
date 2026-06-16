import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  Search,
  Minus,
  Plus,
  Loader2,
  LogOut,
  Lock,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ==========================================
// EMAILS PERMITIDOS (COLOQUE O SEU AQUI)
// ==========================================
const ALLOWED_EMAILS = [
  "guilhermesilvestrini1@gmail.com", // <-- ALTERE PARA O SEU E-MAIL DO GOOGLE
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  stock_quantity: number;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

const CATEGORIES = ["Brigadeiros", "Bolos", "Brownies", "Combos"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [view, setView] = useState<"PRODUCTS" | "PROD_FORM">("PRODUCTS");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [prodForm, setProdForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Brigadeiros",
    emoji: "🍫",
    stock_quantity: "0",
  });

  // Verifica se o usuário já está logado ao abrir a página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && ALLOWED_EMAILS.includes(currentUser.email || "")) {
        loadProducts();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if (!ALLOWED_EMAILS.includes(result.user.email || "")) {
        await signOut(auth);
        alert(
          "Acesso Negado: Este e-mail não tem permissão para acessar o painel.",
        );
      }
    } catch (error) {
      console.error("Erro ao fazer login", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setProducts([]);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const loadedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        loadedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(loadedProducts);
    } catch (error) {
      showToast(
        "Erro ao carregar produtos. Verifique suas permissões.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(String(prodForm.price).replace(",", ".")),
      category: prodForm.category,
      emoji: prodForm.emoji,
      stock_quantity: parseInt(prodForm.stock_quantity) || 0,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        showToast("Produto atualizado!", "success");
      } else {
        await addDoc(collection(db, "products"), payload);
        showToast("Produto criado!", "success");
      }
      loadProducts();
      setView("PRODUCTS");
    } catch (error) {
      showToast("Erro ao salvar produto. Sem permissão?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este produto?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      showToast("Produto excluído.", "success");
      loadProducts();
    } catch (error) {
      showToast("Erro ao excluir produto.", "error");
    }
  };

  const persistStock = async (id: string, newQuantity: number) => {
    try {
      await updateDoc(doc(db, "products", id), { stock_quantity: newQuantity });
      showToast("Estoque salvo.", "success");
    } catch (e) {
      showToast("Erro ao salvar estoque.", "error");
      loadProducts();
    }
  };

  const updateStock = (id: string, current: number, change: number) => {
    const newStock = Math.max(0, current + change);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_quantity: newStock } : p)),
    );
    persistStock(id, newStock);
  };

  const handleEditProd = (p: Product) => {
    setEditingId(p.id);
    setProdForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      emoji: p.emoji,
      stock_quantity: String(p.stock_quantity),
    });
    setView("PROD_FORM");
  };

  const handleCreateProd = () => {
    setEditingId(null);
    setProdForm({
      name: "",
      description: "",
      price: "",
      category: "Brigadeiros",
      emoji: "✨",
      stock_quantity: "0",
    });
    setView("PROD_FORM");
  };

  const formatMoney = (v: number) => {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // ==========================================
  // TELA DE LOGIN
  // ==========================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
        <Loader2 className="w-10 h-10 text-[#B58E38] animate-spin" />
      </div>
    );
  }

  if (!user || !ALLOWED_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB] p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B58E38] opacity-10 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2A1610] opacity-5 rounded-tr-full pointer-events-none" />

        <div className="bg-white p-10 rounded-[32px] shadow-2xl max-w-md w-full border border-[#B58E38]/20 relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#F5F2EB] rounded-full flex items-center justify-center text-[#2A1610] mb-6 shadow-inner">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-serif italic text-[#2A1610] mb-2">
            Painel Restrito
          </h1>
          <p className="text-[#2A1610]/60 text-sm mb-8">
            Área de gestão exclusiva Santo Cacau. Faça login para continuar.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-[#2A1610] hover:bg-[#1A0D09] text-white py-4 rounded-full font-bold shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <svg
              className="w-5 h-5 bg-white rounded-full p-0.5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DO DASHBOARD PRINCIPAL
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F2EB] text-[#2A1610] font-sans overflow-hidden">
      {/* TOASTS (Mesmo de antes) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all border-l-4 bg-white ${t.type === "success" ? "border-green-500 text-slate-700" : t.type === "error" ? "border-red-500 text-slate-700" : "border-yellow-500 text-slate-700"}`}
          >
            <div
              className={`p-2 rounded-full shrink-0 ${t.type === "success" ? "bg-green-100 text-green-600" : t.type === "error" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}
            >
              {t.type === "success" ? (
                <CheckCircle size={20} />
              ) : t.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>
            <div className="min-w-[200px]">
              <p className="font-bold text-sm mb-0.5">
                {t.type === "success"
                  ? "Sucesso"
                  : t.type === "error"
                    ? "Erro"
                    : "Atenção"}
              </p>
              <p className="text-xs text-slate-500 leading-snug">{t.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#2A1610] text-white flex flex-col shadow-2xl border-r border-[#B58E38]/20 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B58E38] opacity-10 rounded-bl-full pointer-events-none" />
        <div className="p-8 flex flex-col items-center border-b border-white/10 relative z-10">
          <div className="bg-white p-2 rounded-full mb-4 shadow-lg shadow-white/5">
            <div className="w-16 h-16 bg-[#F5F2EB] rounded-full flex items-center justify-center text-[#2A1610] font-serif font-bold text-xl">
              SC
            </div>
          </div>
          <h1 className="text-xl font-serif italic text-[#B58E38] tracking-tight">
            Santo Cacau
          </h1>
          <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">
            Painel Gestor
          </p>
        </div>

        <nav className="flex-1 px-4 mt-6 relative z-10">
          <button
            onClick={() => setView("PRODUCTS")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${view === "PRODUCTS" ? "bg-[#B58E38] text-white font-bold shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
          >
            <Package size={20} /> Controle de Estoque
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img
              src={user.photoURL || ""}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-[#B58E38]"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {user.displayName}
              </p>
              <p className="text-[10px] text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all text-sm font-bold"
          >
            <LogOut size={16} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (O mesmo de antes) */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-[#F5F2EB]/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#B58E38] animate-spin" />
          </div>
        )}

        <div className="p-8 max-w-6xl mx-auto min-h-full">
          {view === "PRODUCTS" && (
            <div className="animate-enter">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-[#2A1610] italic">
                    Inventário
                  </h2>
                  <p className="text-[#2A1610]/60 mt-1 text-sm">
                    Controle seus produtos, preços e disponibilidade.
                  </p>
                </div>
                <button
                  onClick={handleCreateProd}
                  className="bg-[#B58E38] hover:bg-[#9E7A2E] text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-all text-sm"
                >
                  <PlusCircle size={18} /> Cadastrar Doce
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-[#B58E38]/20 overflow-hidden">
                <div className="p-4 bg-[#F5F2EB] border-b border-[#B58E38]/10">
                  <div className="relative w-full max-w-md">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A1610]/40"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar doce..."
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-[#B58E38]/20 focus:border-[#B58E38] outline-none transition-all text-sm bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-white text-[#2A1610]/50 text-xs uppercase font-bold tracking-widest border-b border-[#B58E38]/10">
                    <tr>
                      <th className="px-6 py-5">Produto</th>
                      <th className="px-6 py-5">Estoque</th>
                      <th className="px-6 py-5">Preço</th>
                      <th className="px-6 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B58E38]/10">
                    {products
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-[#F5F2EB]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#F5F2EB] rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                                {p.emoji}
                              </div>
                              <div>
                                <span className="font-bold text-[#2A1610] block">
                                  {p.name}
                                </span>
                                <span className="text-xs font-semibold text-[#B58E38] uppercase tracking-wider">
                                  {p.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 bg-white w-fit px-2 py-1 rounded-full border border-[#B58E38]/20 shadow-sm">
                              <button
                                onClick={() =>
                                  updateStock(p.id, p.stock_quantity, -1)
                                }
                                className="p-1.5 hover:bg-[#F5F2EB] rounded-full text-[#2A1610]/50 hover:text-red-500 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                className="w-10 text-center bg-transparent outline-none font-bold text-sm text-[#2A1610]"
                                value={p.stock_quantity}
                                onChange={(e) =>
                                  updateStock(
                                    p.id,
                                    p.stock_quantity,
                                    parseInt(e.target.value) -
                                      p.stock_quantity || 0,
                                  )
                                }
                              />
                              <button
                                onClick={() =>
                                  updateStock(p.id, p.stock_quantity, 1)
                                }
                                className="p-1.5 hover:bg-[#F5F2EB] rounded-full text-[#2A1610]/50 hover:text-green-600 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#B58E38] text-lg">
                            {formatMoney(p.price)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditProd(p)}
                                className="p-2 text-[#2A1610]/50 hover:bg-[#F5F2EB] hover:text-[#B58E38] rounded-full transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 text-[#2A1610]/50 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {products.length === 0 && !loading && (
                  <div className="p-10 text-center text-[#2A1610]/40 font-serif italic text-lg">
                    Nenhum produto cadastrado.
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "PROD_FORM" && (
            <div className="max-w-2xl mx-auto animate-enter">
              <button
                onClick={() => setView("PRODUCTS")}
                className="mb-6 text-[#2A1610]/60 hover:text-[#2A1610] flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors"
              >
                <X size={18} /> Voltar para lista
              </button>

              <div className="bg-white rounded-3xl shadow-xl border border-[#B58E38]/20 overflow-hidden">
                <div className="bg-[#2A1610] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#B58E38] opacity-20 rounded-bl-full pointer-events-none" />
                  <h2 className="font-serif italic text-3xl relative z-10">
                    {editingId ? "Editar Doce" : "Novo Doce"}
                  </h2>
                  <p className="text-white/60 text-sm mt-1 relative z-10">
                    Preencha os detalhes para a vitrine do cliente.
                  </p>
                </div>

                <form onSubmit={handleSaveProd} className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                      Nome do Produto
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] transition-all"
                      value={prodForm.name}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                        Categoria
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] transition-all"
                        value={prodForm.category}
                        onChange={(e) =>
                          setProdForm({ ...prodForm, category: e.target.value })
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                        Preço (R$)
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] transition-all"
                        value={prodForm.price}
                        onChange={(e) =>
                          setProdForm({ ...prodForm, price: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                        Emoji
                      </label>
                      <input
                        maxLength={2}
                        className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] text-center text-xl transition-all"
                        value={prodForm.emoji}
                        onChange={(e) =>
                          setProdForm({ ...prodForm, emoji: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                      Descrição
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] transition-all resize-none"
                      value={prodForm.description}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#B58E38] mb-1.5 tracking-widest">
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-[#F5F2EB] border border-transparent rounded-xl focus:border-[#B58E38] focus:bg-white outline-none text-[#2A1610] transition-all"
                      value={prodForm.stock_quantity}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          stock_quantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="pt-4 border-t border-[#B58E38]/10">
                    <button
                      type="submit"
                      className="w-full bg-[#B58E38] hover:bg-[#9E7A2E] text-white py-4 rounded-xl font-bold shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
