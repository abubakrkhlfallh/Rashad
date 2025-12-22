// script.js - الملف الرئيسي للجافاسكريبت

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المكونات
    initMobileMenu();
    initForms();
    initModals();
    initTabs();
    initFilters();
    initCharts();
    
    // تحميل البيانات حسب الصفحة
    loadPageData();
    
    // تعيين السنة الحالية في التذييل
    setCurrentYear();
    
    // إضافة أنماط إضافية
    addAdditionalStyles();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggler && menu) {
        toggler.addEventListener('click', function() {
            menu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!toggler.contains(event.target) && !menu.contains(event.target)) {
                menu.classList.remove('show');
            }
        });
    }
}

// Form Validation and Handling
function initForms() {
    // Generic form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Show error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'form-error';
                    errorDiv.textContent = 'هذا الحقل مطلوب';
                    errorDiv.style.color = 'var(--error-color)';
                    errorDiv.style.fontSize = '12px';
                    errorDiv.style.marginTop = '5px';
                    
                    field.parentNode.appendChild(errorDiv);
                    
                    // Remove error on input
                    field.addEventListener('input', function() {
                        this.classList.remove('error');
                        if (this.parentNode.querySelector('.form-error')) {
                            this.parentNode.querySelector('.form-error').remove();
                        }
                    });
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

// Modal Handling
function initModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Close modals with close buttons
    document.querySelectorAll('.modal-close, .close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Tab Switching
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab');
        const tabPanes = container.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show active tab pane
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('data-pane') === tabId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    });
}

// Filter Functionality
function initFilters() {
    const filterForms = document.querySelectorAll('.filter-form');
    
    filterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters(this);
        });
        
        // Clear filters
        const clearBtn = form.querySelector('.clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearFilters(form);
            });
        }
    });
}

// Chart Initialization
function initCharts() {
    // Check if Chart.js is loaded (ستتم إضافته لاحقاً)
    if (typeof Chart === 'undefined') return;
    
    // Production chart
    const productionCtx = document.getElementById('productionChart');
    if (productionCtx) {
        new Chart(productionCtx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'الإنتاجية (طن)',
                    data: [12, 15, 18, 14, 20, 22],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                }
            }
        });
    }
}

// Load Page Data
async function loadPageData() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    try {
        switch (page) {
            case 'index.html':
                await loadHomePageData();
                break;
            case 'marketplace.html':
                await loadMarketplaceData();
                break;
            case 'farmer-dashboard.html':
                await loadFarmerDashboardData();
                break;
            case 'supplier-dashboard.html':
                await loadSupplierDashboardData();
                break;
            case 'trader-dashboard.html':
                await loadTraderDashboardData();
                break;
            case 'expert-consultation.html':
                await loadExpertsData();
                break;
        }
    } catch (error) {
        console.error('Error loading page data:', error);
    }
}

// Load Home Page Data
async function loadHomePageData() {
    try {
        // Load featured products
        const productsResult = await window.supabaseFunctions.getProducts({ limit: 4 });
        
        if (productsResult.success && productsResult.data && productsResult.data.length > 0) {
            displayFeaturedProducts(productsResult.data);
        }
        
        // Update user counts
        updateUserCounts();
    } catch (error) {
        console.error('Error loading home page data:', error);
    }
}

// Load Marketplace Data
async function loadMarketplaceData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const filters = {
            product_type: urlParams.get('type'),
            category: urlParams.get('category'),
            state: urlParams.get('state'),
            min_price: urlParams.get('min_price'),
            max_price: urlParams.get('max_price')
        };
        
        const result = await window.supabaseFunctions.getProducts(filters);
        
        if (result.success) {
            displayProducts(result.data);
        } else {
            showError('حدث خطأ في تحميل المنتجات');
        }
    } catch (error) {
        console.error('Error loading marketplace data:', error);
        showError('حدث خطأ في تحميل البيانات');
    }
}

