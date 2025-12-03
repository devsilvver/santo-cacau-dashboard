import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Trash2, 
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
  Menu
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
      
      // Verifica bloqueio de IP (403)
      if (res.status === 403) {
        const errorData = await res.json();
        alert(`ACESSO NEGADO:\n${errorData.error || 'IP Bloqueado'}\n\nAdicione seu IP no banco de dados.`);
        setOrders([]); // Limpa a lista
        return; 
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) { 
      console.error(e);
      // Evita alerta desnecessário se for apenas problema de rede momentâneo
      if (e.message !== "Failed to fetch") {
        alert('Erro ao carregar vendas. Verifique a conexão.');
      }
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
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const navClick = (v: any) => { setView(v); setIsSidebarOpen(false); };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-2"><span className="font-bold text-yellow-500">Celeiro Admin</span></div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 hidden md:flex flex-col items-center border-b border-slate-800">
          <h1 className="text-xl font-bold text-yellow-500">Celeiro Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-6 overflow-y-auto">
          <button onClick={() => navClick('PRODUCTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'PRODUCTS' || view === 'PROD_FORM' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Produtos
          </button>
          <button onClick={() => navClick('SALES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'SALES' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <ShoppingBag size={20} /> Vendas
          </button>
          <button onClick={() => navClick('SECURITY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'SECURITY' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Shield size={20} /> Segurança
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 relative w-full">
        
        {view === 'PRODUCTS' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Estoque</h2>
              <button onClick={() => { setEditingId(null); setView('PROD_FORM'); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2"><PlusCircle size={20} /> Novo</button>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-x-auto">
              <div className="p-4 bg-slate-50 border-b">
                 <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Buscar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></div>
              </div>
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold"><tr><th className="px-6 py-3">Produto</th><th className="px-6 py-3">Preço</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p=>p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-3 flex items-center gap-3"><img src={p.image_url} className="w-8 h-8 rounded border bg-white object-contain" alt="" />{p.name}</td>
                      <td className="px-6 py-3 font-bold text-green-600">{formatMoney(p.price)}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleEditProd(p)} className="text-blue-600 mr-2"><Edit size={18}/></button>
                        <button onClick={() => setDeleteModal({open:true, type:'PROD', id: p.id})} className="text-red-600"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'SALES' && (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Vendas</h2>
            <div className="space-y-4">
              {loading ? <p>Carregando...</p> : orders.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">Pedido #{o.id} - {o.full_name}</h3>
                    <p className="text-sm text-slate-500">{o.email} | {o.phone}</p>
                    <p className="text-sm mt-2 font-medium bg-slate-50 p-2 rounded">📍 {o.shipping_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatMoney(o.total_amount)}</p>
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${getStatusColor(o.status)}`}>{o.status === 'paid' ? 'Pago' : o.status}</span>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(o.created_at)}</p>
                  </div>
                </div>
              ))}
              {!loading && orders.length === 0 && <div className="text-center p-12 bg-white rounded-xl border border-dashed">Nenhuma venda encontrada.</div>}
            </div>
          </div>
        )}

        {view === 'SECURITY' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">IPs Autorizados</h2>
            <div className="bg-white p-4 rounded-xl shadow mb-6">
              <form onSubmit={handleSaveIp} className="flex flex-col md:flex-row gap-4">
                <input placeholder="IP (ex: 177.x.x.x)" className="input border p-2 rounded flex-1" value={ipForm.ip} onChange={e => setIpForm({...ipForm, ip: e.target.value})} />
                <input placeholder="Descrição" className="input border p-2 rounded flex-1" value={ipForm.desc} onChange={e => setIpForm({...ipForm, desc: e.target.value})} />
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold">Salvar</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b"><tr><th className="p-4">IP</th><th className="p-4">Descrição</th><th className="p-4 text-right">Ação</th></tr></thead>
                <tbody>
                  {ips.map(ip => (
                    <tr key={ip.id} className="border-b">
                      <td className="p-4 font-mono">{ip.ip_address}</td>
                      <td className="p-4">{ip.description}</td>
                      <td className="p-4 text-right"><button onClick={() => setDeleteModal({open:true, type:'IP', id: ip.id})} className="text-red-600"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FORMULÁRIO PRODUTO */}
        {view === 'PROD_FORM' && (
          <div className="max-w-2xl mx-auto animate-fade-in pb-10">
             <button onClick={() => setView('PRODUCTS')} className="mb-4 text-slate-500 flex items-center gap-2"><X size={16}/> Cancelar</button>
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="bg-slate-900 p-6 text-white"><h2 className="font-bold text-xl">Produto</h2></div>
               <form onSubmit={handleSaveProd} className="p-6 space-y-4">
                 <input className="input w-full border p-2 rounded" placeholder="Nome" value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} required/>
                 <div className="grid grid-cols-2 gap-4">
                    <select className="input border p-2 rounded bg-white" value={prodForm.packaging} onChange={e=>setProdForm({...prodForm, packaging: e.target.value})}>
                        <option>Garrafa PET</option><option>Garrafa de Vidro</option>
                    </select>
                    <select className="input border p-2 rounded bg-white" value={prodForm.type} onChange={e=>setProdForm({...prodForm, type: e.target.value})}>
                        <option>Curtida</option><option>Doce</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input className="input border p-2 rounded" type="number" placeholder="Preço" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} required/>
                    <input className="input border p-2 rounded" placeholder="Teor %" value={prodForm.abv} onChange={e=>setProdForm({...prodForm, abv: e.target.value})}/>
                 </div>
                 <input className="input w-full border p-2 rounded" placeholder="URL Imagem" value={prodForm.imageUrl} onChange={e=>setProdForm({...prodForm, imageUrl: e.target.value})}/>
                 <textarea className="input w-full border p-2 rounded" rows={3} placeholder="Descrição" value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}/>
                 <button className="w-full bg-yellow-500 py-3 rounded font-bold text-white">Salvar</button>
               </form>
             </div>
          </div>
        )}

        {/* MODAL */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
              <AlertTriangle className="text-red-600 w-10 h-10 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-4">Tem certeza?</h3>
              <div className="flex gap-2">
                <button onClick={() => setDeleteModal({open:false,type:null,id:null})} className="flex-1 py-2 bg-slate-100 rounded">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}