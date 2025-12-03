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
  Menu // Ícone do Menu Hambúrguer
} from 'lucide-react';

// URL da API
const API_URL = 'https://api-celeiro-da-cachaca.onrender.com';

// Interfaces
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
  // Estados de Navegação
  const [view, setView] = useState<'PRODUCTS' | 'PROD_FORM' | 'SALES' | 'SECURITY'>('PRODUCTS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Novo estado para Menu Mobile
  
  // Estados de Dados
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ips, setIps] = useState<AllowedIp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Formulários
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '', description: '', price: '', packaging: 'Garrafa PET',
    type: 'Curtida', imageUrl: '', abv: '38.0', volume: '1L'
  });
  const [ipForm, setIpForm] = useState({ ip: '', desc: '' });

  // Modal de Exclusão
  const [deleteModal, setDeleteModal] = useState<{open: boolean, type: 'PROD'|'IP'|null, id: string|number|null}>({
    open: false, type: null, id: null
  });

  // --- CARREGAMENTOS ---
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { alert('Erro ao carregar vendas. Verifique seu IP.'); }
    setLoading(false);
  };

  const loadIps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/allowed-ips`);
      const data = await res.json();
      setIps(Array.isArray(data) ? data : []);
    } catch (e) { alert('Erro ao carregar IPs.'); }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'PRODUCTS') loadProducts();
    if (view === 'SALES') loadOrders();
    if (view === 'SECURITY') loadIps();
  }, [view]);

  // --- AÇÕES ---
  const handleEditProd = (p: Product) => {
    setEditingId(p.id);
    setProdForm({
      name: p.name, description: p.description, price: String(p.price),
      packaging: p.packaging, type: p.type, imageUrl: p.image_url,
      abv: String(p.abv), volume: p.volume
    });
    setView('PROD_FORM');
    setIsSidebarOpen(false); // Fecha menu mobile se estiver aberto
  };

  const handleSaveProd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...prodForm, price: parseFloat(prodForm.price), abv: parseFloat(prodForm.abv) };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;

    try {
      await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
      setView('PRODUCTS');
    } catch (e) { alert('Erro ao salvar.'); }
  };

  const handleSaveIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/allowed-ips`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ip_address: ipForm.ip, description: ipForm.desc })
      });
      setIpForm({ ip: '', desc: '' });
      loadIps();
    } catch (e) { alert('Erro ao salvar IP.'); }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      if (deleteModal.type === 'PROD') {
        await fetch(`${API_URL}/api/products/${deleteModal.id}`, { method: 'DELETE' });
        loadProducts();
      } else if (deleteModal.type === 'IP') {
        await fetch(`${API_URL}/api/allowed-ips/${deleteModal.id}`, { method: 'DELETE' });
        loadIps();
      }
      setDeleteModal({ open: false, type: null, id: null });
    } catch (e) { alert('Erro ao excluir.'); }
  };

  const formatMoney = (val: string | number) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR') + ' ' + new Date(date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  const getStatusColor = (st: string) => {
    switch(st) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const translateStatus = (st: string) => {
    const map: any = { 'paid': 'Pago', 'pending': 'Pendente', 'cancelled': 'Cancelado' };
    return map[st] || st;
  };

  // Função para fechar menu ao clicar em um link (Mobile)
  const navClick = (v: any) => {
    setView(v);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER MOBILE (Só aparece em telas pequenas) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-2">
            <img src="https://i.imgur.com/Q3oTWj1.png" className="w-8" />
            <span className="font-bold text-yellow-500">Celeiro Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY (Fundo escuro quando menu mobile abre) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR (Fixo no Desktop, Deslizante no Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:flex flex-col items-center border-b border-slate-800">
          <img src="https://i.imgur.com/Q3oTWj1.png" className="w-16 mb-4" />
          <h1 className="text-xl font-bold text-yellow-500">Celeiro Admin</h1>
        </div>
        
        {/* Menu Mobile Header dentro da Sidebar */}
        <div className="md:hidden p-6 border-b border-slate-800 mb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Navegação</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-6 overflow-y-auto">
          <button onClick={() => navClick('PRODUCTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'PRODUCTS' || view === 'PROD_FORM' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Produtos
          </button>
          <button onClick={() => navClick('SALES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'SALES' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <ShoppingBag size={20} /> Vendas
          </button>
          <button onClick={() => navClick('SECURITY')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'SECURITY' ? 'bg-yellow-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Shield size={20} /> Segurança (IPs)
          </button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 relative w-full">
        
        {/* TELA: PRODUTOS */}
        {view === 'PRODUCTS' && (
          <div className="max-w-6xl mx-auto animate-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Estoque</h2>
              <button onClick={() => { setEditingId(null); setView('PROD_FORM'); }} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow font-medium active:scale-95 transition-transform">
                <PlusCircle size={20} /> Novo Produto
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Buscar produto..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              
              {/* Tabela Responsiva com Scroll Horizontal */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr><th className="px-6 py-3">Produto</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3">Preço</th><th className="px-6 py-3 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 flex items-center gap-3">
                          <img src={p.image_url} className="w-10 h-10 object-contain bg-white border rounded" />
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">{p.name}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">{p.type} - {p.packaging}</td>
                        <td className="px-6 py-3 font-bold text-green-600">{formatMoney(p.price)}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => handleEditProd(p)} className="text-blue-600 p-2 hover:bg-blue-50 rounded"><Edit size={18}/></button>
                          <button onClick={() => setDeleteModal({open:true, type:'PROD', id: p.id})} className="text-red-600 p-2 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TELA: VENDAS */}
        {view === 'SALES' && (
          <div className="max-w-7xl mx-auto animate-enter pb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Relatório de Vendas</h2>
            <div className="grid gap-4">
              {loading ? <p className="text-slate-500 text-center py-10">Carregando vendas...</p> : orders.map(order => (
                <div key={order.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                  
                  {/* Info do Pedido */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 justify-between md:justify-start">
                      <span className="text-lg font-bold text-slate-800">Pedido #{order.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 flex flex-col md:flex-row gap-1 md:gap-4">
                      <span>📅 {formatDate(order.created_at)}</span>
                      <span className="text-xs md:text-sm truncate">💳 Ref MP: {order.mp_payment_id || 'N/A'}</span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex items-center gap-2 text-slate-700 font-medium break-all"><User size={16} className="shrink-0"/> {order.full_name}</div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm break-all"><Mail size={16} className="shrink-0"/> {order.email}</div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm"><Phone size={16} className="shrink-0"/> {order.phone}</div>
                    </div>
                  </div>

                  {/* Endereço e Valor */}
                  <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                    <div className="flex items-start gap-2 text-slate-600 text-sm">
                      <MapPin size={18} className="mt-0.5 text-yellow-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-700">Endereço de Entrega:</p>
                        <p className="leading-relaxed">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 md:border-none">
                      <span className="text-slate-500 text-sm">Valor Total</span>
                      <span className="text-xl md:text-2xl font-bold text-green-600">{formatMoney(order.total_amount)}</span>
                    </div>
                  </div>

                </div>
              ))}
              {!loading && orders.length === 0 && (
                <div className="text-center p-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  Nenhuma venda registrada ainda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TELA: SEGURANÇA (IPS) */}
        {view === 'SECURITY' && (
          <div className="max-w-4xl mx-auto animate-enter">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Controle de Acesso</h2>
            <p className="text-slate-500 mb-8 text-sm md:text-base">Gerencie quais IPs podem acessar este painel administrativo.</p>
            
            {/* Formulário Add IP */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><PlusCircle size={20}/> Adicionar Novo IP</h3>
              <form onSubmit={handleSaveIp} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço IP</label>
                  <input required placeholder="Ex: 177.123.45.67" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={ipForm.ip} onChange={e => setIpForm({...ipForm, ip: e.target.value})} />
                </div>
                <div className="flex-[2]">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Quem é?)</label>
                  <input required placeholder="Ex: Computador da Loja" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={ipForm.desc} onChange={e => setIpForm({...ipForm, desc: e.target.value})} />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Salvar</button>
              </form>
            </div>

            {/* Lista de IPs - Com Scroll Horizontal */}
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr><th className="px-6 py-3">IP</th><th className="px-6 py-3">Descrição</th><th className="px-6 py-3">Adicionado em</th><th className="px-6 py-3 text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ips.map(ip => (
                      <tr key={ip.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono text-slate-700">{ip.ip_address}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{ip.description}</td>
                        <td className="px-6 py-3 text-sm text-slate-500">{formatDate(ip.created_at)}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => setDeleteModal({open:true, type:'IP', id: ip.id})} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TELA: FORMULÁRIO PRODUTO */}
        {view === 'PROD_FORM' && (
          <div className="max-w-2xl mx-auto pb-10">
             <button onClick={() => setView('PRODUCTS')} className="mb-4 text-slate-500 flex items-center gap-2 hover:text-slate-800"><X size={16}/> Cancelar</button>
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <h2 className="font-bold text-xl">Gerenciar Produto</h2>
                  <img src="https://i.imgur.com/Q3oTWj1.png" className="h-8 md:h-10 opacity-50" />
               </div>
               <form onSubmit={handleSaveProd} className="p-6 md:p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="label">Nome do Produto</label>
                        <input required className="input" value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})}/>
                    </div>
                    
                    <div>
                        <label className="label">Embalagem</label>
                        <select className="input bg-white" value={prodForm.packaging} onChange={e=>{
                            const pkg = e.target.value;
                            setProdForm({...prodForm, packaging: pkg, volume: pkg==='Garrafa PET'?'1L':'700ml'});
                        }}>
                            <option>Garrafa PET</option><option>Garrafa de Vidro</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Tipo</label>
                        <select className="input bg-white" value={prodForm.type} onChange={e=>setProdForm({...prodForm, type: e.target.value})}>
                            <option>Curtida</option><option>Doce</option>
                        </select>
                    </div>

                    <div><label className="label">Preço (R$)</label><input required type="number" step="0.01" className="input" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})}/></div>
                    <div><label className="label">Teor Alcoólico (%)</label><input className="input" value={prodForm.abv} onChange={e=>setProdForm({...prodForm, abv: e.target.value})}/></div>
                    
                    <div className="col-span-1 md:col-span-2">
                        <label className="label">URL da Imagem</label>
                        <input className="input" placeholder="https://..." value={prodForm.imageUrl} onChange={e=>setProdForm({...prodForm, imageUrl: e.target.value})}/>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                        <label className="label">Descrição Detalhada</label>
                        <textarea rows={4} className="input" value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}/>
                    </div>
                 </div>
                 <button type="submit" className="w-full btn-primary py-4 text-lg shadow-lg active:scale-95 transition-transform">
                    Salvar Produto
                 </button>
               </form>
             </div>
          </div>
        )}

        {/* MODAL EXCLUSÃO */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-200">
              <div className="bg-red-100 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Tem certeza?</h3>
              <p className="text-slate-500 text-sm mb-6">Essa ação não poderá ser desfeita. O item será removido permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({open:false,type:null,id:null})} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ESTILOS CSS GLOBAIS */}
      <style>{`
        .input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; outline: none; transition: all 0.2s; }
        .input:focus { border-color: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2); }
        .label { display: block; font-size: 0.875rem; font-weight: 700; color: #334155; margin-bottom: 0.35rem; }
        .btn-primary { background-color: #eab308; color: #0f172a; font-weight: 800; border-radius: 0.75rem; }
        .btn-primary:hover { background-color: #ca8a04; color: white; }
        .animate-enter { animation: enter 0.4s ease-out; }
        @keyframes enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}