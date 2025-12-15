import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Trash2,
  Save,
  Search,
  Edit,
  X,
  AlertTriangle,
  ShoppingBag,
  Shield,
  User,
  Menu,
  Lock,
  Loader2,
  Github,
  Package,
  Clock,
  DollarSign,
  Terminal,
  Minus,
  Plus,
  Palette,
  CheckSquare,
  Square,
  ImageIcon,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Monitor,
  PackageOpen,
} from "lucide-react";

const API_URL = "https://api-celeiro-da-cachaca.onrender.com";

// --- INTERFACES ---

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface ShippingBox {
  id: number;
  name: string;
  height: string;
  width: string;
  length: string;
  weight: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  packaging: string;
  type: string;
  abv: number;
  volume: string;
  stock_quantity: number;
  height?: string;
  width?: string;
  length?: string;
  weight?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  image: string;
}

interface Order {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  shipping_address: string;
  mp_payment_id: string;
  full_name: string;
  email: string;
  phone: string;
  items: OrderItem[];
}

interface AllowedIp {
  id: number;
  ip_address: string;
  description: string;
  created_at: string;
}
interface LogMessage {
  type: string;
  ip: string;
  timestamp: string;
  message: string;
}

// --- NOVAS INTERFACES DO CMS ---
interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface SiteConfig {
  banner_tag: string;
  banner_title: string;
  banner_image: string;
  banner_bg_color: string;
  banner_bg_image: string;
  section_tag: string;
  section_title: string;
  section_image: string;
  highlight_ids: string[];
  hero_slides: HeroSlide[]; // Novo campo para o carrossel
}

// --- COMPONENTES DE PRÉ-VISUALIZAÇÃO ---

