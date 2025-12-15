import React, { useState, useEffect } from 'react';
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
  MapPin,
  Phone,
  Mail,
  User,
  Menu,
  Lock,
  Loader2,
  Github,
  Package,
  Clock,
  Hash,
  DollarSign,
  Terminal,
  Minus, // Novo ícone
  Plus   // Novo ícone
} from 'lucide-react';

// URL da API
const API_URL = 'https://api-celeiro-da-cachaca.onrender.com';

// --- INTERFACES ---
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
  stock_quantity: number; // Campo de estoque
}

interface OrderItem {
  name: string; quantity: number; unit_price: number; image: string;
}

interface Order {
  id: number; status: string; total_amount: string; created_at: string;
  shipping_address: string; mp_payment_id: string;
  full_name: string; email: string; phone: string;
  items: OrderItem[]; 
}

interface AllowedIp {
  id: number; ip_address: string; description: string; created_at: string;
}

interface LogMessage {
  type: string;
  ip: string;
  timestamp: string;
  message: string;
}

export default function App() {
  // --- ESTADOS DE CONTROLE DE ACESSO ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- ESTADOS DE NAVEGAÇÃO E DADOS ---
  const [view, setView] = useState<'PRODUCTS' | 'PROD_FORM' | 'SALES' | 'SECURITY' | 'LOGS'>('PRODUCTS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ips, setIps] = useState<AllowedIp[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DE FORMULÁRIOS ---
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form atualizado com estoque
  const [prodForm, setProdForm] = useState({
    name: '', description: '', price: '', packaging: 'Garrafa PET',
    type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L', stock_quantity: '0'
  });
  
  const [ipForm, setIpForm] = useState({ ip: '', desc: '' });

  const [deleteModal, setDeleteModal] = useState<{open: boolean, type: 'PROD'|'IP'|null, id: string|number|null}>({
    open: false, type: null, id: null
  });

  // --- VERIFICAÇÃO INICIAL (IP) ---
  const verifyAccess = async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      if (res.status === 403) {
        setIsAuthorized(false);
      } else if (res.ok) {
        setIsAuthorized(true);
        loadProducts(); 
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      setIsAuthorized(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    verifyAccess();
  }, []);

  // --- POLLING (VENDAS) ---
  useEffect(() => {
    let interval: any;
    if (isAuthorized) {
        // Atualiza vendas se estiver na tela de vendas
        if (view === 'SALES') loadOrders();
        
        // Atualiza produtos (estoque) se estiver na tela de produtos
        if (view === 'PRODUCTS') loadProducts();

        interval = setInterval(() => {
            if (view === 'SALES') loadOrders();
            if (view === 'PRODUCTS') loadProducts();
        }, 5000); 
    }
    return () => clearInterval(interval);
  }, [view, isAuthorized]);

    // Conecta sem token, confiando no IP
    const eventSource = new EventSource(`${API_URL}/api/logs/stream`);

    eventSource.onmessage = (event) => {
      try {
        const newLog: LogMessage = JSON.parse(event.data);
        setLogs(prevLogs => [newLog, ...prevLogs]); 
      } catch (err) {
        console.error("Erro ao processar log:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Erro na conexão SSE:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthorized]);

  // --- CARREGAMENTO DE DADOS ---
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`);
      
      if (res.status === 403) { 
        setIsAuthorized(false); 
        return; 
      }
      
      const data = await res.json();
      
      const treatedData = Array.isArray(data) ? data.map((o: any) => {
          const orderDate = new Date(o.created_at).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - orderDate) / (1000 * 3600);
          
          let statusFinal = o.status;
          if (o.status === 'pending' && hoursDiff > 24) {
              statusFinal = 'cancelled';
          }

          let parsedItems = [];
          try {
            parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
          } catch (err) {
            parsedItems = [];
          }

          if (!Array.isArray(parsedItems)) parsedItems = [];

          return { ...o, status: statusFinal, items: parsedItems };
      }) : [];

      setOrders(treatedData);
    } catch (e) { console.error("Erro ao carregar vendas:", e); }
  };

  const loadIps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      if (res.status === 403) { setIsAuthorized(false); return; }
      const data = await res.json();
      setIps(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthorized) return;
    if (view === 'PRODUCTS') loadProducts();
    if (view === 'SECURITY') loadIps();
  }, [view, isAuthorized]);

  // --- HANDLERS (AÇÕES) ---

  // Função para salvar produto (Create/Update)
  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceString = String(prodForm.price).replace(',', '.');
    const abvString = String(prodForm.abv).replace(',', '.');
    
    const priceFinal = parseFloat(priceString);
    const abvFinal = parseFloat(abvString);

    if (isNaN(priceFinal) || isNaN(abvFinal)) {
        alert("Erro: O preço e o teor alcoólico devem ser números válidos.");
        return;
    }

    const payload = { 
        ...prodForm, 
        price: priceFinal, 
        abv: abvFinal,
        stock_quantity: Number(prodForm.stock_quantity) // Envia o estoque
    };
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;

    try {
      const res = await fetch(url, { 
        method, 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(payload) 
      });

      if (res.status === 403) { setIsAuthorized(false); return; }

      if (res.ok) { 
          // 1. Recarrega a lista para pegar os dados novos
          await loadProducts(); 
          // 2. Limpa o form (opcional, já que vamos fechar)
          if (!editingId) handleCreateProd();
          // 3. FECHA A TELA AUTOMATICAMENTE
          setView('PRODUCTS');
      }
      else { 
          try {
              const errorData = await res.json();
              alert('Erro do Servidor: ' + (errorData.error || errorData.message));
          } catch (jsonError) {
              alert('Erro ao salvar produto.');
          }
      }
    } catch (e) { 
        console.error(e);
        alert('Erro de conexão.'); 
    }
  };

  // Função para Atualização Rápida de Estoque
  const updateStock = async (id: string, currentStock: number, change: number) => {
    // Calcula novo estoque (não deixa descer de 0)
    const newStock = Math.max(0, currentStock + change);
    
    // Atualização Otimista (muda na tela antes de confirmar no server)
    setProducts(products.map(p => p.id === id ? {...p, stock_quantity: newStock} : p));

    try {
        const res = await fetch(`${API_URL}/api/products/${id}/stock`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ quantity: newStock })
        });

        if (!res.ok) throw new Error();
    } catch (e) {
        alert('Erro ao atualizar estoque');
        loadProducts(); // Reverte em caso de erro
    }
  };

  const handleEditProd = (p: Product) => {
    setEditingId(p.id);
    setProdForm({
      name: p.name, description: p.description, price: String(p.price),
      packaging: p.packaging, type: p.type, imageUrl: p.image_url,
      abv: String(p.abv), volume: p.volume,
      stock_quantity: String(p.stock_quantity) // Carrega o estoque atual
    });
    setView('PROD_FORM');
    setIsSidebarOpen(false);
  };

  const handleCreateProd = () => {
    setEditingId(null);
    setProdForm({
        name: '', description: '', price: '', packaging: 'Garrafa PET',
        type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L',
        stock_quantity: '0' // Estoque inicial
    });
    setView('PROD_FORM');
  }

  const handleSaveIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ip_address: ipForm.ip, description: ipForm.desc })
      });
      if (res.status === 403) { setIsAuthorized(false); return; }
      setIpForm({ ip: '', desc: '' });
      loadIps();
    } catch (e) { alert('Erro ao salvar IP.'); }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      let url = deleteModal.type === 'PROD' 
        ? `${API_URL}/api/products/${deleteModal.id}`
        : `${API_URL}/api/allowed-ips/${deleteModal.id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (res.status === 403) { setIsAuthorized(false); return; }
      
      if (deleteModal.type === 'PROD') loadProducts();
      else loadIps();
      
      setDeleteModal({ open: false, type: null, id: null });
    } catch (e) { alert('Erro ao excluir.'); }
  };

  // --- HELPERS DE FORMATAÇÃO E ESTILO ---
  const formatMoney = (val: string | number) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR') + ' às ' + new Date(date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    } catch { return date; }
  };
  
  const getStatusStyle = (st: string) => {
    switch(st) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  
  const translateStatus = (st: string) => {
    const map: any = { 'paid': 'Pago', 'pending': 'Pendente', 'cancelled': 'Cancelado' };
    return map[st] || st;
  };
  
  const navClick = (v: any) => { setView(v); setIsSidebarOpen(false); };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Verificando segurança...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Área Restrita</h1>
          <p className="text-slate-500 mb-8">Acesso não autorizado. Contate o administrador.</p>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">&copy; 2025 Celeiro da Cachaça</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20 border-b border-slate-800">
        <div className="flex items-center gap-3">
            <span className="font-bold text-yellow-500 text-lg tracking-wide">Celeiro Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800`}>
        <div className="p-8 hidden md:flex flex-col items-center border-b border-slate-800 bg-slate-900/50">
          <div className="bg-amber-50 p-3 rounded-2xl mb-4 shadow-lg shadow-yellow-500/10 hover:scale-105 transition-transform duration-300">
            <img src="https://i.imgur.com/Q3oTWj1.png" className="w-20 h-auto object-contain" alt="logo"/>
          </div>
          <h1 className="text-xl font-bold text-yellow-500 flex items-center gap-2">Celeiro Admin</h1>
          <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-800 px-3 py-1 rounded-full">Online</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {[
            { id: 'PRODUCTS', icon: LayoutDashboard, label: 'Produtos' },
            { id: 'SALES', icon: ShoppingBag, label: 'Vendas' },
            { id: 'SECURITY', icon: Shield, label: 'Segurança' },
            { id: 'LOGS', icon: Terminal, label: 'Logs' }
          ].map(item => (
            <button key={item.id} onClick={() => navClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${view === item.id ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={20} className={view === item.id ? '' : 'group-hover:text-yellow-500 transition-colors'} /> {item.label}
              {item.id === 'LOGS' && logs.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{logs.length > 99 ? '99+' : logs.length}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">&copy; 2025 Celeiro da Cachaça</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
        
        {/* VIEW: PRODUTOS */}
        {view === 'PRODUCTS' && (
          <div className="animate-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Estoque</h2>
                <p className="text-slate-500 mt-1">Gerencie o catálogo de produtos do site.</p>
              </div>
              <button onClick={handleCreateProd} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                <PlusCircle size={20} /> Novo Produto
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" placeholder="Buscar por nome, tipo..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all" 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Estoque</th> {/* COLUNA NOVA */}
                      <th className="px-6 py-4">Preço</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.filter(p=>p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                                    <img src={p.image_url} className="w-full h-full object-contain" alt="" />
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-700 block">{p.name}</span>
                                    <span className="text-xs text-slate-400">{p.packaging}</span>
                                </div>
                            </div>
                        </td>
                        {/* CONTROLE RÁPIDO DE ESTOQUE */}
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-2 bg-slate-100 w-fit px-2 py-1.5 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => updateStock(p.id, p.stock_quantity, -1)} 
                                    className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Minus size={14}/>
                                </button>
                                <span className={`font-mono font-bold min-w-[24px] text-center text-sm ${p.stock_quantity === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                                    {p.stock_quantity}
                                </span>
                                <button 
                                    onClick={() => updateStock(p.id, p.stock_quantity, 1)} 
                                    className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-green-500 transition-colors"
                                >
                                    <Plus size={14}/>
                                </button>
                            </div>
                        </td>
                        <td className="px-6 py-3 font-bold text-green-600">{formatMoney(p.price)}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditProd(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit size={18}/></button>
                            <button onClick={() => setDeleteModal({open:true, type:'PROD', id: p.id})} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={18}/></button>
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

        {/* VIEW: VENDAS */}
        {view === 'SALES' && (
          <div className="animate-enter pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Vendas</h2>
                <p className="text-slate-500 mt-1">Acompanhamento de pedidos em tempo real.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> ATUALIZANDO AO VIVO
              </div>
            </div>
            
            <div className="grid gap-6">
              {orders.map(o => (
                <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-lg shadow-sm">
                        #{o.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{formatDate(o.created_at)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getStatusStyle(o.status)}`}>
                      {translateStatus(o.status)}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <User size={14}/> Cliente
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <p className="font-bold text-slate-800 text-lg">{o.full_name}</p>
                          <div className="space-y-1">
                            <p className="text-slate-500 text-sm flex items-center gap-2"><Mail size={14}/> {o.email}</p>
                            <p className="text-slate-500 text-sm flex items-center gap-2"><Phone size={14}/> {o.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col h-full">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Package size={14}/> Itens
                      </h4>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 mb-4 shadow-sm">
                        {Array.isArray(o.items) && o.items.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <tbody className="divide-y divide-slate-100">
                                {o.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-3 pl-4">
                                        <span className="font-medium text-slate-700">{item.name}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">x{item.quantity}</span>
                                    </td>
                                    <td className="p-3 text-right pr-4 font-medium text-slate-600">
                                      {formatMoney(Number(item.unit_price) * Number(item.quantity))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (<div className="p-8 text-center text-slate-400">Detalhes indisponíveis.</div>)}
                      </div>
                      <div className="mt-auto bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                        <span className="text-green-800 text-sm font-bold uppercase tracking-wide">Total</span>
                        <div className="flex items-center gap-1 text-2xl font-extrabold text-green-600">
                          <DollarSign size={20} className="mt-1"/>
                          {formatMoney(o.total_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && orders.length === 0 && <div className="text-center py-24 text-slate-400">Nenhuma venda registrada.</div>}
            </div>
          </div>
        )}

        {/* VIEW: LOGS DO SERVIDOR */}
        {view === 'LOGS' && (
          <div className="animate-enter max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Logs do Servidor</h2>
                <p className="text-slate-500 mt-1">Monitoramento em tempo real.</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setLogs([])} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Limpar</button>
                 <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm animate-pulse">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span> CONECTADO
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
                        <div className="text-slate-600 text-center py-12 italic">Aguardando eventos...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="flex gap-3 text-slate-300 hover:bg-slate-800/50 p-2 rounded transition-colors border-l-2 border-transparent hover:border-yellow-500">
                                <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={`font-bold shrink-0 ${log.type === 'ACCESS_DENIED' || log.type === 'BLOCK' ? 'text-red-500' : 'text-blue-400'}`}>
                                    {log.type}
                                </span>
                                <span className="text-slate-400 shrink-0">{log.ip}</span>
                                <span className="text-white break-all">{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        )}

        {/* VIEW: SEGURANÇA */}
        {view === 'SECURITY' && (
          <div className="max-w-4xl mx-auto animate-enter">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Segurança</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-green-600"/> Liberar Novo Acesso</h3>
              <form onSubmit={handleSaveIp} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">IP</label><input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none" value={ipForm.ip} onChange={e => setIpForm({...ipForm, ip: e.target.value})} /></div>
                <div className="w-full md:flex-[2]"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label><input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none" value={ipForm.desc} onChange={e => setIpForm({...ipForm, desc: e.target.value})} /></div>
                <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold">Salvar</button>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold"><tr><th className="px-6 py-4">IP</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4 text-right">Ação</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {ips.map(ip => (
                      <tr key={ip.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-slate-600">{ip.ip_address}</td>
                        <td className="px-6 py-4">{ip.description}</td>
                        <td className="px-6 py-4 text-right"><button onClick={() => setDeleteModal({open:true, type:'IP', id: ip.id})} className="text-red-500"><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* VIEW: FORMULÁRIO PRODUTO */}
        {view === 'PROD_FORM' && (
          <div className="max-w-2xl mx-auto animate-enter pb-10">
             <button onClick={() => setView('PRODUCTS')} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium"><X size={20}/> Cancelar e voltar</button>
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="font-bold text-xl">{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
                    <p className="text-slate-400 text-sm mt-1">Preencha as informações abaixo.</p>
                  </div>
                  <img src="https://i.imgur.com/Q3oTWj1.png" className="h-12 opacity-20 absolute right-4 rotate-12" alt="logo"/>
               </div>
               <form onSubmit={handleSaveProd} className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                        <input required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 outline-none" 
                            value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Embalagem</label>
                        <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none bg-white" value={prodForm.packaging} onChange={e=>{
                            const pkg = e.target.value;
                            setProdForm({...prodForm, packaging: pkg, volume: pkg==='Garrafa PET'?'1L':'700ml'});
                        }}>
                            <option>Garrafa PET</option><option>Garrafa de Vidro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                        <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none bg-white" value={prodForm.type} onChange={e=>setProdForm({...prodForm, type: e.target.value})}>
                            <option>Curtida</option><option>Doce</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Preço (R$)</label>
                        <input required type="number" step="0.01" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Teor Alcoólico (%)</label>
                        <input className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none" value={prodForm.abv} onChange={e=>setProdForm({...prodForm, abv: e.target.value})}/>
                    </div>
                    
                    {/* NOVO CAMPO DE ESTOQUE NO FORMULÁRIO */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Quantidade em Estoque</label>
                        <input type="number" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-yellow-500" value={prodForm.stock_quantity} onChange={e=>setProdForm({...prodForm, stock_quantity: e.target.value})}/>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">URL da Imagem</label>
                        <input className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none" value={prodForm.imageUrl} onChange={e=>setProdForm({...prodForm, imageUrl: e.target.value})}/>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                        <textarea rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none resize-none" value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}/>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Save size={20}/> Salvar e Fechar
                 </button>
               </form>
             </div>
          </div>
        )}

        {/* MODAL EXCLUSÃO */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-slate-200">
              <AlertTriangle className="text-red-600 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 text-slate-800">Tem certeza?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta ação não poderá ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({open:false,type:null,id:null})} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg">Confirmar</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      <style>{`
        .animate-enter { animation: enter 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes enter { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}