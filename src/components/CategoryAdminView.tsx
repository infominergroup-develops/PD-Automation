import React, { useState, useEffect } from 'react';
import { BusinessCategory, CategoryProduct } from '../types';
import { Settings, Plus, Edit2, Check, Package, Shield, FileText, Percent, Search } from 'lucide-react';

export const CategoryAdminView: React.FC = () => {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<BusinessCategory | null>(null);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatGroup, setNewCatGroup] = useState('Retail & Trade');
  const [newCatMinMargin, setNewCatMinMargin] = useState(12);
  const [newCatMaxMargin, setNewCatMaxMargin] = useState(25);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Core');
  const [newProdContrib, setNewProdContribution] = useState(25);
  const [newProdMargin, setNewProdMargin] = useState(20);
  const [newProdInventory, setNewProdInventory] = useState<'FAST_MOVING' | 'SLOW_MOVING' | 'PERISHABLE' | 'HIGH_VALUE' | 'SERVICE'>('FAST_MOVING');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
      if (data.categories?.length && !selectedCat) {
        setSelectedCat(data.categories[0]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (catId: string) => {
    try {
      const res = await fetch(`/api/products?categoryId=${catId}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      fetchProducts(selectedCat.id);
    }
  }, [selectedCat]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory: Partial<BusinessCategory> = {
      id: newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newCatName,
      icon: newCatIcon,
      industryGroup: newCatGroup,
      description: `Custom business category for ${newCatName}`,
      typicalMarginMin: Number(newCatMinMargin),
      typicalMarginMax: Number(newCatMaxMargin),
      requiredDocs: ['GST Certificate', 'Shop License', 'Trade Bills', 'Bank Statements'],
      validationRules: [],
      riskParameters: [{ parameter: 'Market Demand', weight: 0.3, description: 'Local consumer demand' }]
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingCategory(false);
        setNewCatName('');
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !newProdName.trim()) return;

    const newProduct: CategoryProduct = {
      id: 'prod-' + Date.now().toString(36),
      categoryId: selectedCat.id,
      productName: newProdName,
      productCategory: newProdCategory,
      revenueContributionPct: Number(newProdContrib),
      averageMarginPct: Number(newProdMargin),
      inventoryType: newProdInventory,
      businessImportance: 'HIGH'
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingProduct(false);
        setNewProdName('');
        fetchProducts(selectedCat.id);
      }
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industryGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2d3e50] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#eb8a23]" />
            Client Category & Product Mapping Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure business profiles, risk parameters, required documents, and product margin catalogs across 21 business profiles.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-semibold text-xs rounded-md shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Business Category
        </button>
      </div>

      {/* Main Grid: Left Category List, Right Selected Category Details & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Search & Sidebar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search 21 Categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                  selectedCat?.id === cat.id
                    ? 'bg-[#eb8a23]/10 border-[#eb8a23]/40 text-[#2d3e50] shadow-sm font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[10px] text-slate-500">{cat.industryGroup}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#d97917] bg-[#eb8a23]/10 px-2 py-0.5 rounded border border-[#eb8a23]/30">
                    {cat.typicalMarginMin}%-{cat.typicalMarginMax}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Category Workspace & Product Mapping Catalog */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCat ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
              {/* Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-slate-100 rounded-xl">{selectedCat.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{selectedCat.name}</h3>
                    <p className="text-xs text-slate-500">{selectedCat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Target Margin: {selectedCat.typicalMarginMin}% – {selectedCat.typicalMarginMax}%
                  </span>
                </div>
              </div>

              {/* Required Docs & Risk Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Mandatory Documents Required
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCat.requiredDocs.map((doc, i) => (
                      <span key={i} className="text-[11px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    Risk Parameters & Weightings
                  </h4>
                  <div className="space-y-1">
                    {selectedCat.riskParameters.map((rp, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-slate-600 font-medium">
                        <span>• {rp.parameter}</span>
                        <span className="text-blue-600 font-bold">{(rp.weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module 3: Configurable Product Mapping Engine */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Category Product Catalog & Average Margins
                  </h4>

                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product Item
                  </button>
                </div>

                {products.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Sub-Category</th>
                          <th className="py-2.5 px-3">Revenue Contribution</th>
                          <th className="py-2.5 px-3">Average Margin</th>
                          <th className="py-2.5 px-3">Inventory Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{p.productName}</td>
                            <td className="py-2.5 px-3 text-slate-500">{p.productCategory}</td>
                            <td className="py-2.5 px-3 font-semibold text-amber-600">{p.revenueContributionPct}%</td>
                            <td className="py-2.5 px-3 font-semibold text-green-600">{p.averageMarginPct}%</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {p.inventoryType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500 border border-slate-200">
                    No mapped products configured for this category yet. Click "Add Product Item" above to create one.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
              Select a business category from the left panel to inspect or configure products.
            </div>
          )}
        </div>
      </div>

      {/* Add New Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-400" />
              Add New Business Category
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar & Renewable Equipment"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Icon Emoji</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Industry Group</label>
                  <input
                    type="text"
                    value={newCatGroup}
                    onChange={(e) => setNewCatGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Min Margin %</label>
                  <input
                    type="number"
                    value={newCatMinMargin}
                    onChange={(e) => setNewCatMinMargin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Max Margin %</label>
                  <input
                    type="number"
                    value={newCatMaxMargin}
                    onChange={(e) => setNewCatMaxMargin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-800 text-white rounded text-xs font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Add Product Item for {selectedCat?.name}
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Basmati Rice 25kg"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Revenue Contribution %</label>
                  <input
                    type="number"
                    value={newProdContrib}
                    onChange={(e) => setNewProdContribution(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Average Margin %</label>
                  <input
                    type="number"
                    value={newProdMargin}
                    onChange={(e) => setNewProdMargin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
