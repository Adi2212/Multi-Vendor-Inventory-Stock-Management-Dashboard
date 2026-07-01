import api from './api';

// Categories
export const getCategories = () => api.get('/categories').then(res => res.data.data);
export const createCategory = (data: any) => api.post('/categories', data).then(res => res.data.data);
export const updateCategory = (id: number, data: any) => api.put(`/categories/${id}`, data).then(res => res.data.data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

// Users
export const getUsers = () => api.get('/users').then(res => res.data.data);
export const createUser = (data: any) => api.post('/users', data).then(res => res.data.data);
export const updateUser = (id: number, data: any) => api.put(`/users/${id}`, data).then(res => res.data.data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Products
export const getProducts = () => api.get('/products').then(res => res.data.data);
export const createProduct = (data: any) => api.post('/products', data).then(res => res.data.data);
export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data).then(res => res.data.data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Suppliers
export const getSuppliers = () => api.get('/suppliers').then(res => res.data.data);
export const createSupplier = (data: any) => api.post('/suppliers', data).then(res => res.data.data);
export const updateSupplier = (id: number, data: any) => api.put(`/suppliers/${id}`, data).then(res => res.data.data);
export const deleteSupplier = (id: number) => api.delete(`/suppliers/${id}`);

// Customers
export const getCustomers = () => api.get('/customers').then(res => res.data.data);
export const createCustomer = (data: any) => api.post('/customers', data).then(res => res.data.data);
export const updateCustomer = (id: number, data: any) => api.put(`/customers/${id}`, data).then(res => res.data.data);
export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats').then(res => res.data.data);

// Purchases
export const getPurchases = () => api.get('/purchases').then(res => res.data.data);
export const createPurchase = (data: any) => api.post('/purchases', data).then(res => res.data.data);
export const getPurchaseById = (id: number) => api.get(`/purchases/${id}`).then(res => res.data.data);
export const updatePurchaseStatus = (id: number, status: string) => api.put(`/purchases/${id}/status`, { status }).then(res => res.data.data);

// Sales
export const getSales = () => api.get('/sales').then(res => res.data.data);
export const createSale = (data: any) => api.post('/sales', data).then(res => res.data.data);
export const getSaleById = (id: number) => api.get(`/sales/${id}`).then(res => res.data.data);

export const downloadInvoice = async (id: number) => {
    const res = await api.get(`/sales/${id}/invoice`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-INV-${id.toString().padStart(4, '0')}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};
