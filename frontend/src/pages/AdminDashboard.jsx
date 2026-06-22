import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

const AdminDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';
  const [activeTab, setActiveTab] = useState('products');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProduct, setNewProduct] = useState({ symbol: '', name: '', price: '', imageUrl: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await API.get('/admin/stocks');
        setProducts(res.data);
      } else if (activeTab === 'customers' && isAdmin) {
        const res = await API.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'orders' && isAdmin) {
        const res = await API.get('/admin/transactions');
        setOrders(res.data);
      }
      setError('');
    } catch (err) {
      console.error(`Failed to fetch seller data for ${activeTab}:`, err.message);
      setError('Failed to retrieve seller records. Check account privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
    setSubmitMessage({ text: '', type: '' });
    // eslint-disable-next-line
  }, [activeTab]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitMessage({ text: '', type: '' });

    if (!newProduct.symbol || !newProduct.name || !newProduct.price || Number(newProduct.price) <= 0) {
      setSubmitMessage({ text: 'Please fill in all product details correctly.', type: 'error' });
      return;
    }

    try {
      await API.post('/admin/stocks', newProduct);
      setSubmitMessage({ text: `Product ${newProduct.symbol.toUpperCase()} listed successfully.`, type: 'success' });
      setNewProduct({ symbol: '', name: '', price: '', imageUrl: '' });
      fetchSellerData();
    } catch (err) {
      setSubmitMessage({ text: err.response?.data?.message || 'Failed to list product.', type: 'error' });
    }
  };

  const readImageFile = (file, callback) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSubmitMessage({ text: 'Please choose a valid image file.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const handleReviewProduct = async (symbol, reviewStatus) => {
    setSubmitMessage({ text: '', type: '' });
    try {
      await API.patch(`/admin/stocks/${symbol}/review`, { reviewStatus });
      setSubmitMessage({ text: `Product ${symbol} marked ${reviewStatus.toLowerCase()}.`, type: 'success' });
      fetchSellerData();
    } catch (err) {
      setSubmitMessage({ text: err.response?.data?.message || 'Failed to review product.', type: 'error' });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSubmitMessage({ text: '', type: '' });

    if (!editingProduct.name || !editingProduct.price || Number(editingProduct.price) <= 0) {
      setSubmitMessage({ text: 'Please fill in all product details correctly.', type: 'error' });
      return;
    }

    try {
      await API.put(`/admin/stocks/${editingProduct.symbol}`, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        imageUrl: editingProduct.imageUrl || ''
      });
      setSubmitMessage({ text: `Product ${editingProduct.symbol} updated successfully.`, type: 'success' });
      setEditingProduct(null);
      fetchSellerData();
    } catch (err) {
      setSubmitMessage({ text: err.response?.data?.message || 'Failed to update product.', type: 'error' });
    }
  };

  const handleDeleteProduct = async (symbol) => {
    if (!window.confirm(`Delete product ${symbol} from the ShopEZ catalog?`)) {
      return;
    }
    setSubmitMessage({ text: '', type: '' });
    try {
      await API.delete(`/admin/stocks/${symbol}`);
      setSubmitMessage({ text: `Product ${symbol} deleted successfully.`, type: 'success' });
      fetchSellerData();
    } catch (err) {
      setSubmitMessage({ text: err.response?.data?.message || 'Failed to delete product.', type: 'error' });
    }
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <h1 className="text-2xl font-extrabold text-russett md:text-3xl">
          {isAdmin ? 'Admin Dashboard' : 'Seller Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-textSecondary">
          {isAdmin
            ? 'Monitor seller products, review orders, and oversee ShopEZ system activity.'
            : 'Add new products and manage your own ShopEZ inventory.'}
        </p>
      </div>

      <div className="flex gap-6 border-b border-darkBorder/60">
        {[
          ['products', 'Products'],
          ...(isAdmin ? [['customers', 'Customers'], ['orders', 'Orders']] : [])
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
              activeTab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-trendDown/30 bg-trendDown/10 p-4 text-sm text-trendDown">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {activeTab === 'products' && (
          <>
            {isSeller && (
            <div className="glass-card flex flex-col gap-5 rounded-2xl border border-darkBorder p-6 lg:col-span-1">
              {editingProduct ? (
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">Edit Product: {editingProduct.symbol}</h3>
                  <p className="mt-1 text-xs text-textMuted">Modify product name or checkout price</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">Create Product</h3>
                  <p className="mt-1 text-xs text-textMuted">Add a new item to the ShopEZ catalog</p>
                </div>
              )}

              {submitMessage.text && (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    submitMessage.type === 'success'
                      ? 'border-trendUp/30 bg-trendUp/10 text-trendUp'
                      : 'border-trendDown/30 bg-trendDown/10 text-trendDown'
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">SKU</label>
                  <input
                    type="text"
                    disabled={!!editingProduct}
                    value={editingProduct ? editingProduct.symbol : newProduct.symbol}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, symbol: e.target.value })
                        : setNewProduct({ ...newProduct, symbol: e.target.value })
                    }
                    placeholder="e.g. BAG01"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, name: e.target.value })
                        : setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="e.g. Everyday Travel Tote"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, price: e.target.value })
                        : setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="e.g. 89.00"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Image Link</label>
                  <input
                    type="url"
                    value={editingProduct ? editingProduct.imageUrl || '' : newProduct.imageUrl}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                        : setNewProduct({ ...newProduct, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/product.jpg"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      readImageFile(e.target.files?.[0], (imageUrl) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, imageUrl })
                          : setNewProduct({ ...newProduct, imageUrl })
                      )
                    }
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                  />
                </div>

                {(editingProduct?.imageUrl || newProduct.imageUrl) && (
                  <img
                    src={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl}
                    alt="Product preview"
                    className="h-32 w-full rounded-xl border border-darkBorder object-cover"
                  />
                )}

                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-accent to-accentHover py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_15px_rgba(109,152,145,0.34)]"
                  >
                    {editingProduct ? 'Save Product' : 'List Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="rounded-xl border border-darkBorder bg-white/5 px-4 py-2.5 text-sm font-semibold text-textPrimary transition-all hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            )}

            <div className={`glass-card overflow-hidden rounded-2xl border border-darkBorder p-0 ${isSeller ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="border-b border-darkBorder p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
                  {isAdmin ? 'Seller Product Review' : 'My Inventory Listings'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table-custom w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-darkBg/20">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">SKU</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Image</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Product</th>
                      {isAdmin && (
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Seller</th>
                      )}
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Price</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-textMuted">Review</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-xs text-textMuted">Fetching listings...</td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.symbol} className="border-b border-darkBorder/40">
                          <td className="px-6 py-3.5 font-bold text-accent">{product.symbol}</td>
                          <td className="px-6 py-3.5">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                                {product.symbol}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5 font-medium">{product.name}</td>
                          {isAdmin && (
                            <td className="px-6 py-3.5 text-sm text-textSecondary">
                              {product.sellerId?.username || 'Seller unavailable'}
                            </td>
                          )}
                          <td className="px-6 py-3.5 text-right font-semibold">{formatCurrency(product.price)}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              product.reviewStatus === 'PENDING'
                                ? 'border-geraldine/40 bg-geraldine/10 text-russett'
                                : 'border-accent/30 bg-accent/10 text-accent'
                            }`}>
                              {product.reviewStatus || 'APPROVED'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex justify-center gap-2">
                              {isSeller ? (
                                <>
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="rounded-lg border border-darkBorder bg-white/5 px-3 py-1 text-xs font-semibold text-textPrimary transition-all hover:border-accent/40 hover:bg-accent/20 hover:text-accent"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.symbol)}
                                    className="rounded-lg border border-darkBorder bg-white/5 px-3 py-1 text-xs font-semibold text-textPrimary transition-all hover:border-trendDown/40 hover:bg-trendDown/20 hover:text-trendDown"
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleReviewProduct(product.symbol, product.reviewStatus === 'APPROVED' ? 'PENDING' : 'APPROVED')}
                                  className="rounded-lg border border-darkBorder bg-white/5 px-3 py-1 text-xs font-semibold text-textPrimary transition-all hover:border-accent/40 hover:bg-accent/20 hover:text-accent"
                                >
                                  {product.reviewStatus === 'APPROVED' ? 'Mark Pending' : 'Approve'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-sm text-textSecondary">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'customers' && (
          <div className="glass-card overflow-hidden rounded-2xl border border-darkBorder p-0 lg:col-span-3">
            <div className="border-b border-darkBorder p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Customer Directory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-custom w-full border-collapse text-left">
                <thead>
                  <tr className="bg-darkBg/20">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Username</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-xs text-textMuted">Fetching customers...</td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((userObj) => (
                      <tr key={userObj._id} className="border-b border-darkBorder/40">
                        <td className="px-6 py-3.5 font-mono text-xs text-textMuted">{userObj._id}</td>
                        <td className="px-6 py-3.5 font-bold text-textPrimary">{userObj.username}</td>
                        <td className="px-6 py-3.5 text-textSecondary">{userObj.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            userObj.role === 'ADMIN'
                              ? 'border-geraldine/30 bg-geraldine/10 text-russett'
                              : 'border-accent/30 bg-accent/10 text-accent'
                          }`}>
                            {userObj.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-sm text-textSecondary">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="glass-card overflow-hidden rounded-2xl border border-darkBorder p-0 lg:col-span-3">
            <div className="border-b border-darkBorder p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Order Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-custom w-full border-collapse text-left">
                <thead>
                  <tr className="bg-darkBg/20">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Date / Time</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Action</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">SKU</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Qty</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Unit Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-xs text-textMuted">Fetching orders...</td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b border-darkBorder/40 text-sm">
                        <td className="px-6 py-3.5 text-xs text-textMuted">{new Date(order.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3.5 font-bold text-textPrimary">{order.userId?.username || 'Deleted User'}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                            order.type === 'BUY'
                              ? 'border border-trendUp/20 bg-trendUp/10 text-trendUp'
                              : 'border border-trendDown/20 bg-trendDown/10 text-trendDown'
                          }`}>
                            {order.type === 'BUY' ? 'ORDER' : 'RETURN'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-accent">{order.symbol}</td>
                        <td className="px-6 py-3.5 text-right font-medium text-textPrimary">{order.quantity}</td>
                        <td className="px-6 py-3.5 text-right text-textSecondary">{formatCurrency(order.price)}</td>
                        <td className={`px-6 py-3.5 text-right font-bold ${order.type === 'BUY' ? 'text-trendUp' : 'text-trendDown'}`}>
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-sm text-textSecondary">No orders recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
