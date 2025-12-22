// auth-manager.js - إدارة حالة المصادقة والمستخدم
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.init();
    }
    
    async init() {
        // التحقق من حالة المصادقة عند تحميل الصفحة
        await this.checkAuthState();
        
        // الاستماع لتغيرات حالة المصادقة
        if (window.supabase) {
            window.supabase.auth.onAuthStateChange((event, session) => {
                this.handleAuthChange(event, session);
            });
        }
    }
    
    async checkAuthState() {
        try {
            const result = await window.supabaseFunctions.getCurrentUser();
            
            if (result.success && result.user) {
                this.currentUser = result.user;
                await this.loadUserProfile(result.user.id);
                this.updateUIForAuthenticatedUser();
                return true;
            } else {
                this.updateUIForGuest();
                return false;
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.updateUIForGuest();
            return false;
        }
    }
    
    async loadUserProfile(userId) {
        try {
            const result = await window.supabaseFunctions.getUserProfile(userId);
            
            if (result.success && result.data) {
                this.userProfile = result.data;
                localStorage.setItem('rashadUser', JSON.stringify(result.data));
                return result.data;
            } else {
                // إنشاء ملف مستخدم مؤقت من بيانات المصادقة
                if (this.currentUser && this.currentUser.user_metadata) {
                    const tempProfile = {
                        id: userId,
                        email: this.currentUser.email,
                        first_name: this.currentUser.user_metadata.first_name || 'مستخدم',
                        last_name: this.currentUser.user_metadata.last_name || 'جديد',
                        user_type: this.currentUser.user_metadata.user_type || 'farmer',
                        state: this.currentUser.user_metadata.state || 'الخرطوم',
                        phone: this.currentUser.user_metadata.phone || '',
                        is_active: true
                    };
                    
                    this.userProfile = tempProfile;
                    localStorage.setItem('rashadUser', JSON.stringify(tempProfile));
                    return tempProfile;
                }
                return null;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            return null;
        }
    }
    
    async handleAuthChange(event, session) {
        console.log('Auth state changed:', event);
        
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session.user;
                await this.loadUserProfile(session.user.id);
                this.updateUIForAuthenticatedUser();
                break;
                
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.userProfile = null;
                localStorage.removeItem('rashadUser');
                this.updateUIForGuest();
                break;
                
            case 'USER_UPDATED':
                await this.loadUserProfile(session.user.id);
                break;
        }
    }
    
    updateUIForAuthenticatedUser() {
        // تحديث واجهة المستخدم للمستخدم المسجل
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            
            // تحديث معلومات المستخدم
            const userAvatar = userMenu.querySelector('.user-avatar');
            const userName = userMenu.querySelector('.user-name');
            const userType = userMenu.querySelector('.user-type');
            
            if (userAvatar && this.userProfile) {
                userAvatar.textContent = this.userProfile.first_name?.charAt(0) || 'م';
            }
            
            if (userName && this.userProfile) {
                userName.textContent = `${this.userProfile.first_name || ''} ${this.userProfile.last_name || ''}`.trim() || 'مستخدم';
            }
            
            if (userType && this.userProfile) {
                const userTypeMap = {
                    'farmer': 'مزارع',
                    'supplier': 'مورد',
                    'trader': 'تاجر',
                    'expert': 'خبير'
                };
                userType.textContent = userTypeMap[this.userProfile.user_type] || this.userProfile.user_type || 'مستخدم';
            }
        }
        
        // تحديث الروابط في القائمة الجانبية (إن وجدت)
        this.updateSidebarLinks();
    }
    
    updateUIForGuest() {
        // تحديث واجهة المستخدم للزائر
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
    
    updateSidebarLinks() {
        if (!this.userProfile) return;
        
        // تحديث الروابط حسب نوع المستخدم
        const sidebar = document.querySelector('.sidebar-menu');
        if (!sidebar) return;
        
        const links = sidebar.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // إخفاء روابط غير مناسبة لنوع المستخدم
            if (href && href.includes('farmer-dashboard') && this.userProfile.user_type !== 'farmer') {
                link.style.display = 'none';
            }
            
            if (href && href.includes('supplier-dashboard') && this.userProfile.user_type !== 'supplier') {
                link.style.display = 'none';
            }
            
            if (href && href.includes('trader-dashboard') && this.userProfile.user_type !== 'trader') {
                link.style.display = 'none';
            }
        });
    }
    
    async login(email, password) {
        try {
            const result = await window.supabaseFunctions.signIn(email, password);
            
            if (result.success) {
                // تحميل الملف الشخصي بعد تسجيل الدخول
                await this.loadUserProfile(result.data.user.id);
                
                // توجيه حسب نوع المستخدم
                this.redirectBasedOnUserType();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async register(userData) {
        try {
            const result = await window.supabaseFunctions.signUp(
                userData.email,
                userData.password,
                {
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    phone: userData.phone,
                    state: userData.state,
                    user_type: userData.userType
                }
            );
            
            if (result.success) {
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        try {
            const result = await window.supabaseFunctions.signOut();
            
            if (result.success) {
                this.currentUser = null;
                this.userProfile = null;
                localStorage.removeItem('rashadUser');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
    
    redirectBasedOnUserType() {
        if (!this.userProfile) return;
        
        const currentPage = window.location.pathname.split('/').pop();
        
        // إذا كان المستخدم في صفحة تسجيل الدخول أو التسجيل، قم بتوجيهه
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            switch (this.userProfile.user_type) {
                case 'farmer':
                    window.location.href = 'farmer-dashboard.html';
                    break;
                case 'supplier':
                    window.location.href = 'supplier-dashboard.html';
                    break;
                case 'trader':
                    window.location.href = 'trader-dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    getUser() {
        return this.currentUser;
    }
    
    getProfile() {
        return this.userProfile;
    }
    
    getUserType() {
        return this.userProfile ? this.userProfile.user_type : null;
    }
    
    getUserId() {
        return this.userProfile ? this.userProfile.id : null;
    }
}

// تهيئة مدير المصادقة
const authManager = new AuthManager();
window.authManager = authManager;