// Load Farmer Dashboard Data
async function loadFarmerDashboardData() {
    try {
        if (!window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        const user = window.authManager.getProfile();
        
        if (user.user_type !== 'farmer') {
            window.location.href = 'index.html';
            return;
        }
        
        // Load dashboard stats
        const statsResult = await window.supabaseFunctions.getDashboardStats(user.id, 'farmer');
        
        if (statsResult.success) {
            updateDashboardStats(statsResult.data);
        }
        
        // Load farmer plans
        const plansResult = await window.supabaseFunctions.getFarmerPlans(user.id);
        
        if (plansResult.success && plansResult.data && plansResult.data.length > 0) {
            displayFarmingPlans(plansResult.data);
        }
        
        // Load weather data
        const weatherResult = await window.supabaseFunctions.getWeatherData(user.state);
        
        if (weatherResult.success) {
            displayWeatherData(weatherResult.data);
        }
        
        // Load recent orders
        const ordersResult = await window.supabaseFunctions.getUserOrders(user.id, 'seller');
        
        if (ordersResult.success && ordersResult.data) {
            displayRecentOrders(ordersResult.data);
        }
        
    } catch (error) {
        console.error('Error loading farmer dashboard data:', error);
    }
}

// Load Supplier Dashboard Data
async function loadSupplierDashboardData() {
    try {
        if (!window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        const user = window.authManager.getProfile();
        
        if (user.user_type !== 'supplier') {
            window.location.href = 'index.html';
            return;
        }
        
        // Load dashboard stats
        const statsResult = await window.supabaseFunctions.getDashboardStats(user.id, 'supplier');
        
        if (statsResult.success) {
            updateSupplierDashboardStats(statsResult.data);
        }
        
        // Load supplier products
        const productsResult = await window.supabaseFunctions.getProducts();
        
        if (productsResult.success && productsResult.data) {
            // Filter products by current user
            const userProducts = productsResult.data.filter(product => 
                product.users && product.users.first_name === user.first_name
            );
            displaySupplierProducts(userProducts);
        }
        
        // Load recent orders
        const ordersResult = await window.supabaseFunctions.getUserOrders(user.id, 'seller');
        
        if (ordersResult.success && ordersResult.data) {
            displaySupplierOrders(ordersResult.data);
        }
        
    } catch (error) {
        console.error('Error loading supplier dashboard data:', error);
    }
}

// Load Trader Dashboard Data
async function loadTraderDashboardData() {
    try {
        if (!window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        const user = window.authManager.getProfile();
        
        if (user.user_type !== 'trader') {
            window.location.href = 'index.html';
            return;
        }
        
        // Load dashboard stats
        const statsResult = await window.supabaseFunctions.getDashboardStats(user.id, 'trader');
        
        if (statsResult.success) {
            updateTraderDashboardStats(statsResult.data);
        }
        
        // Load recent orders
        const ordersResult = await window.supabaseFunctions.getUserOrders(user.id, 'buyer');
        
        if (ordersResult.success && ordersResult.data) {
            displayTraderOrders(ordersResult.data);
        }
        
        // Load market prices
        await loadMarketPrices();
        
    } catch (error) {
        console.error('Error loading trader dashboard data:', error);
    }
}

// Load Experts Data
async function loadExpertsData() {
    try {
        const result = await window.supabaseFunctions.getExperts();
        
        if (result.success && result.data) {
            displayExperts(result.data);
        } else {
            showError('حدث خطأ في تحميل بيانات الخبراء');
        }
    } catch (error) {
        console.error('Error loading experts data:', error);
        showError('حدث خطأ في تحميل البيانات');
    }
}

// Display Functions
function displayFeaturedProducts(products) {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-seedling"></i>
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="text-muted">${product.description?.substring(0, 100)}...</p>
                <div class="product-price">${product.price?.toLocaleString()} ج.س</div>
            </div>
        </div>
    `).join('');
}

function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-products">لا توجد منتجات متاحة حالياً</div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-${getProductIcon(product.product_type)}"></i>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h4>${product.name}</h4>
                <p class="text-muted">${product.description?.substring(0, 100)}...</p>
                <div class="product-details">
                    <span><i class="fas fa-weight-hanging"></i> ${product.quantity} ${product.unit}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${product.location_state}</span>
                </div>
                <div class="product-price">${product.price?.toLocaleString()} ج.س</div>
                <div class="product-seller">
                    <div class="seller-avatar">${product.users?.first_name?.charAt(0) || 'م'}</div>
                    <span>${product.users?.first_name || ''} ${product.users?.last_name || ''}</span>
                </div>
                <button class="btn btn-primary btn-block" onclick="buyProduct('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> شراء
                </button>
            </div>
        </div>
    `).join('');
}

function getProductIcon(productType) {
    const icons = {
        'crop': 'seedling',
        'seed': 'seedling',
        'fertilizer': 'flask',
        'equipment': 'tools',
        'other': 'box'
    };
    return icons[productType] || 'box';
}

function updateDashboardStats(stats) {
    // Update farmer dashboard stats
    const activePlans = document.getElementById('activePlans');
    const activeProducts = document.getElementById('activeProducts');
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    
    if (activePlans) activePlans.textContent = stats.active_plans || 0;
    if (activeProducts) activeProducts.textContent = stats.active_products || 0;
    if (monthlyRevenue) monthlyRevenue.textContent = stats.monthly_revenue?.toLocaleString() || '0';
}

function updateSupplierDashboardStats(stats) {
    const activeProducts = document.getElementById('activeProducts');
    const newOrders = document.getElementById('newOrders');
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    
    if (activeProducts) activeProducts.textContent = stats.active_products || 0;
    if (newOrders) newOrders.textContent = stats.new_orders || 0;
    if (monthlyRevenue) monthlyRevenue.textContent = stats.monthly_revenue?.toLocaleString() || '0';
}

function updateTraderDashboardStats(stats) {
    const activeOrders = document.getElementById('activeOrders');
    const monthlySpending = document.getElementById('monthlySpending');
    const totalQuantity = document.getElementById('totalQuantity');
    
    if (activeOrders) activeOrders.textContent = stats.active_orders || 0;
    if (monthlySpending) monthlySpending.textContent = stats.monthly_spending?.toLocaleString() || '0';
    if (totalQuantity) totalQuantity.textContent = stats.total_quantity || '0';
}

function displayFarmingPlans(plans) {
    const container = document.getElementById('farmingPlans');
    if (!container) return;
    
    container.innerHTML = plans.map(plan => `
        <div class="plan-card">
            <h4>${plan.crops?.name || 'محصول'}</h4>
            <p>المساحة: ${plan.farm_area} فدان</p>
            <p>موعد الزراعة: ${new Date(plan.planting_date).toLocaleDateString('ar-SA')}</p>
            <p>الحالة: <span class="status-badge status-${plan.status || 'active'}">${plan.status || 'نشط'}</span></p>
        </div>
    `).join('');
}

function displayWeatherData(weather) {
    const container = document.getElementById('weatherInfo');
    if (!container || !weather) return;
    
    container.innerHTML = `
        <div class="weather-card">
            <h4><i class="fas fa-cloud-sun"></i> الطقس اليوم</h4>
            <div class="weather-temp">${weather.temperature || 30}°</div>
            <p>${weather.weather_condition || 'مشمس'}</p>
            <div class="weather-details">
                <span><i class="fas fa-tint"></i> الرطوبة: ${weather.humidity || 45}%</span>
                <span><i class="fas fa-wind"></i> سرعة الرياح: ${weather.wind_speed || 12} كم/ساعة</span>
            </div>
        </div>
    `;
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-muted">لا توجد طلبات حديثة</p>';
        return;
    }
    
    const recentOrders = orders.slice(0, 5);
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div>
                <h5>${order.products?.name || 'طلب'}</h5>
                <p class="text-muted">${order.quantity || 0} ${order.products?.unit || 'وحدة'}</p>
            </div>
            <div>
                <span class="status-badge status-${order.status || 'pending'}">${order.status || 'معلق'}</span>
                <div class="text-muted">${order.total_price?.toLocaleString() || '0'} ج.س</div>
            </div>
        </div>
    `).join('');
}

function displaySupplierProducts(products) {
    const container = document.getElementById('supplierProducts');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="text-muted">لا توجد منتجات</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity} ${product.unit}</td>
            <td>${product.price?.toLocaleString()} ج.س</td>
            <td><span class="status-badge status-available">${product.is_available ? 'متوفر' : 'غير متوفر'}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editProduct('${product.id}')">تعديل</button>
            </td>
        </tr>
    `).join('');
}

