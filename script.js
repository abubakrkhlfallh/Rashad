// script.js - الملف الرئيسي مع تكامل Supabase

// DOM Ready
document.addEventListener('DOMContentLoaded', async function() {
    // تحميل Supabase SDK
    await loadSupabaseSDK();
    
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
});

// تحميل Supabase SDK
async function loadSupabaseSDK() {
    if (typeof supabase === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }
    
    // تحميل ملف التكوين
    await loadScript('supabase-config.js');
    
    // تحميل مدير المصادقة
    await loadScript('auth-manager.js');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// تحميل بيانات الصفحة حسب نوع الصفحة
async function loadPageData() {
    const page = window.location.pathname.split('/').pop();
    
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
}

// تحميل بيانات الصفحة الرئيسية
async function loadHomePageData() {
    try {
        // تحميل آخر المنتجات
        const productsResult = await window.supabaseFunctions.getProducts({ limit: 4 });
        
        if (productsResult.success && productsResult.data.length > 0) {
            displayFeaturedProducts(productsResult.data);
        }
        
        // تحميل عدد المستخدمين (في تطبيق حقيقي، هذه ستكون استعلامًا منفصلاً)
        updateUserCounts();
    } catch (error) {
        console.error('Error loading home page data:', error);
    }
}

// تحميل بيانات السوق
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

// تحميل بيانات لوحة تحكم المزارع
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
        
        // تحميل الإحصائيات
        const statsResult = await window.supabaseFunctions.getDashboardStats(user.id, 'farmer');
        
        if (statsResult.success) {
            updateDashboardStats(statsResult.data);
        }
        
        // تحميل الخطط الزراعية
        const plansResult = await window.supabaseFunctions.getFarmerPlans(user.id);
        
        if (plansResult.success && plansResult.data.length > 0) {
            displayFarmingPlans(plansResult.data);
        }
        
        // تحميل بيانات الطقس
        const weatherResult = await window.supabaseFunctions.getWeatherData(user.state, '');
        
        if (weatherResult.success) {
            displayWeatherData(weatherResult.data);
        }
        
        // تحميل الطلبات الأخيرة
        const ordersResult = await window.supabaseFunctions.getUserOrders(user.id, 'seller');
        
        if (ordersResult.success) {
            displayRecentOrders(ordersResult.data);
        }
        
    } catch (error) {
        console.error('Error loading farmer dashboard data:', error);
    }
}

// تحديث ملفات HTML مع وظائف التكامل:

## 4. تحديث `login.html`:

```html
<!-- إضافة قبل </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="auth-manager.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async function() {
    // التحقق مما إذا كان المستخدم مسجلاً بالفعل
    await window.authManager.checkAuthState();
    
    // التعامل مع نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const userType = document.getElementById('userType').value;
            
            if (!email || !password || !userType) {
                showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // عرض حالة التحميل
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
            submitBtn.disabled = true;
            
            try {
                const result = await window.authManager.login(email, password);
                
                if (result.success) {
                    showSuccess('تم تسجيل الدخول بنجاح');
                    
                    // سيتم التوجيه تلقائياً بواسطة authManager
                } else {
                    showError(result.error || 'خطأ في تسجيل الدخول');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                showError('حدث خطأ غير متوقع');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successDiv.style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}
</script>
