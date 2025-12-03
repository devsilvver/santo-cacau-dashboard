import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Trash2, 
  Save, 
  Search, 
  Edit,
  X,
  AlertTriangle 
} from 'lucide-react';

// Endereço da API (Local)
const API_URL = 'http://localhost:3000/api/products';

// Interface igual à do Banco de Dados
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
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado do Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Estado do Formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    packaging: 'Garrafa PET',
    type: 'Curtida', // Começa com valor padrão
    imageUrl: '',
    abv: '38.0',
    volume: '1L'
  });

  // Carregar produtos ao iniciar
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      alert('Erro ao conectar com a API. Verifique se o servidor está rodando na porta 3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // Preparar Formulário para Edição
  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      price: p.price ? p.price.toString() : '0',
      packaging: p.packaging || 'Garrafa PET',
      type: p.type || 'Curtida',
      imageUrl: p.image_url || '',
      abv: p.abv ? p.abv.toString() : '0',
      volume: p.volume || ''
    });
    setView('FORM');
  };

  // Preparar Formulário para Novo Produto
  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      packaging: 'Garrafa PET',
      type: 'Curtida', // Padrão
      imageUrl: '',
      abv: '38.0',
      volume: '1L'
    });
    setView('FORM');
  };

  // REGRA DE NEGÓCIO: Mudança automática de volume baseada na embalagem
  const handlePackagingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPkg = e.target.value;
    let newVol = formData.volume;

    if (newPkg === 'Garrafa PET') newVol = '1L';
    if (newPkg === 'Garrafa de Vidro') newVol = '700ml';

    setFormData({ 
      ...formData, 
      packaging: newPkg, 
      volume: newVol 
    });
  };

  // Lógica de Exclusão
  const reqDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await fetch(`${API_URL}/${productToDelete}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      loadProducts();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  // Salvar (Criar ou Atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      abv: parseFloat(formData.abv)
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setView('LIST');
        loadProducts();
      } else {
        alert('Erro ao salvar. Verifique o console da API.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtragem na tabela
  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        
        {/* LOGO E TÍTULO - Alteração Aqui */}
        <div className="p-8 flex flex-col items-center border-b border-slate-800">
          {/* Container claro atrás da logo para dar contraste */}
          <div className="bg-amber-50 p-3 rounded-xl mb-4 shadow-lg shadow-yellow-500/20">
            <img 
              src="https://i.imgur.com/Q3oTWj1.png" 
              alt="Logo Celeiro" 
              className="w-20 h-auto object-contain hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
            Celeiro Admin
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button onClick={() => setView('LIST')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'LIST' ? 'bg-yellow-500 text-slate-900 font-bold shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Produtos
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          v2.7 - Correção de Contraste
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-slate-100">
        
        {/* VISÃO: LISTA DE PRODUTOS */}
        {view === 'LIST' && (
          <div className="max-w-6xl mx-auto animate-enter">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Estoque</h2>
                <p className="text-slate-500">Gerencie o catálogo do site</p>
              </div>
              <button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95">
                <PlusCircle size={20} /> Novo Produto
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Barra de Busca */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou tipo..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabela */}
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Foto</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Embalagem</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Carregando dados...</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-3">
                        <img src={p.image_url} alt="" className="w-10 h-10 object-contain bg-white rounded-md border border-slate-200" />
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{p.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${(p.packaging || '').includes('Vidro') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {(p.packaging || 'Indefinido').replace('Garrafa ', '')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium uppercase">
                          {p.type || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-green-600">R$ {Number(p.price).toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit size={18} /></button>
                          <button onClick={() => reqDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISÃO: FORMULÁRIO */}
        {view === 'FORM' && (
          <div className="max-w-2xl mx-auto animate-enter">
            <button onClick={() => setView('LIST')} className="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2">
              <X size={16} /> Cancelar e voltar
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
                {/* Adicionei um fundo claro na logo do formulário também para consistência */}
                <div className="bg-amber-50 p-1 rounded-lg">
                  <img src="https://i.imgur.com/Q3oTWj1.png" className="h-8 object-contain" />
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                    <input required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  {/* Embalagem (Select com Lógica Automática) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Embalagem (Obrigatório)</label>
                    <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-blue-50/30" 
                      value={formData.packaging} 
                      onChange={handlePackagingChange}
                    >
                      <option value="Garrafa PET">Garrafa PET</option>
                      <option value="Garrafa de Vidro">Garrafa de Vidro</option>
                    </select>
                  </div>

                  {/* Categoria (Select Obrigatório - ESTILO UNIFICADO) */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoria (Obrigatório)</label>
                    <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-blue-50/30" 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Curtida">Curtida (Madeiras)</option>
                      <option value="Doce">Doce (Sabores/Licores)</option>
                    </select>
                  </div>

                  {/* Preço */}
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Preço (R$)</label>
                    <input required type="number" step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>

                  {/* Imagem */}
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Link da Imagem</label>
                    <div className="flex gap-4">
                      <input required type="text" placeholder="https://..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                        value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                      {formData.imageUrl && <img src={formData.imageUrl} className="w-10 h-10 object-contain border rounded bg-white" />}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                    <textarea required rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Teor Alcoólico (%)</label>
                    <input type="number" step="0.1" className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none" 
                      value={formData.abv} onChange={e => setFormData({...formData, abv: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Volume (Automático)</label>
                    <input type="text" readOnly className="w-full px-4 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg outline-none cursor-not-allowed" 
                      value={formData.volume} />
                  </div>
                </div>

                <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                  <Save size={20} /> Salvar Produto
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE EXCLUSÃO */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 border border-slate-200">
              <div className="bg-red-100 p-3 rounded-full mb-4 inline-block">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Produto?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}