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
  LogOut
} from 'lucide-react';

// URL da API no Render
const API_URL = 'https://api-celeiro-da-cachaca.onrender.com';

// --- INTERFACES ---
interface Product {
  id: string; name: string; description: string; price: number;
  image_url: string; packaging: string; type: string; abv: number; volume: string;
}

interface Order {
  id: number; status: string; total_amount: string; created_at: string;
  shipping_address: string; mp_payment_id: string;
  full_name: string; email: string; phone: string;
}

interface AllowedIp {
  id: number; ip_address: string; description: string; created_at: string;
}

export default function App() {
  // --- ESTADOS ---
  const [view, setView] = useState<'PRODUCTS' | 'PROD_FORM' | 'SALES' | 'SECURITY'>('PRODUCTS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ips, setIps] = useState<AllowedIp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '', description: '', price: '', packaging: 'Garrafa PET',
    type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L'
  });
  const [ipForm, setIpForm] = useState({ ip: '', desc: '' });

  const [deleteModal, setDeleteModal] = useState<{open: boolean, type: 'PROD'|'IP'|null, id: string|number|null}>({
    open: false, type: null, id: null
  });

  // --- CARREGAMENTO ---
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error("Falha ao buscar produtos");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`);
      if (res.status === 403) {
        const errorData = await res.json();
        alert(`ACESSO NEGADO:\n${errorData.error || 'IP Bloqueado'}`);
        setOrders([]); 
        return; 
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) { 
      console.error(e);
      setOrders([]);
    }
    setLoading(false);
  };

  const loadIps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      if (res.status === 403) {
        const errorData = await res.json();
        alert(`ACESSO NEGADO:\n${errorData.error || 'IP Bloqueado'}`);
        setIps([]);
        return;
      }
      const data = await res.json();
      setIps(Array.isArray(data) ? data : []);
    } catch (e: any) { 
      console.error(e);
      setIps([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'PRODUCTS') loadProducts();
    if (view === 'SALES') loadOrders();
    if (view === 'SECURITY') loadIps();
  }, [view]);

  // --- HANDLERS ---

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...prodForm, price: parseFloat(prodForm.price), abv: parseFloat(prodForm.abv) };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;

    try {
      const res = await fetch(url, { 
        method, 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(payload) 
      });
      if (res.status === 403) { alert("IP Bloqueado: Você não pode editar."); return; }
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
      const res = await fetch(`${API_URL}/api/allowed-ips`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ip_address: ipForm.ip, description: ipForm.desc })
      });
      if (res.status === 403) { alert("IP Bloqueado: Você não pode adicionar IPs."); return; }
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
      if (res.status === 403) { alert("IP Bloqueado."); return; }
      
      if (deleteModal.type === 'PROD') loadProducts();
      else loadIps();
      
      setDeleteModal({ open: false, type: null, id: null });
    } catch (e) { alert('Erro ao excluir.'); }
  };

  // --- HELPERS ---
  const formatMoney = (val: string | number) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR') + ' ' + new Date(date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    } catch { return date; }
  };
  const getStatusColor = (st: string) => {
    switch(st) {
      case 'paid': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };
  const translateStatus = (st: string) => {
    const map: any = { 'paid': 'Pago', 'pending': 'Pendente', 'cancelled': 'Cancelado' };
    return map[st] || st;
  };
  const navClick = (v: any) => { setView(v); setIsSidebarOpen(false); };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20 border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-lg">
                <img src="https://i.imgur.com/Q3oTWj1.png" className="w-8 h-8 object-contain" alt="logo"/>
            </div>
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

        <div className="p-4 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-sm font-medium">
                <LogOut size={18} /> Sair do Painel
            </button>
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
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Relatório de Vendas</h2>
            <p className="text-slate-500 mb-8">Acompanhe os pedidos realizados em tempo real.</p>
            
            <div className="grid gap-4">
              {loading ? <p className="text-center py-12 text-slate-400">Carregando dados...</p> : orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow group">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 justify-between md:justify-start">
                      <span className="text-lg font-bold text-slate-800 flex items-center gap-2"><ShoppingBag size={20} className="text-yellow-500"/> Pedido #{o.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wide ${getStatusColor(o.status)}`}>
                        {translateStatus(o.status)}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={16}/> {formatDate(o.created_at)}</span>
                        <span className="flex items-center gap-1 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">ID: {o.mp_payment_id || 'N/A'}</span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold"><User size={16} className="text-slate-400"/> {o.full_name}</div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm"><Mail size={16} className="text-slate-400"/> {o.email}</div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm"><Phone size={16} className="text-slate-400"/> {o.phone}</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-4 md:pt-0 flex flex-col justify-center">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Endereço de Entrega</p>
                        <p className="text-slate-700 text-sm leading-relaxed bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
                            {o.shipping_address}
                        </p>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                        <span className="text-slate-500 text-sm font-medium">Total do Pedido</span>
                        <span className="text-2xl font-extrabold text-green-600">{formatMoney(o.total_amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && orders.length === 0 && (
                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-slate-300"/>
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">Nenhuma venda encontrada</h3>
                    <p className="text-slate-500">As vendas aparecerão aqui assim que forem realizadas.</p>
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