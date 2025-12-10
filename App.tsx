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
  LogOut,
  Lock,
  Loader2,
  Github,
  Package,
  Clock,
  Hash,
  DollarSign
} from 'lucide-react';

// URL da API
const API_URL = 'https://romulo.rockinhost.com.br';

// --- INTERFACES ---
interface Product {
  id: string; name: string; description: string; price: number;
  image_url: string; packaging: string; type: string; abv: number; volume: string;
}

// Interface detalhada para os itens do pedido
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

export default function App() {
  // --- ESTADOS DE CONTROLE DE ACESSO ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- ESTADOS DE NAVEGAÇÃO E DADOS ---
  const [view, setView] = useState<'PRODUCTS' | 'PROD_FORM' | 'SALES' | 'SECURITY'>('PRODUCTS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ips, setIps] = useState<AllowedIp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DE FORMULÁRIOS ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '', description: '', price: '', packaging: 'Garrafa PET',
    type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L'
  });
  const [ipForm, setIpForm] = useState({ ip: '', desc: '' });

  const [deleteModal, setDeleteModal] = useState<{open: boolean, type: 'PROD'|'IP'|null, id: string|number|null}>({
    open: false, type: null, id: null
  });

  // --- VERIFICAÇÃO INICIAL ---
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await fetch(`${API_URL}/allowed-ips`);
        if (res.status === 403) {
          setIsAuthorized(false);
        } else if (res.ok) {
          setIsAuthorized(true);
          loadProducts(); // Carrega produtos iniciais
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifyAccess();
  }, []);

  // --- POLLING (ATUALIZAÇÃO EM TEMPO REAL) ---
  useEffect(() => {
    let interval: any;
    // Só ativa o polling se estiver na tela de vendas e autorizado
    if (isAuthorized && view === 'SALES') {
        loadOrders(); // Carrega imediatamente ao entrar
        interval = setInterval(loadOrders, 5000); // Atualiza a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [view, isAuthorized]);

  // --- CARREGAMENTO DE DADOS ---
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/orders`);
      
      if (res.status === 403) { 
        setIsAuthorized(false); 
        return; 
      }
      
      const data = await res.json();
      
      // --- CORREÇÃO DA TELA BRANCA ---
      // Converte os itens (que podem vir como string JSON do MySQL) para array real
      const treatedData = Array.isArray(data) ? data.map((o: any) => {
          const orderDate = new Date(o.created_at).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - orderDate) / (1000 * 3600);
          
          let statusFinal = o.status;
          // Se pendente há mais de 24h, mostramos como Cancelado
          if (o.status === 'pending' && hoursDiff > 24) {
              statusFinal = 'cancelled';
          }

          // Parse seguro dos itens
          let parsedItems = [];
          try {
            // Se for string, converte. Se já for array, usa direto.
            parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
          } catch (err) {
            parsedItems = [];
          }

          // Garante que é um array, mesmo se vier null
          if (!Array.isArray(parsedItems)) parsedItems = [];

          return { ...o, status: statusFinal, items: parsedItems };
      }) : [];

      setOrders(treatedData);
    } catch (e) { console.error("Erro ao carregar vendas:", e); }
  };

  const loadIps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/allowed-ips`);
      if (res.status === 403) { setIsAuthorized(false); return; }
      const data = await res.json();
      setIps(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Carregamento inicial ao trocar de abas (exceto Vendas que tem polling)
  useEffect(() => {
    if (!isAuthorized) return;
    if (view === 'PRODUCTS') loadProducts();
    if (view === 'SECURITY') loadIps();
  }, [view, isAuthorized]);

  // --- HANDLERS (AÇÕES) ---

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...prodForm, price: parseFloat(prodForm.price), abv: parseFloat(prodForm.abv) };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;

    try {
      const res = await fetch(url, { 
        method, 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(payload) 
      });
      if (res.status === 403) { setIsAuthorized(false); return; }
      if (res.ok) { setView('PRODUCTS'); loadProducts(); }
      else { alert('Erro ao salvar.'); }
    } catch (e) { alert('Erro de conexão.'); }
  };

  const handleEditProd = (p: Product) => {
    setEditingId(p.id);
    setProdForm({
      name: p.name, description: p.description, price: String(p.price),
      packaging: p.packaging, type: p.type, imageUrl: p.image_url,
      abv: String(p.abv), volume: p.volume
    });
    setView('PROD_FORM');
    setIsSidebarOpen(false);
  };

  const handleCreateProd = () => {
    setEditingId(null);
    setProdForm({
        name: '', description: '', price: '', packaging: 'Garrafa PET',
        type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L'
    });
    setView('PROD_FORM');
  }

  const handleSaveIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/allowed-ips`, {
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
        ? `${API_URL}/products/${deleteModal.id}`
        : `${API_URL}/allowed-ips/${deleteModal.id}`;

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

  // 1. Verificando
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Verificando segurança...</p>
      </div>
    );
  }

  // 2. Bloqueado
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h1>
          <p className="text-slate-500 mb-8">IP não autorizado. Contate o administrador.</p>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">&copy; 2025 Celeiro da Cachaça</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. App Principal
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
          <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-800 px-3 py-1 rounded-full">v3.0 Online</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <button onClick={() => navClick('PRODUCTS')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${view === 'PRODUCTS' || view === 'PROD_FORM' ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} className={view === 'PRODUCTS' ? '' : 'group-hover:text-yellow-500 transition-colors'} /> Produtos
          </button>
          <button onClick={() => navClick('SALES')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${view === 'SALES' ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ShoppingBag size={20} className={view === 'SALES' ? '' : 'group-hover:text-yellow-500 transition-colors'}/> Vendas
          </button>
          <button onClick={() => navClick('SECURITY')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${view === 'SECURITY' ? 'bg-yellow-500 text-slate-900 font-bold shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Shield size={20} className={view === 'SECURITY' ? '' : 'group-hover:text-yellow-500 transition-colors'}/> Segurança
          </button>
        </nav>

        {/* RODAPÉ COM CRÉDITOS */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/30 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">
              &copy; 2025 Celeiro da Cachaça
            </p>
            <p className="text-xs text-slate-400 flex flex-col items-center gap-1">
              <span>Desenvolvido por</span>
              <a 
                href="https://github.com/devsilvver" 
                target="_blank" 
                rel="noreferrer"
                className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full hover:bg-slate-800"
              >
                <Github size={14} /> Guilherme Silvestrini
              </a>
            </p>
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
                    <tr><th className="px-6 py-4">Produto</th><th className="px-6 py-4">Detalhes</th><th className="px-6 py-4">Preço</th><th className="px-6 py-4 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.filter(p=>p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                                    <img src={p.image_url} className="w-full h-full object-contain" alt="" />
                                </div>
                                <span className="font-semibold text-slate-700">{p.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-slate-600">{p.type}</span>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded w-fit">{p.packaging}</span>
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

        {/* VIEW: VENDAS (APRIMORADA E CORRIGIDA) */}
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
                  {/* Cabeçalho do Pedido */}
                  <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-lg shadow-sm">
                        #{o.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          <Clock size={12}/> Data do Pedido
                        </div>
                        <p className="text-sm font-medium text-slate-700">{formatDate(o.created_at)}</p>
                      </div>
                      <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
                      <div className="hidden md:block">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          <Hash size={12}/> Ref. Pagamento
                        </div>
                        <p className="text-sm font-mono text-slate-600">{o.mp_payment_id || '---'}</p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getStatusStyle(o.status)}`}>
                      {translateStatus(o.status)}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna 1: Dados do Cliente */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <User size={14}/> Dados do Cliente
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <p className="font-bold text-slate-800 text-lg">{o.full_name}</p>
                          <div className="space-y-1">
                            <p className="text-slate-500 text-sm flex items-center gap-2 hover:text-yellow-600 transition-colors">
                              <Mail size={14}/> {o.email}
                            </p>
                            <p className="text-slate-500 text-sm flex items-center gap-2 hover:text-yellow-600 transition-colors">
                              <Phone size={14}/> {o.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <MapPin size={14}/> Endereço de Entrega
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          {o.shipping_address}
                        </p>
                      </div>
                    </div>

                    {/* Coluna 2: Itens do Pedido (Ocupa 2 colunas no desktop) */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Package size={14}/> Itens do Pedido
                      </h4>
                      
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 mb-4 shadow-sm">
                        {Array.isArray(o.items) && o.items.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                                <tr>
                                  <th className="p-3 pl-4">Produto</th>
                                  <th className="p-3 text-center">Qtd</th>
                                  <th className="p-3 text-right pr-4">Total Item</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {o.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-3 pl-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-0.5 shrink-0">
                                          <img src={item.image} className="w-full h-full object-contain" alt=""/>
                                        </div>
                                        <span className="font-medium text-slate-700 line-clamp-1">{item.name}</span>
                                      </div>
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
                        ) : (
                          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                            <Package size={32} className="mb-2 opacity-20"/>
                            <p className="text-sm">Detalhes dos itens indisponíveis.</p>
                          </div>
                        )}
                      </div>

                      {/* Resumo Financeiro */}
                      <div className="mt-auto bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                        <span className="text-green-800 text-sm font-bold uppercase tracking-wide">Valor Total</span>
                        <div className="flex items-center gap-1 text-2xl font-extrabold text-green-600">
                          <DollarSign size={20} className="mt-1"/>
                          {formatMoney(o.total_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && orders.length === 0 && (
                <div className="text-center py-24 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingBag size={40} className="text-slate-300"/>
                    </div>
                    <h3 className="text-slate-900 font-bold text-xl mb-2">Nenhuma venda registrada</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">As vendas aparecerão aqui automaticamente assim que seus clientes finalizarem os pedidos no site.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: SEGURANÇA (IPS) */}
        {view === 'SECURITY' && (
          <div className="max-w-4xl mx-auto animate-enter">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Controle de Acesso</h2>
            <p className="text-slate-500 mb-8">Gerencie quais dispositivos podem acessar este painel administrativo.</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-green-600"/> Liberar Novo Acesso</h3>
              <form onSubmit={handleSaveIp} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço IP</label>
                    <input placeholder="Ex: 177.123.45.67" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" value={ipForm.ip} onChange={e => setIpForm({...ipForm, ip: e.target.value})} />
                </div>
                <div className="w-full md:flex-[2]">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                    <input placeholder="Ex: Computador da Loja" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" value={ipForm.desc} onChange={e => setIpForm({...ipForm, desc: e.target.value})} />
                </div>
                <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all">Salvar</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr><th className="px-6 py-4">IP</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4">Data</th><th className="px-6 py-4 text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ips.map(ip => (
                      <tr key={ip.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-600 bg-slate-50/50 w-fit rounded-r-lg">{ip.ip_address}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{ip.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(ip.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setDeleteModal({open:true, type:'IP', id: ip.id})} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                        <input required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all" 
                            value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Embalagem</label>
                        <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none bg-white" value={prodForm.packaging} onChange={e=>{
                            const pkg = e.target.value;
                            setProdForm({...prodForm, packaging: pkg, volume: pkg==='Garrafa PET'?'1L':'700ml'});
                        }}>
                            <option>Garrafa PET</option><option>Garrafa de Vidro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                        <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none bg-white" value={prodForm.type} onChange={e=>setProdForm({...prodForm, type: e.target.value})}>
                            <option>Curtida</option><option>Doce</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Preço (R$)</label>
                        <input required type="number" step="0.01" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Teor Alcoólico (%)</label>
                        <input className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" value={prodForm.abv} onChange={e=>setProdForm({...prodForm, abv: e.target.value})}/>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">URL da Imagem</label>
                        <div className="flex gap-4">
                            <input className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" value={prodForm.imageUrl} onChange={e=>setProdForm({...prodForm, imageUrl: e.target.value})}/>
                            {prodForm.imageUrl && <img src={prodForm.imageUrl} className="w-12 h-12 object-contain bg-slate-50 border rounded-lg" alt="preview"/>}
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                        <textarea rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none resize-none" value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}/>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Save size={20}/> Salvar Produto
                 </button>
               </form>
             </div>
          </div>
        )}

        {/* MODAL EXCLUSÃO */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-slate-200 transform scale-100">
              <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Tem certeza?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta ação não poderá ser desfeita. O item será removido permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({open:false,type:null,id:null})} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Confirmar</button>
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