const CarouselPreview = ({ slides }: { slides: HeroSlide[] }) => {
  const [current, setCurrent] = useState(0);

  // Efeito de rotação automática no preview
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      3000
    );
    return () => clearInterval(timer);
  }, [slides]);

  const slide = slides[current] || {
    image: "",
    title: "Preview",
    subtitle: "...",
  };

  return (
    <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden relative group border border-slate-200 shadow-sm">
      {/* Imagem de Fundo */}
      {slide.image ? (
        <img
          src={slide.image}
          className="w-full h-full object-cover opacity-70 transition-all duration-700"
          alt="Slide"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-100 flex-col gap-2">
          <ImageIcon size={32} />
          <span className="text-xs">Sem Imagem</span>
        </div>
      )}

      {/* Texto Sobreposto */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 text-white z-10 bg-gradient-to-r from-black/60 to-transparent">
        <h2 className="text-xl md:text-3xl font-serif font-bold mb-2 drop-shadow-lg leading-tight max-w-[80%]">
          {slide.title || "Título do Slide"}
        </h2>
        <p className="text-xs md:text-sm opacity-90 drop-shadow-md font-light max-w-[70%]">
          {slide.subtitle || "Subtítulo descritivo."}
        </p>
      </div>

      {/* Indicadores (Bolinhas) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white w-6" : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const BannerPreview = ({ config }: { config: SiteConfig }) => (
  <div
    className="w-full py-8 px-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800 shadow-xl transition-all duration-500 bg-cover bg-center"
    style={{
      backgroundColor: config.banner_bg_color || "#1A1A1A",
      backgroundImage: config.banner_bg_image
        ? `url(${config.banner_bg_image})`
        : "none",
    }}
  >
    {config.banner_bg_image && (
      <div className="absolute inset-0 bg-black/40 z-0"></div>
    )}
    {!config.banner_bg_image && (
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px]"></div>
    )}

    <div className="relative z-10 text-left max-w-sm">
      <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 border border-white/30 backdrop-blur-sm">
        {config.banner_tag || "TAG DO BANNER"}
      </span>
      <h2 className="text-xl font-serif font-bold text-white mb-3 leading-tight drop-shadow-md">
        {config.banner_title || "Título do Banner"}
      </h2>
      <div className="flex gap-2">
        <div className="w-24 h-8 bg-white/20 backdrop-blur-md rounded-lg border border-white/10"></div>
      </div>
    </div>

    <div className="relative z-10 w-24 h-24 shrink-0 animate-float">
      {config.banner_image ? (
        <img
          src={config.banner_image}
          className="w-full h-full object-contain drop-shadow-2xl"
          alt="Banner Icon"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="w-full h-full border-2 border-dashed border-white/30 rounded-full flex items-center justify-center text-white/50 text-xs text-center p-2">
          <ImageIcon size={20} className="mb-1 opacity-50" />
        </div>
      )}
    </div>
  </div>
);

const SectionPreview = ({
  config,
  products,
}: {
  config: SiteConfig;
  products: Product[];
}) => {
  const previewProducts = products
    .filter((p) => config.highlight_ids.includes(p.id))
    .slice(0, 2);
  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gray-50 rounded-full shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
          {config.section_image ? (
            <img
              src={config.section_image}
              className="w-full h-full object-contain p-2"
              alt="Icon"
            />
          ) : (
            <ImageIcon className="text-gray-300" size={20} />
          )}
        </div>
        <div>
          <span className="text-green-600 text-[10px] font-bold tracking-widest uppercase block mb-1">
            {config.section_tag || "TAG DA SEÇÃO"}
          </span>
          <h2 className="text-lg font-serif text-gray-800 font-bold leading-none">
            {config.section_title || "Título da Seção"}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {previewProducts.length > 0 ? (
          previewProducts.map((p) => (
            <div
              key={p.id}
              className="aspect-[3/4] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden"
            >
              <img
                src={p.image_url}
                className="h-12 w-auto object-contain mb-2"
                alt=""
              />
              <div className="w-16 h-2 bg-gray-200 rounded-full mb-1"></div>
              <div className="w-8 h-2 bg-green-100 rounded-full"></div>
            </div>
          ))
        ) : (
          <>
            <div className="aspect-[3/4] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
              Produto 1
            </div>
            <div className="aspect-[3/4] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
              Produto 2
            </div>
          </>
        )}
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-3">
        Exibindo {config.highlight_ids.length} produtos selecionados
      </p>
    </div>
  );
};

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [view, setView] = useState<
    | "PRODUCTS"
    | "PROD_FORM"
    | "SALES"
    | "SECURITY"
    | "LOGS"
    | "SITE_CONFIG"
    | "SHIPPING_BOXES"
  >("PRODUCTS");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [boxes, setBoxes] = useState<ShippingBox[]>([]);
  const [boxForm, setBoxForm] = useState({
    name: "",
    height: "",
    width: "",
    length: "",
    weight: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ips, setIps] = useState<AllowedIp[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ESTADO DE CONFIGURAÇÃO DO SITE (CMS)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    banner_tag: "",
    banner_title: "",
    banner_image: "",
    banner_bg_color: "#1A1A1A", // Default
    banner_bg_image: "",
    section_tag: "",
    section_title: "",
    section_image: "",
    highlight_ids: [],
    // ESTADO INICIAL PREENCHIDO (Pode ser editado/removido na dashboard)
    hero_slides: [
      {
        image: "https://i.imgur.com/kBnu4IB.jpeg",
        title: "Cachaça Artesanal de Figo",
        subtitle: "Um sabor inesquecível.",
      },
    ],
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000
    );
  };

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    description: "",
    price: "",
    packaging: "Garrafa PET",
    type: "Curtida",
    imageUrl: "",
    abv: "38.0",
    volume: "1L",
    stock_quantity: "0",
  });
  const [ipForm, setIpForm] = useState({ ip: "", desc: "" });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "PROD" | "IP" | null;
    id: string | number | null;
  }>({ open: false, type: null, id: null });

  const verifyAccess = async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      if (res.ok) {
        setIsAuthorized(true);
        loadProducts();
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };
  useEffect(() => {
    verifyAccess();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAuthorized) {
      if (view === "SALES") loadOrders();
      if (view === "PRODUCTS") loadProducts();
      interval = setInterval(() => {
        if (view === "SALES") loadOrders();
        if (view === "PRODUCTS") loadProducts();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [view, isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    const eventSource = new EventSource(`${API_URL}/api/logs/stream`);
    eventSource.onmessage = (event) => {
      try {
        setLogs((prev) => [JSON.parse(event.data), ...prev]);
      } catch {}
    };
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [isAuthorized]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadBoxes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/shipping-boxes`);
      if (res.ok) setBoxes(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/shipping-boxes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boxForm),
      });
      if (res.ok) {
        loadBoxes();
        setBoxForm({ name: "", height: "", width: "", length: "", weight: "" });
        showToast("Caixa cadastrada!", "success");
      } else {
        showToast("Erro ao salvar caixa", "error");
      }
    } catch (e) {
      showToast("Erro de conexão", "error");
    }
  };

  const handleDeleteBox = async (id: number) => {
    if (!confirm("Remover esta caixa?")) return;
    try {
      await fetch(`${API_URL}/api/shipping-boxes/${id}`, { method: "DELETE" });
      loadBoxes();
      showToast("Caixa removida", "success");
    } catch (e) {
      showToast("Erro ao remover", "error");
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {}
  };
  const loadIps = async () => {
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      if (res.ok) {
        const data = await res.json();
        setIps(data);
      }
    } catch {}
  };

  const loadSiteConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/site-config`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.highlight_ids === "string")
          data.highlight_ids = JSON.parse(data.highlight_ids);
        // Parse dos slides se vier como string do banco
        if (typeof data.hero_slides === "string")
          data.hero_slides = JSON.parse(data.hero_slides);

        // Se vier vazio do banco (null ou array vazio), mantém o estado inicial (Figo) para não quebrar a primeira vez
        // Mas se vier um array preenchido, usa ele.
        if (
          data.hero_slides &&
          Array.isArray(data.hero_slides) &&
          data.hero_slides.length > 0
        ) {
          // Usa o que vem do banco
        } else {
          // Se o banco não tem slides, usa o padrão do Figo que já está no useState
          data.hero_slides = siteConfig.hero_slides;
        }

        setSiteConfig(data);
      }
    } catch (e) {
      console.error("Erro config site", e);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      if (view === "PRODUCTS") loadProducts();
      if (view === "SECURITY") loadIps();
      if (view === "SITE_CONFIG") {
        loadProducts();
        loadSiteConfig();
      }
      if (view === "SHIPPING_BOXES") loadBoxes();
    }
  }, [view, isAuthorized]);

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceString = String(prodForm.price).replace(",", ".");
    const abvString = String(prodForm.abv).replace(",", ".");
    const priceFinal = parseFloat(priceString);
    const abvFinal = parseFloat(abvString);

    if (isNaN(priceFinal) || isNaN(abvFinal)) {
      showToast(
        "O preço e o teor alcoólico devem ser números válidos.",
        "warning"
      );
      return;
    }

    const payload = {
      ...prodForm,
      price: priceFinal,
      abv: abvFinal,
      stock_quantity: Number(prodForm.stock_quantity),
    };
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 403) {
        setIsAuthorized(false);
        return;
      }

      if (res.ok) {
        await loadProducts();
        if (!editingId) handleCreateProd();
        setView("PRODUCTS");
        showToast(
          editingId
            ? "Produto atualizado com sucesso!"
            : "Produto criado com sucesso!",
          "success"
        );
      } else {
        const errorData = await res.json();
        showToast("Erro: " + (errorData.error || errorData.message), "error");
      }
    } catch (e) {
      showToast("Erro de conexão com o servidor.", "error");
    }
  };

  const persistStock = async (id: string, newQuantity: number) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error();
      showToast("Estoque atualizado.", "success");
    } catch (e) {
      showToast("Erro ao salvar estoque.", "error");
      loadProducts();
    }
  };

  const updateStock = (id: string, current: number, change: number) => {
    const n = Math.max(0, current + change);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_quantity: n } : p))
    );
    persistStock(id, n);
  };

  const handleManualStock = (id: string, v: string) => {
    const n = parseInt(v);
    if (!isNaN(n))
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock_quantity: n } : p))
      );
  };

  const handleEditProd = (p: Product) => {
    setEditingId(p.id);
    setProdForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      packaging: p.packaging,
      type: p.type,
      imageUrl: p.image_url,
      abv: String(p.abv),
      volume: p.volume,
      stock_quantity: String(p.stock_quantity),
    });
    setView("PROD_FORM");
    setIsSidebarOpen(false);
  };

  const handleCreateProd = () => {
    setEditingId(null);
    setProdForm({
      name: "",
      description: "",
      price: "",
      packaging: "Garrafa PET",
      type: "Curtida",
      imageUrl: "",
      abv: "38.0",
      volume: "1L",
      stock_quantity: "0",
    });
    setView("PROD_FORM");
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/site-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig),
      });
      if (res.ok) showToast("Site atualizado com sucesso!", "success");
      else showToast("Erro ao atualizar site.", "error");
    } catch (e) {
      showToast("Erro de conexão.", "error");
    }
  };

  const toggleHighlight = (productId: string) => {
    setSiteConfig((prev) => {
      const ids = prev.highlight_ids || [];
      if (ids.includes(productId))
        return { ...prev, highlight_ids: ids.filter((id) => id !== productId) };
      return { ...prev, highlight_ids: [...ids, productId] };
    });
  };

  const handleSaveIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip_address: ipForm.ip,
          description: ipForm.desc,
        }),
      });
      if (res.status === 403) {
        setIsAuthorized(false);
        return;
      }
      setIpForm({ ip: "", desc: "" });
      loadIps();
      showToast("IP liberado com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao salvar IP.", "error");
    }
  };
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      let url =
        deleteModal.type === "PROD"
          ? `${API_URL}/api/products/${deleteModal.id}`
          : `${API_URL}/api/allowed-ips/${deleteModal.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.status === 403) {
        setIsAuthorized(false);
        return;
      }

      if (deleteModal.type === "PROD") {
        loadProducts();
        showToast("Produto excluído.", "success");
      } else {
        loadIps();
        showToast("Acesso revogado.", "success");
      }

      setDeleteModal({ open: false, type: null, id: null });
    } catch (e) {
      showToast("Erro ao excluir.", "error");
    }
  };

  const formatMoney = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatDate = (date: string) => {
    try {
      return (
        new Date(date).toLocaleDateString("pt-BR") +
        " às " +
        new Date(date).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return date;
    }
  };
  const getStatusStyle = (st: string) => {
    switch (st) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };
  const translateStatus = (st: string) => {
    const map: any = {
      paid: "Pago",
      pending: "Pendente",
      cancelled: "Cancelado",
    };
    return map[st] || st;
  };
  const navClick = (v: any) => {
    setView(v);
    setIsSidebarOpen(false);
  };
  const preventNonNumeric = (e: React.KeyboardEvent) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  if (isCheckingAuth)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  if (!isAuthorized)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <Lock className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Acesso Negado</h1>
          <p className="text-slate-500 mt-2">IP não autorizado.</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* --- INSERIR AQUI O BLOCO DE TOASTS --- */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-enter border-l-4 ${
              toast.type === "success"
                ? "bg-white border-green-500 text-green-800"
                : toast.type === "error"
                ? "bg-white border-red-500 text-red-800"
                : "bg-white border-yellow-500 text-yellow-800"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
            {toast.type === "error" && (
              <XCircle size={20} className="text-red-500" />
            )}
            {toast.type === "warning" && (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-bold text-yellow-500 text-lg tracking-wide">
            Celeiro Admin
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-slate-800`}
      >
        <div className="p-8 hidden md:flex flex-col items-center border-b border-slate-800 bg-slate-900/50">
          <div className="bg-amber-50 p-3 rounded-2xl mb-4 shadow-lg shadow-yellow-500/10 hover:scale-105 transition-transform duration-300">
            <img
              src="https://i.imgur.com/Q3oTWj1.png"
              className="w-20 h-auto object-contain"
              alt="logo"
            />
          </div>
          <h1 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
            Celeiro Admin
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-800 px-3 py-1 rounded-full">
            Online
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {[
            { id: "PRODUCTS", icon: LayoutDashboard, label: "Produtos" },
            { id: "SHIPPING_BOXES", icon: PackageOpen, label: "Embalagens" },
            { id: "SALES", icon: ShoppingBag, label: "Vendas" },
            { id: "SITE_CONFIG", icon: Palette, label: "Marketing & Site" },
            { id: "SECURITY", icon: Shield, label: "Segurança" },
            { id: "LOGS", icon: Terminal, label: "Logs" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                view === item.id
                  ? "bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                className={
                  view === item.id
                    ? ""
                    : "group-hover:text-yellow-500 transition-colors"
                }
              />{" "}
              {item.label}
              {item.id === "LOGS" && logs.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {logs.length > 99 ? "99+" : logs.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">
            &copy; 2025 Celeiro da Cachaça
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
          {/* VIEW: PRODUTOS */}
          {view === "PRODUCTS" && (
            <div className="animate-enter">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Estoque</h2>
                  <p className="text-slate-500 mt-1">
                    Gerencie o catálogo de produtos.
                  </p>
                </div>
                <button
                  onClick={handleCreateProd}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-all"
                >
                  <PlusCircle size={20} /> Novo Produto
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nome, tipo..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">Estoque</th>
                        <th className="px-6 py-4">Preço</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50 transition-colors group"
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                                  <img
                                    src={p.image_url}
                                    className="w-full h-full object-contain"
                                    alt=""
                                  />
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700 block">
                                    {p.name}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {p.packaging}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-1 bg-slate-100 w-fit px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                <button
                                  onClick={() =>
                                    updateStock(p.id, p.stock_quantity, -1)
                                  }
                                  className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-red-500 transition-colors active:scale-95"
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="number"
                                  className={`w-12 text-center bg-transparent outline-none font-mono font-bold text-sm ${
                                    p.stock_quantity === 0
                                      ? "text-red-500"
                                      : "text-slate-700"
                                  }`}
                                  value={p.stock_quantity}
                                  onChange={(e) =>
                                    handleManualStock(p.id, e.target.value)
                                  }
                                  onBlur={(e) =>
                                    persistStock(
                                      p.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    preventNonNumeric(e);
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    updateStock(p.id, p.stock_quantity, 1)
                                  }
                                  className="p-1 hover:bg-white rounded-md text-slate-400 hover:text-green-600 transition-colors active:scale-95"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-3 font-bold text-green-600">
                              {formatMoney(p.price)}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditProd(p)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteModal({
                                      open: true,
                                      type: "PROD",
                                      id: p.id,
                                    })
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
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
            </div>
          )}

          {/* --- VIEW: SITE CONFIG (CMS) --- */}
          {view === "SITE_CONFIG" && (
            <div className="animate-enter max-w-6xl mx-auto pb-20">
              <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Palette className="text-purple-600" /> Personalizar Site
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Gerencie campanhas sazonais e banners de benefícios em tempo
                    real.
                  </p>
                </div>
                <button
                  onClick={handleSaveSiteConfig}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                >
                  <Save size={20} /> Publicar no Site
                </button>
              </div>

              {/* --- CARROSSEL PRINCIPAL (NOVO) --- */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">
                      Carrossel Principal
                    </h3>
                    <p className="text-xs text-slate-500">
                      Imagens grandes no topo do site.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Lado Esquerdo: Lista de Slides */}
                  <div className="space-y-6">
                    {siteConfig.hero_slides.map((slide, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group animate-enter"
                      >
                        <div className="grid gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              Imagem URL (1920x1080px)
                            </label>
                            <div className="flex gap-2">
                              <input
                                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                value={slide.image}
                                onChange={(e) => {
                                  const newSlides = [...siteConfig.hero_slides];
                                  newSlides[index].image = e.target.value;
                                  setSiteConfig({
                                    ...siteConfig,
                                    hero_slides: newSlides,
                                  });
                                }}
                              />
                              <div className="w-10 h-10 bg-white rounded border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                                {slide.image ? (
                                  <img
                                    src={slide.image}
                                    className="w-full h-full object-cover"
                                    onError={(e) =>
                                      (e.currentTarget.style.display = "none")
                                    }
                                  />
                                ) : (
                                  <ImageIcon
                                    size={16}
                                    className="text-gray-300"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              placeholder="Título Principal"
                              className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                              value={slide.title}
                              onChange={(e) => {
                                const newSlides = [...siteConfig.hero_slides];
                                newSlides[index].title = e.target.value;
                                setSiteConfig({
                                  ...siteConfig,
                                  hero_slides: newSlides,
                                });
                              }}
                            />
                            <input
                              placeholder="Subtítulo"
                              className="p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                              value={slide.subtitle}
                              onChange={(e) => {
                                const newSlides = [...siteConfig.hero_slides];
                                newSlides[index].subtitle = e.target.value;
                                setSiteConfig({
                                  ...siteConfig,
                                  hero_slides: newSlides,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newSlides = siteConfig.hero_slides.filter(
                              (_, i) => i !== index
                            );
                            setSiteConfig({
                              ...siteConfig,
                              hero_slides: newSlides,
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
                          title="Remover Slide"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() =>
                        setSiteConfig({
                          ...siteConfig,
                          hero_slides: [
                            ...siteConfig.hero_slides,
                            {
                              image: "",
                              title: "Novo Destaque",
                              subtitle: "Descrição curta",
                            },
                          ],
                        })
                      }
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 hover:bg-blue-50"
                    >
                      <PlusCircle size={18} /> Adicionar Slide
                    </button>
                  </div>

                  {/* Lado Direito: Preview */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Eye size={14} /> Pré-visualização
                    </p>
                    <CarouselPreview slides={siteConfig.hero_slides} />
                    <div className="mt-4 bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed border border-blue-100 flex gap-2">
                      <Monitor size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Dica de Design:</strong> A primeira imagem é a
                        mais importante. Use imagens de alta qualidade (Full HD
                        1920x1080px ou similar) para garantir que o site fique
                        bonito em telas grandes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* BANNER DE BENEFÍCIOS - EDITÁVEL */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                      <LayoutDashboard size={24} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800">
                      Banner de Benefícios
                    </h3>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Etiqueta (Ex: Oferta Exclusiva)
                      </label>
                      <input
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none transition-all"
                        value={siteConfig.banner_tag}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            banner_tag: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Título Principal
                      </label>
                      <input
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-serif text-lg focus:border-yellow-500 outline-none transition-all"
                        value={siteConfig.banner_title}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            banner_title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          Cor de Fundo
                        </label>
                        <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-xl bg-gray-50">
                          <input
                            type="color"
                            className="w-8 h-8 rounded cursor-pointer border-none"
                            value={siteConfig.banner_bg_color || "#1A1A1A"}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                banner_bg_color: e.target.value,
                              })
                            }
                          />
                          <span className="text-sm text-gray-600 font-mono">
                            {siteConfig.banner_bg_color}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                          Ícone Flutuante (URL)
                        </label>
                        <input
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none text-xs"
                          placeholder="https://..."
                          value={siteConfig.banner_image}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              banner_image: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Imagem de Fundo Completa (Opcional)
                      </label>
                      <input
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-yellow-500 outline-none text-sm"
                        placeholder="https://exemplo.com/banner.jpg"
                        value={siteConfig.banner_bg_image}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            banner_bg_image: e.target.value,
                          })
                        }
                      />
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Monitor size={10} /> Recomendado: 1920x400px. Substitui
                        a cor de fundo.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Eye size={14} /> Pré-visualização em Tempo Real
                    </p>
                    <BannerPreview config={siteConfig} />
                  </div>
                </div>

                {/* DESTAQUE SAZONAL */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                      <Package size={24} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800">
                      Destaque Sazonal
                    </h3>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Etiqueta (Ex: Páscoa, Natal)
                      </label>
                      <input
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 outline-none transition-all"
                        value={siteConfig.section_tag}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            section_tag: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Título da Seção
                      </label>
                      <input
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-serif text-lg focus:border-green-500 outline-none transition-all"
                        value={siteConfig.section_title}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            section_title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        URL do Ícone/Tema (Opcional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                          placeholder="https://..."
                          value={siteConfig.section_image}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              section_image: e.target.value,
                            })
                          }
                        />
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden">
                          {siteConfig.section_image ? (
                            <img
                              src={siteConfig.section_image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Eye size={14} /> Pré-visualização
                    </p>
                    <SectionPreview config={siteConfig} products={products} />
                  </div>
                </div>
              </div>

              {/* SELEÇÃO DE PRODUTOS */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-slate-800">
                    Selecionar Produtos para o Destaque Sazonal
                  </h3>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {siteConfig.highlight_ids.length} selecionados
                  </span>
                </div>
                <div className="h-96 overflow-y-auto border border-gray-200 rounded-2xl custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-4">Status</th>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4 text-right">Preço</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => {
                        // Compara ambos como string para evitar erro de tipo
                        const isSelected = siteConfig.highlight_ids
                          ?.map(String)
                          .includes(String(p.id));
                        return (
                          <tr
                            key={p.id}
                            onClick={() => toggleHighlight(p.id)}
                            className={`hover:bg-blue-50/30 cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <td className="p-4">
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-blue-500 border-blue-500 text-white scale-110"
                                    : "border-gray-300 text-transparent hover:border-blue-400"
                                }`}
                              >
                                <CheckSquare size={16} strokeWidth={3} />
                              </div>
                            </td>
                            <td className="p-4 flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 p-1">
                                <img
                                  src={p.image_url}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span
                                className={`font-medium ${
                                  isSelected
                                    ? "text-blue-700"
                                    : "text-slate-700"
                                }`}
                              >
                                {p.name}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                                {p.type}
                              </span>
                            </td>
                            <td className="p-4 text-right text-slate-600 font-mono">
                              {formatMoney(p.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OUTRAS VIEWS (Vendas, Logs, Segurança, Form) */}
          {view === "SALES" && (
            <div className="animate-enter pb-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Vendas</h2>
                  <p className="text-slate-500 mt-1">
                    Acompanhamento de pedidos em tempo real.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{" "}
                  ATUALIZANDO AO VIVO
                </div>
              </div>
              <div className="grid gap-6">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all duration-300"
                  >
                    <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-lg shadow-sm">
                          #{o.id}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(o.created_at)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getStatusStyle(
                          o.status
                        )}`}
                      >
                        {translateStatus(o.status)}
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <User size={14} /> Cliente
                          </h4>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="font-bold text-slate-800 text-lg">
                              {o.full_name}
                            </p>
                            <div className="space-y-1">
                              <p className="text-slate-500 text-sm flex items-center gap-2">
                                <Mail size={14} /> {o.email}
                              </p>
                              <p className="text-slate-500 text-sm flex items-center gap-2">
                                <Phone size={14} /> {o.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2 flex flex-col h-full">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <Package size={14} /> Itens
                        </h4>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 mb-4 shadow-sm">
                          {Array.isArray(o.items) && o.items.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                <tbody className="divide-y divide-slate-100">
                                  {o.items.map((item, idx) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-50/50"
                                    >
                                      <td className="p-3 pl-4">
                                        <span className="font-medium text-slate-700">
                                          {item.name}
                                        </span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">
                                          x{item.quantity}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right pr-4 font-medium text-slate-600">
                                        {formatMoney(
                                          Number(item.unit_price) *
                                            Number(item.quantity)
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-400">
                              Detalhes indisponíveis.
                            </div>
                          )}
                        </div>
                        <div className="mt-auto bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                          <span className="text-green-800 text-sm font-bold uppercase tracking-wide">
                            Total
                          </span>
                          <div className="flex items-center gap-1 text-2xl font-extrabold text-green-600">
                            <DollarSign size={20} className="mt-1" />
                            {formatMoney(o.total_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && orders.length === 0 && (
                  <div className="text-center py-24 text-slate-400">
                    Nenhuma venda registrada.
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "LOGS" && (
            <div className="animate-enter max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Logs do Servidor
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Monitoramento em tempo real.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogs([])}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Limpar
                  </button>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm animate-pulse">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>{" "}
                    CONECTADO
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden font-mono text-sm">
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-slate-500 text-xs">console output</span>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-slate-600 text-center py-12 italic">
                      Aguardando eventos...
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="flex gap-3 text-slate-300 hover:bg-slate-800/50 p-2 rounded transition-colors border-l-2 border-transparent hover:border-yellow-500"
                      >
                        <span className="text-slate-500 shrink-0">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span
                          className={`font-bold shrink-0 ${
                            log.type === "ACCESS_DENIED" || log.type === "BLOCK"
                              ? "text-red-500"
                              : "text-blue-400"
                          }`}
                        >
                          {log.type}
                        </span>
                        <span className="text-slate-400 shrink-0">
                          {log.ip}
                        </span>
                        <span className="text-white break-all">
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "SECURITY" && (
            <div className="max-w-4xl mx-auto animate-enter">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Segurança
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <PlusCircle size={20} className="text-green-600" /> Liberar
                  Novo Acesso
                </h3>
                <form
                  onSubmit={handleSaveIp}
                  className="flex flex-col md:flex-row gap-4 items-end"
                >
                  <div className="w-full md:flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      IP
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none"
                      value={ipForm.ip}
                      onChange={(e) =>
                        setIpForm({ ...ipForm, ip: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-full md:flex-[2]">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Descrição
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none"
                      value={ipForm.desc}
                      onChange={(e) =>
                        setIpForm({ ...ipForm, desc: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold"
                  >
                    Salvar
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">IP</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ips.map((ip) => (
                      <tr key={ip.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-slate-600">
                          {ip.ip_address}
                        </td>
                        <td className="px-6 py-4">{ip.description}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                type: "IP",
                                id: ip.id,
                              })
                            }
                            className="text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === "SHIPPING_BOXES" && (
            <div className="animate-enter max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Gerenciar Embalagens
              </h2>

              {/* Formulário de Cadastro */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <PlusCircle size={20} className="text-green-600" /> Nova Caixa
                </h3>
                <form
                  onSubmit={handleSaveBox}
                  className="flex flex-wrap gap-4 items-end"
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Nome (Ex: Caixa P)
                    </label>
                    <input
                      required
                      className="w-full px-4 py-2 rounded-xl border outline-none"
                      value={boxForm.name}
                      onChange={(e) =>
                        setBoxForm({ ...boxForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Alt (cm)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      value={boxForm.height}
                      onChange={(e) =>
                        setBoxForm({ ...boxForm, height: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Larg (cm)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      value={boxForm.width}
                      onChange={(e) =>
                        setBoxForm({ ...boxForm, width: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Comp (cm)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      value={boxForm.length}
                      onChange={(e) =>
                        setBoxForm({ ...boxForm, length: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Peso Vazia (kg)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.001"
                      placeholder="0.200"
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      value={boxForm.weight}
                      onChange={(e) =>
                        setBoxForm({ ...boxForm, weight: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    Salvar
                  </button>
                </form>
              </div>

              {/* Lista */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">Dimensões (AxLxC)</th>
                      <th className="px-6 py-4">Peso</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boxes.map((box) => (
                      <tr key={box.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {box.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {box.height} x {box.width} x {box.length} cm
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {box.weight} kg
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteBox(box.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {boxes.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    Nenhuma caixa cadastrada.
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "PROD_FORM" && (
            <div className="max-w-2xl mx-auto animate-enter pb-10">
              <button
                onClick={() => setView("PRODUCTS")}
                className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium"
              >
                <X size={20} /> Cancelar e voltar
              </button>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="font-bold text-xl">
                      {editingId ? "Editar Produto" : "Cadastrar Produto"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Preencha as informações abaixo.
                    </p>
                  </div>
                  <img
                    src="https://i.imgur.com/Q3oTWj1.png"
                    className="h-12 opacity-20 absolute right-4 rotate-12"
                    alt="logo"
                  />
                </div>
                <form onSubmit={handleSaveProd} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Nome do Produto
                      </label>
                      <input
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 outline-none transition-all"
                        value={prodForm.name}
                        onChange={(e) =>
                          setProdForm({ ...prodForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Embalagem
                      </label>
                      <select
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none bg-white"
                        value={prodForm.packaging}
                        onChange={(e) => {
                          const pkg = e.target.value;
                          setProdForm({
                            ...prodForm,
                            packaging: pkg,
                            volume: pkg === "Garrafa PET" ? "1L" : "700ml",
                          });
                        }}
                      >
                        <option>Garrafa PET</option>
                        <option>Garrafa de Vidro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Tipo
                      </label>
                      <select
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none bg-white"
                        value={prodForm.type}
                        onChange={(e) =>
                          setProdForm({ ...prodForm, type: e.target.value })
                        }
                      >
                        <option>Curtida</option>
                        <option>Doce</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Preço (R$)
                        </label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          onKeyDown={preventNonNumeric}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-yellow-500"
                          value={prodForm.price}
                          onChange={(e) =>
                            setProdForm({ ...prodForm, price: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Volume
                        </label>
                        <input
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none"
                          value={prodForm.volume}
                          onChange={(e) =>
                            setProdForm({ ...prodForm, volume: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Teor (%)
                        </label>
                        <input
                          type="number"
                          onKeyDown={preventNonNumeric}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-yellow-500"
                          value={prodForm.abv}
                          onChange={(e) =>
                            setProdForm({ ...prodForm, abv: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Estoque
                        </label>
                        <input
                          type="number"
                          onKeyDown={preventNonNumeric}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-yellow-500 bg-slate-50"
                          value={prodForm.stock_quantity}
                          onChange={(e) =>
                            setProdForm({
                              ...prodForm,
                              stock_quantity: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <PackageOpen size={16} /> Dimensões para Frete (Unidade
                        + Plástico Bolha)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase">
                            Altura (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                            placeholder="Ex: 25"
                            value={(prodForm as any).height || ""}
                            onChange={(e) =>
                              setProdForm({
                                ...prodForm,
                                height: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase">
                            Largura (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                            placeholder="Ex: 10"
                            value={(prodForm as any).width || ""}
                            onChange={(e) =>
                              setProdForm({
                                ...prodForm,
                                width: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase">
                            Comprimento (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                            placeholder="Ex: 10"
                            value={(prodForm as any).length || ""}
                            onChange={(e) =>
                              setProdForm({
                                ...prodForm,
                                length: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase">
                            Peso (kg)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                            placeholder="Ex: 0.500"
                            value={(prodForm as any).weight || ""}
                            onChange={(e) =>
                              setProdForm({
                                ...prodForm,
                                weight: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        URL da Imagem
                      </label>
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <input
                          className="flex-1 w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-yellow-500"
                          value={prodForm.imageUrl}
                          onChange={(e) =>
                            setProdForm({
                              ...prodForm,
                              imageUrl: e.target.value,
                            })
                          }
                        />
                        {prodForm.imageUrl && (
                          <div className="w-40 h-40 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm overflow-hidden">
                            <img
                              src={prodForm.imageUrl}
                              className="w-full h-full object-contain"
                              alt="Preview"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none resize-none focus:border-yellow-500"
                        value={prodForm.description}
                        onChange={(e) =>
                          setProdForm({
                            ...prodForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Salvar e Fechar
                  </button>
                </form>
              </div>
            </div>
          )}

          {deleteModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-slate-200">
                <AlertTriangle
                  className="text-red-600 mx-auto mb-4"
                  size={32}
                />
                <h3 className="text-xl font-bold mb-2 text-slate-800">
                  Tem certeza?
                </h3>
                <p className="text-slate-500 text-sm mb-8">
                  Esta ação não poderá ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ open: false, type: null, id: null })
                    }
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`.animate-enter { animation: enter 0.4s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes enter { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }`}</style>
    </div>
  );
}