function displaySupplierOrders(orders) {
    const container = document.getElementById('supplierOrders');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-muted">لا توجد طلبات</p>';
        return;
    }
    
    const recentOrders = orders.slice(0, 5);
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div>
                <h5>${order.products?.name || 'طلب'}</h5>
                <p class="text-muted">من: ${order.users?.first_name || ''} ${order.users?.last_name || ''}</p>
            </div>
            <div>
                <span class="status-badge status-${order.status || 'pending'}">${order.status || 'معلق'}</span>
                <div class="text-muted">${order.total_price?.toLocaleString() || '0'} ج.س</div>
            </div>
        </div>
    `).join('');
}

function displayTraderOrders(orders) {
    const container = document.getElementById('traderOrders');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-muted">لا توجد طلبات</p>';
        return;
    }
    
    const recentOrders = orders.slice(0, 5);
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div>
                <h5>${order.products?.name || 'طلب'}</h5>
                <p class="text-muted">من: ${order.users?.first_name || ''} ${order.users?.last_name || ''}</p>
            </div>
            <div>
                <span class="status-badge status-${order.status || 'pending'}">${order.status || 'معلق'}</span>
                <div class="text-muted">${order.total_price?.toLocaleString() || '0'} ج.س</div>
            </div>
        </div>
    `).join('');
}

