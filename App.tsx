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
  ShoppingBag,
  Clock,
  User,
  MapPin,
  ChevronDown,
  CheckCircle2,
  XCircle,
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
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as AuthUser,
} from "firebase/auth";

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
// EMAILS PERMITIDOS
// ==========================================
const ALLOWED_EMAILS = [
  "guilhermesilvestrini1@gmail.com", // <-- ALTERE PARA O SEU E-MAIL
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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  deliveryType: string;
  address: string;
  total: number;
  status: "Pendente" | "Concluído" | "Cancelado";
  createdAt: number;
  items: OrderItem[];
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

const CATEGORIES = [
  "Brigadeiros",
  "Bolos",
  "Caixinhas",
  "Caixinhas Temáticas",
  "Combos",
];

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [view, setView] = useState<"PRODUCTS" | "PROD_FORM" | "SALES">("SALES");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

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

  // Escutar Pedidos em Tempo Real
  useEffect(() => {
    if (!user || !ALLOWED_EMAILS.includes(user.email || "")) return;

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const loadedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        loadedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      // Ordena do mais recente para o mais antigo
      loadedOrders.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(loadedOrders);
    });

    return () => unsubscribe();
  }, [user]);

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
    setOrders([]);
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
      showToast("Erro ao carregar produtos.", "error");
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
      showToast("Erro ao salvar produto.", "error");
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

  const updateStock = async (id: string, current: number, change: number) => {
    const newStock = Math.max(0, current + change);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_quantity: newStock } : p)),
    );
    try {
      await updateDoc(doc(db, "products", id), { stock_quantity: newStock });
    } catch (e) {
      loadProducts();
      showToast("Erro ao atualizar estoque.", "error");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      showToast(`Pedido marcado como ${newStatus}`, "success");
    } catch (e) {
      showToast("Erro ao atualizar pedido.", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Tem certeza que deseja excluir o histórico deste pedido?"))
      return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      showToast("Pedido excluído.", "success");
    } catch (e) {
      showToast("Erro ao excluir pedido.", "error");
    }
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

  const formatMoney = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return (
      d.toLocaleDateString("pt-BR") +
      " às " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case "Concluído":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pendente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cancelado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
        <Loader2 className="w-10 h-10 text-[#B58E38] animate-spin" />
      </div>
    );

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
            Área de gestão exclusiva Santo Cacau.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-[#2A1610] hover:bg-[#1A0D09] text-white py-4 rounded-full font-bold shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F2EB] text-[#2A1610] font-sans overflow-hidden">
      {/* TOASTS */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all border-l-4 bg-white ${t.type === "success" ? "border-green-500 text-slate-700" : t.type === "error" ? "border-red-500 text-slate-700" : "border-yellow-500 text-slate-700"}`}
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
        </div>

        <nav className="flex-1 px-4 mt-6 relative z-10 space-y-2">
          <button
            onClick={() => setView("SALES")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${view === "SALES" ? "bg-[#B58E38] text-white font-bold shadow-lg" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
          >
            <ShoppingBag size={20} /> Pedidos em Tempo Real
            {orders.filter((o) => o.status === "Pendente").length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {orders.filter((o) => o.status === "Pendente").length}
              </span>
            )}
          </button>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-[#F5F2EB]/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#B58E38] animate-spin" />
          </div>
        )}

        <div className="p-8 max-w-6xl mx-auto min-h-full">
          {/* VIEW: VENDAS (PEDIDOS) */}
          {view === "SALES" && (
            <div className="animate-enter pb-10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-serif text-[#2A1610] italic">
                    Pedidos e Vendas
                  </h2>
                  <p className="text-[#2A1610]/60 mt-1 text-sm">
                    Acompanhe novos pedidos em tempo real.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{" "}
                  AO VIVO
                </div>
              </div>

              <div className="grid gap-4">
                {orders.map((o) => {
                  const isOpen = openOrderId === o.id;
                  return (
                    <div
                      key={o.id}
                      className="bg-white rounded-3xl shadow-sm border border-[#B58E38]/20 overflow-hidden transition-all"
                    >
                      {/* HEADER DO PEDIDO */}
                      <button
                        onClick={() => setOpenOrderId(isOpen ? null : o.id)}
                        className={`w-full flex justify-between items-center p-6 transition-all ${isOpen ? "bg-[#F5F2EB]" : "hover:bg-[#F5F2EB]/50"}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-left">
                            <p
                              className={`text-lg font-bold font-serif ${isOpen ? "text-[#B58E38]" : "text-[#2A1610]"}`}
                            >
                              {o.customerName}
                            </p>
                            <p className="text-xs text-[#2A1610]/50 mt-1 flex items-center gap-1">
                              <Clock size={12} /> {formatDate(o.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyle(o.status)}`}
                          >
                            {o.status}
                          </span>
                          <span
                            className={`font-bold text-xl ${isOpen ? "text-[#B58E38]" : "text-[#2A1610]"}`}
                          >
                            {formatMoney(o.total)}
                          </span>
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-[#B58E38]" : "text-[#2A1610]/40"}`}
                          />
                        </div>
                      </button>

                      {/* DETALHES DO PEDIDO EXPANDIDO */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[1000px] border-t border-[#B58E38]/20" : "max-h-0"}`}
                      >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                          {/* Coluna 1: Cliente e Ações */}
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-xs font-bold text-[#B58E38] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <MapPin size={16} /> Entrega / Retirada
                              </h4>
                              <div className="bg-[#F5F2EB] p-4 rounded-2xl border border-[#B58E38]/10 shadow-sm">
                                <p className="font-bold text-[#2A1610] uppercase text-sm mb-2">
                                  {o.deliveryType}
                                </p>
                                <p className="text-[#2A1610]/70 text-sm whitespace-pre-line">
                                  {o.deliveryType === "entrega"
                                    ? o.address
                                    : "Cliente fará a retirada na loja."}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-[#B58E38] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <LayoutDashboard size={16} /> Atualizar Status
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(o.id, "Concluído")
                                  }
                                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={16} /> Concluir
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(o.id, "Cancelado")
                                  }
                                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircle size={16} /> Cancelar
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 2: Itens do Pedido */}
                          <div className="flex flex-col h-full">
                            <h4 className="text-xs font-bold text-[#B58E38] uppercase tracking-widest mb-3 flex items-center gap-2">
                              <ShoppingBag size={16} /> Itens Solicitados
                            </h4>
                            <div className="bg-[#F5F2EB] rounded-2xl border border-[#B58E38]/10 overflow-hidden flex-1 shadow-sm p-2">
                              <table className="w-full text-left text-sm">
                                <tbody className="divide-y divide-[#B58E38]/10">
                                  {o.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="p-3 font-bold text-[#2A1610]">
                                        <span className="text-[#B58E38] mr-2">
                                          {item.quantity}x
                                        </span>
                                        {item.name}
                                      </td>
                                      <td className="p-3 text-right font-bold text-[#2A1610]/60">
                                        {formatMoney(
                                          item.price * item.quantity,
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div className="text-center py-24 text-[#2A1610]/40 font-serif italic text-lg">
                    Nenhum pedido registrado ainda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: PRODUTOS (MANTIDO EXATAMENTE IGUAL) */}
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
              </div>
            </div>
          )}

          {/* VIEW: FORMULÁRIO (MANTIDO) */}
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
                  <button
                    type="submit"
                    className="w-full bg-[#B58E38] hover:bg-[#9E7A2E] text-white py-4 rounded-xl font-bold shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Salvar Produto
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
