const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.accessToken = null;
    this.refreshToken = null;

    // Load tokens from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });

      // Handle token expiry
      if (res.status === 401) {
        const data = await res.json();
        if (data.code === 'TOKEN_EXPIRED' && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            return retryRes.json();
          }
        }
        this.clearTokens();
        return data;
      }

      return res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network error' };
    }
  }

  async refreshAccessToken() {
    try {
      const res = await fetch(`${this.baseUrl}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      const data = await res.json();
      if (data.success) {
        this.setTokens(data.data.access_token, this.refreshToken);
        return true;
      }
      return false;
    } catch { return false; }
  }

  // Auth
  requestOtp(phone) {
    return this.request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) });
  }
  verifyOtp(phone, otp) {
    return this.request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp }) });
  }
  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User
  getMe() { return this.request('/users/me'); }
  updateMe(data) { return this.request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }); }

  // Config
  getConfig() { return this.request('/config'); }

  // Categories & Brands
  getCategories() { return this.request('/categories'); }
  getBrands(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/brands${qs ? '?' + qs : ''}`);
  }
  getBrand(slug) { return this.request(`/brands/${slug}`); }

  // Plans
  getPlans(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/plans${qs ? '?' + qs : ''}`);
  }

  // Cart
  getCart() { return this.request('/cart'); }
  addToCart(plan_id, quantity = 1) {
    return this.request('/cart/items', { method: 'POST', body: JSON.stringify({ plan_id, quantity }) });
  }
  removeFromCart(plan_id) {
    return this.request(`/cart/items/${plan_id}`, { method: 'DELETE' });
  }
  applyCoupon(code) {
    return this.request('/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) });
  }

  // Orders
  getOrders(page = 1) { return this.request(`/orders?page=${page}`); }
  checkout(payment_method = 'razorpay', idempotency_key = null) {
    const body = { payment_method };
    if (idempotency_key) body.idempotency_key = idempotency_key;
    return this.request('/orders/checkout', { method: 'POST', body: JSON.stringify(body) });
  }
  verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    return this.request('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
    });
  }

  // Wallet
  getWallet() { return this.request('/wallet'); }
  getTransactions(page = 1) { return this.request(`/wallet/transactions?page=${page}`); }
  topupWallet(amount) {
    return this.request('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) });
  }

  // Groups
  getPublicGroups(page = 1, search = '') {
    return this.request(`/groups/public?page=${page}${search ? '&search=' + search : ''}`);
  }
  getMyGroups() { return this.request('/groups/my'); }
  getOwnedGroups() { return this.request('/groups/owned'); }
  createGroup(data) {
    return this.request('/groups', { method: 'POST', body: JSON.stringify(data) });
  }
  resolveInvite(code) { return this.request(`/groups/invite/${code}`); }
  initiateJoin(groupId) {
    return this.request(`/groups/${groupId}/join/initiate`, { method: 'POST' });
  }
  verifyJoinPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    return this.request('/payments/verify-join', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
    });
  }
  leaveGroup(id) { return this.request(`/groups/${id}/leave`, { method: 'POST' }); }
  archiveGroup(id) { return this.request(`/groups/${id}/archive`, { method: 'POST' }); }

  // Earnings
  getEarningsSummary() { return this.request('/earnings/summary'); }
  getEarningsTransactions(page = 1) { return this.request(`/earnings/transactions?page=${page}`); }

  // Withdrawals
  requestWithdrawal(data) {
    return this.request('/withdrawals/request', { method: 'POST', body: JSON.stringify(data) });
  }
  getMyWithdrawals() { return this.request('/withdrawals/my'); }

  // Coupons
  validateCoupon(code, order_total) {
    return this.request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, order_total }) });
  }

  // ─── Admin APIs ────────────────────────────────────────────
  adminOverview() { return this.request('/admin/overview'); }

  adminGetUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/admin/users${qs ? '?' + qs : ''}`);
  }
  adminGetUser(id) { return this.request(`/admin/users/${id}`); }
  adminUpdateUser(id, data) { return this.request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  adminGetOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/admin/orders${qs ? '?' + qs : ''}`);
  }
  adminUpdateOrder(id, data) { return this.request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  adminGetGroups(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/admin/groups${qs ? '?' + qs : ''}`);
  }

  adminGetCoupons() { return this.request('/admin/coupons'); }
  adminCreateCoupon(data) { return this.request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }); }
  adminUpdateCoupon(id, data) { return this.request(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  adminGetBrands() { return this.request('/admin/brands'); }
  adminCreateBrand(data) { return this.request('/admin/brands', { method: 'POST', body: JSON.stringify(data) }); }
  adminUpdateBrand(id, data) { return this.request(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  adminGetWithdrawals(status = '') {
    return this.request(`/admin/withdrawals${status ? '?status=' + status : ''}`);
  }
  adminApproveWithdrawal(id) {
    return this.request(`/admin/withdrawals/${id}/approve`, { method: 'POST' });
  }
  adminRejectWithdrawal(id, reject_reason) {
    return this.request(`/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reject_reason }) });
  }
}

const api = new ApiClient();
export default api;