function displayExperts(experts) {
    const container = document.getElementById('expertsGrid');
    if (!container) return;
    
    if (!experts || experts.length === 0) {
        container.innerHTML = '<div class="no-experts">لا توجد خبراء متاحين حالياً</div>';
        return;
    }
    
    container.innerHTML = experts.map(expert => `
        <div class="expert-card">
            <div class="expert-avatar">${expert.first_name?.charAt(0) || 'خ'}</div>
            <div class="expert-info">
                <h4>${expert.first_name || ''} ${expert.last_name || ''}</h4>
                <p class="text-muted">${expert.expert_profiles?.[0]?.specialization || 'خبير زراعي'}</p>
                <div class="expert-rating">
                    ${generateStars(expert.expert_profiles?.[0]?.rating || 0)}
                    <span>(${expert.expert_profiles?.[0]?.total_consultations || 0} استشارة)</span>
                </div>
                <div class="expert-price">
                    ${expert.expert_profiles?.[0]?.consultation_price?.toLocaleString() || '0'} ج.س/ساعة
                </div>
                <button class="btn btn-primary btn-block" onclick="bookConsultation('${expert.id}')">
                    <i class="fas fa-calendar-alt"></i> حجز استشارة
                </button>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

async function loadMarketPrices() {
    // This would load market prices from API
    // For now, we'll use mock data
    const prices = [
        { crop: 'قمح', price: 1500, change: '+2.5%' },
        { crop: 'ذرة', price: 1200, change: '-1.2%' },
        { crop: 'فول سوداني', price: 2000, change: '+3.8%' },
        { crop: 'سمسم', price: 3000, change: '0.0%' }
    ];
    
    const container = document.getElementById('marketPrices');
    if (!container) return;
    
    container.innerHTML = prices.map(item => `
        <tr>
            <td>${item.crop}</td>
            <td>${item.price.toLocaleString()} ج.س/طن</td>
            <td><span class="${item.change.includes('+') ? 'text-success' : item.change.includes('-') ? 'text-error' : ''}">
                ${item.change}
            </span></td>
        </tr>
    `).join('');
}

function updateUserCounts() {
    // This would be populated from API
    // For now, we'll set some mock numbers
    const userCounts = {
        farmers: 1250,
        suppliers: 320,
        traders: 180
    };
    
    const counters = document.querySelectorAll('.user-count');
    counters.forEach(counter => {
        const type = counter.dataset.type;
        if (userCounts[type]) {
            animateCounter(counter, userCounts[type]);
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 20);
}

// Buy Product Function
async function buyProduct(productId) {
    if (!window.authManager.isAuthenticated()) {
        alert('يجب تسجيل الدخول لشراء المنتجات');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const result = await window.supabaseFunctions.getProductById(productId);
        
        if (result.success && result.data) {
            const product = result.data;
            showPurchaseModal(product);
        } else {
            alert('المنتج غير متوفر حالياً');
        }
    } catch (error) {
        console.error('Error buying product:', error);
        alert('حدث خطأ في عملية الشراء');
    }
}

function showPurchaseModal(product) {
    // Create and show purchase modal
    const modalHTML = `
        <div class="modal" id="purchaseModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-shopping-cart"></i> تأكيد الشراء</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="form-group">
                        <label for="quantity">الكمية (${product.unit})</label>
                        <input type="number" id="quantity" min="1" max="${product.quantity}" value="1">
                    </div>
                    <div class="form-group">
                        <label for="notes">ملاحظات إضافية</label>
                        <textarea id="notes" rows="3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeModal('purchaseModal')">إلغاء</button>
                        <button class="btn btn-primary" onclick="confirmPurchase('${product.id}')">تأكيد الشراء</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.getElementById('purchaseModal').querySelector('.modal-close').addEventListener('click', () => {
        closeModal('purchaseModal');
    });
    
    // Show modal
    document.getElementById('purchaseModal').style.display = 'flex';
}

async function confirmPurchase(productId) {
    const quantity = document.getElementById('quantity').value;
    const notes = document.getElementById('notes').value;
    
    if (!quantity || quantity < 1) {
        alert('يرجى إدخال كمية صحيحة');
        return;
    }
    
    try {
        const user = window.authManager.getProfile();
        const productResult = await window.supabaseFunctions.getProductById(productId);
        
        if (!productResult.success || !productResult.data) {
            alert('المنتج غير متوفر');
            return;
        }
        
        const product = productResult.data;
        const totalPrice = product.price * quantity;
        
        const orderData = {
            buyer_id: user.id,
            seller_id: product.seller_id,
            product_id: productId,
            quantity: parseFloat(quantity),
            unit_price: product.price,
            total_price: totalPrice,
            status: 'pending',
            order_notes: notes
        };
        
        const result = await window.supabaseFunctions.createOrder(orderData);
        
        if (result.success) {
            alert('تم تأكيد طلبك بنجاح! سيتم التواصل مع البائع قريباً.');
            closeModal('purchaseModal');
            
            // Refresh page or update UI
            if (window.location.pathname.includes('marketplace')) {
                loadMarketplaceData();
            }
        } else {
            alert('حدث خطأ في تأكيد الطلب: ' + result.error);
        }
    } catch (error) {
        console.error('Error confirming purchase:', error);
        alert('حدث خطأ في عملية الشراء');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

function editProduct(productId) {
    alert('ميزة تعديل المنتج قيد التطوير. سيتم تفعيلها قريباً.');
}

function bookConsultation(expertId) {
    if (!window.authManager.isAuthenticated()) {
        alert('يجب تسجيل الدخول لحجز استشارة');
        window.location.href = 'login.html';
        return;
    }
    
    showBookingModal(expertId);
}

function showBookingModal(expertId) {
    // Create booking modal
    const modalHTML = `
        <div class="modal" id="bookingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-alt"></i> حجز استشارة</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="consultationDate">تاريخ الاستشارة</label>
                        <input type="date" id="consultationDate" required>
                    </div>
                    <div class="form-group">
                        <label for="consultationTime">وقت الاستشارة</label>
                        <select id="consultationTime" required>
                            <option value="09:00">9:00 صباحاً</option>
                            <option value="10:00">10:00 صباحاً</option>
                            <option value="11:00">11:00 صباحاً</option>
                            <option value="12:00">12:00 ظهراً</option>
                            <option value="13:00">1:00 ظهراً</option>
                            <option value="14:00">2:00 ظهراً</option>
                            <option value="15:00">3:00 عصراً</option>
                            <option value="16:00">4:00 عصراً</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="duration">المدة (دقائق)</label>
                        <select id="duration" required>
                            <option value="30">30 دقيقة</option>
                            <option value="60">60 دقيقة</option>
                            <option value="90">90 دقيقة</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="consultationNotes">موضوع الاستشارة</label>
                        <textarea id="consultationNotes" rows="3" placeholder="اشرح موضوع الاستشارة..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeModal('bookingModal')">إلغاء</button>
                        <button class="btn btn-primary" onclick="confirmBooking('${expertId}')">تأكيد الحجز</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('consultationDate').min = today;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('consultationDate').value = tomorrow.toISOString().split('T')[0];
    
    // Add close event
    document.getElementById('bookingModal').querySelector('.modal-close').addEventListener('click', () => {
        closeModal('bookingModal');
    });
    
    // Show modal
    document.getElementById('bookingModal').style.display = 'flex';
}

async function confirmBooking(expertId) {
    const date = document.getElementById('consultationDate').value;
    const time = document.getElementById('consultationTime').value;
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('consultationNotes').value;
    
    if (!date || !time || !duration) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }
    
    try {
        const user = window.authManager.getProfile();
        
        const consultationData = {
            farmer_id: user.id,
            expert_id: expertId,
            consultation_type: 'زراعة',
            scheduled_date: date,
            scheduled_time: time,
            duration_minutes: parseInt(duration),
            price: 50000, // سعر افتراضي
            status: 'scheduled',
            farmer_notes: notes
        };
        
        const result = await window.supabaseFunctions.bookConsultation(consultationData);
        
        if (result.success) {
            alert('تم حجز الاستشارة بنجاح! سيتم التواصل معك للتأكيد.');
            closeModal('bookingModal');
        } else {
            alert('حدث خطأ في حجز الاستشارة: ' + result.error);
        }
    } catch (error) {
        console.error('Error confirming booking:', error);
        alert('حدث خطأ في عملية الحجز');
    }
}

function applyFilters(form) {
    const formData = new FormData(form);
    const filters = {};
    
    for (const [key, value] of formData.entries()) {
        if (value) {
            filters[key] = value;
        }
    }
    
    // Update URL with filters
    const url = new URL(window.location);
    Object.keys(filters).forEach(key => {
        url.searchParams.set(key, filters[key]);
    });
    
    window.location.href = url.toString();
}

function clearFilters(form) {
    form.reset();
    window.location.search = '';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

function addAdditionalStyles() {
    const additionalStyles = `
        /* أنماط إضافية */
        .auth-page .form-row {
            display: flex;
            gap: 1rem;
        }
        
        @media (max-width: 768px) {
            .auth-page .form-row {
                flex-direction: column;
                gap: 0;
            }
        }
        
        .product-card {
            background: white;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow-light);
            transition: var(--transition);
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-medium);
        }
        
        .product-image {
            height: 150px;
            background: var(--light-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--primary-color);
        }
        
        .product-info {
            padding: 1rem;
        }
        
        .product-category {
            display: inline-block;
            background: var(--light-color);
            color: var(--primary-color);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        
        .product-details {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            font-size: 0.875rem;
            color: var(--gray-dark);
        }
        
        .product-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--primary-color);
            margin: 0.5rem 0;
        }
        
        .product-seller {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
            font-size: 0.875rem;
        }
        
        .seller-avatar {
            width: 30px;
            height: 30px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .expert-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            text-align: center;
            box-shadow: var(--shadow-light);
        }
        
        .expert-avatar {
            width: 80px;
            height: 80px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            margin: 0 auto 1rem;
        }
        
        .expert-rating {
            color: var(--accent-color);
            margin: 0.5rem 0;
        }
        
        .expert-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--primary-color);
            margin: 0.5rem 0 1rem;
        }
        
        .weather-card {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 1.5rem;
            border-radius: var(--border-radius);
        }
        
        .weather-temp {
            font-size: 3rem;
            font-weight: bold;
            margin: 0.5rem 0;
        }
        
        .weather-details {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            font-size: 0.875rem;
        }
        
        .plan-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--primary-color);
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-medium);
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .status-pending {
            background: #fff3e0;
            color: #f57c00;
        }
        
        .status-confirmed {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .status-shipped {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-delivered {
            background: #f3e5f5;
            color: #7b1fa2;
        }
        
        .status-cancelled {
            background: #ffebee;
            color: #c62828;
        }
        
        .status-available {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .modal-content {
            background: white;
            border-radius: var(--border-radius);
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--gray-medium);
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--gray-dark);
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            padding: 1.5rem;
            border-top: 1px solid var(--gray-medium);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        .table th {
            background: var(--light-color);
            padding: 0.75rem;
            text-align: right;
            font-weight: 600;
            border-bottom: 2px solid var(--gray-medium);
        }
        
        .table td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--gray-medium);
        }
        
        .table tr:hover {
            background: var(--light-color);
        }
        
        .no-products, .no-experts {
            text-align: center;
            padding: 3rem;
            color: var(--gray-dark);
            grid-column: 1 / -1;
        }
        
        .alert {
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1rem;
            animation: fadeIn 0.3s ease-in-out;
        }
        
        .alert-error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
        }
        
        .alert-success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
        }
        
        .alert-info {
            background: #e3f2fd;
            color: #1976d2;
            border: 1px solid #bbdefb;
        }
        
        .alert-warning {
            background: #fff3e0;
            color: #f57c00;
            border: 1px solid #ffe0b2;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .text-success { color: var(--success-color); }
        .text-error { color: var(--error-color); }
        .text-warning { color: var(--warning-color); }
        .text-info { color: var(--info-color); }
        
        .form-error {
            color: var(--error-color);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .form-control.error {
            border-color: var(--error-color);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}
