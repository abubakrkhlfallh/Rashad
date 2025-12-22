// supabase-config.js - تكوين Supabase للاتصال بقاعدة البيانات

// استبدل هذه القيم بمعلومات مشروعك في Supabase
const SUPABASE_URL = 'https://ndnnqbhfhyexhkfdynti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbm5xYmhmaHlleGhrZmR5bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODkyODMsImV4cCI6MjA4MTk2NTI4M30.zNZjtbN4h_2oevpMuLUYbyBigrIkJXzOWdOFFEJNeJM'; 

// تهيئة عميل Supabase
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error('Error initializing Supabase:', error);
    // نسخة وهمية للاختبار
    supabase = {
        auth: {
            signUp: () => ({ data: null, error: null }),
            signInWithPassword: () => ({ data: null, error: null }),
            signOut: () => ({ error: null }),
            getUser: () => ({ data: { user: null } }),
            onAuthStateChange: () => ({ data: null })
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => ({ data: null, error: null })
                }),
                insert: () => ({ select: () => ({ data: null, error: null }) }),
                update: () => ({ eq: () => ({ select: () => ({ data: null, error: null }) }) }),
                delete: () => ({ eq: () => ({ data: null, error: null }) })
            })
        })
    };
}

// دالة للتسجيل
async function signUp(email, password, userData) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        
        // إنشاء سجل المستخدم في الجدول users
        if (data.user) {
            const { error: userError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email: email,
                    phone: userData.phone,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    user_type: userData.user_type,
                    state: userData.state,
                    is_active: true
                }]);
            
            if (userError) throw userError;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// دالة لتسجيل الدخول
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لتسجيل الخروج
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على المستخدم الحالي
async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على ملف المستخدم
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لإضافة منتج جديد
async function addProduct(productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على المنتجات
async function getProducts(filters = {}) {
    try {
        let query = supabase
            .from('products')
            .select('*, users(first_name, last_name, user_type)')
            .eq('is_available', true);
        
        // تطبيق الفلاتر
        if (filters.product_type && filters.product_type !== 'all') {
            query = query.eq('product_type', filters.product_type);
        }
        
        if (filters.state && filters.state !== 'all') {
            query = query.eq('location_state', filters.state);
        }
        
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        
        if (filters.min_price) {
            query = query.gte('price', filters.min_price);
        }
        
        if (filters.max_price) {
            query = query.lte('price', filters.max_price);
        }
        
        // ترتيب حسب الأحدث
        query = query.order('created_at', { ascending: false });
        
        // تحديد الحد الأقصى للنتائج
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error getting products:', error);
        return { success: false, error: error.message };
    }
}

// دالة للحصول على تفاصيل المنتج
async function getProductById(productId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, users(first_name, last_name, user_type, phone, state)')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لإضافة طلب جديد
async function createOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على طلبات المستخدم
async function getUserOrders(userId, userType) {
    try {
        let query;
        
        if (userType === 'buyer') {
            query = supabase
                .from('orders')
                .select('*, products(name, category, unit), users!orders_seller_id_fkey(first_name, last_name, phone)')
                .eq('buyer_id', userId)
                .order('created_at', { ascending: false });
        } else if (userType === 'seller') {
            query = supabase
                .from('orders')
                .select('*, products(name, category, unit), users!orders_buyer_id_fkey(first_name, last_name, phone)')
                .eq('seller_id', userId)
                .order('created_at', { ascending: false });
        } else {
            throw new Error('نوع المستخدم غير صالح');
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لتحديث حالة الطلب
async function updateOrderStatus(orderId, status) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لإرسال رسالة
async function sendMessage(messageData) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على المحادثات
async function getConversations(userId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:sender_id(first_name, last_name), receiver:receiver_id(first_name, last_name)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // تجميع المحادثات
        const conversations = {};
        data.forEach(message => {
            const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
            const otherUserName = message.sender_id === userId ? 
                `${message.receiver.first_name} ${message.receiver.last_name}` : 
                `${message.sender.first_name} ${message.sender.last_name}`;
            
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    user_id: otherUserId,
                    user_name: otherUserName,
                    last_message: message.message_text,
                    last_message_time: message.created_at,
                    unread: message.receiver_id === userId && !message.is_read,
                    messages: []
                };
            }
            
            conversations[otherUserId].messages.push(message);
        });
        
        return { success: true, data: Object.values(conversations) };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لتحديث رسالة كمقروءة
async function markMessageAsRead(messageId) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على الخبراء
async function getExperts() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*, expert_profiles(specialization, years_experience, consultation_price, rating, total_consultations)')
            .eq('user_type', 'expert')
            .eq('is_active', true);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لحجز استشارة
async function bookConsultation(consultationData) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .insert([consultationData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على بيانات الطقس
async function getWeatherData(state) {
    try {
        const { data, error } = await supabase
            .from('weather_data')
            .select('*')
            .eq('state', state)
            .order('forecast_date', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        // بيانات افتراضية إذا لم تكن هناك بيانات
        const defaultWeather = {
            temperature: 32,
            humidity: 45,
            wind_speed: 12,
            precipitation: 0,
            weather_condition: 'مشمس'
        };
        return { success: true, data: defaultWeather };
    }
}

// دالة لإنشاء خطة زراعية
async function createFarmingPlan(planData) {
    try {
        const { data, error } = await supabase
            .from('farming_plans')
            .insert([planData])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على خطط المزارع
async function getFarmerPlans(farmerId) {
    try {
        const { data, error } = await supabase
            .from('farming_plans')
            .select('*, crops(name, scientific_name)')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة لتحديث ملف المستخدم
async function updateUserProfile(userId, profileData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(profileData)
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// دالة للحصول على الإحصائيات
async function getDashboardStats(userId, userType) {
    try {
        let stats = {};
        
        if (userType === 'farmer') {
            // إحصائيات المزارع
            const { data: plans, error: plansError } = await supabase
                .from('farming_plans')
                .select('id')
                .eq('farmer_id', userId)
                .eq('status', 'active');
            
            if (plansError) throw plansError;
            
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id')
                .eq('seller_id', userId)
                .eq('is_available', true);
            
            if (productsError) throw productsError;
            
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total_price')
                .eq('seller_id', userId)
                .eq('status', 'delivered')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
            
            if (ordersError) throw ordersError;
            
            stats = {
                active_plans: plans?.length || 0,
                active_products: products?.length || 0,
                monthly_revenue: orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0
            };
            
        } else if (userType === 'supplier') {
            // إحصائيات المورد
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id')
                .eq('seller_id', userId)
                .eq('is_available', true);
            
            if (productsError) throw productsError;
            
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, status, total_price, created_at')
                .eq('seller_id', userId);
            
            if (ordersError) throw ordersError;
            
            const newOrders = orders?.filter(order => order.status === 'pending') || [];
            const monthlyRevenue = orders
                ?.filter(order => order.status === 'delivered')
                ?.filter(order => {
                    const orderDate = new Date(order.created_at);
                    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    return orderDate >= monthStart;
                })
                ?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
            
            stats = {
                active_products: products?.length || 0,
                new_orders: newOrders.length,
                monthly_revenue: monthlyRevenue
            };
            
        } else if (userType === 'trader') {
            // إحصائيات التاجر
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, status, total_price, quantity, created_at')
                .eq('buyer_id', userId);
            
            if (ordersError) throw ordersError;
            
            const activeOrders = orders?.filter(order => ['pending', 'confirmed', 'shipped'].includes(order.status)) || [];
            const monthlySpending = orders
                ?.filter(order => order.status === 'delivered')
                ?.filter(order => {
                    const orderDate = new Date(order.created_at);
                    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    return orderDate >= monthStart;
                })
                ?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
            
            const totalQuantity = orders
                ?.filter(order => order.status === 'delivered')
                ?.reduce((sum, order) => sum + (order.quantity || 0), 0) || 0;
            
            stats = {
                active_orders: activeOrders.length,
                monthly_spending: monthlySpending,
                total_quantity: totalQuantity
            };
        }
        
        return { success: true, data: stats };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return { success: false, error: error.message };
    }
}

// دالة للبحث عن منتجات
async function searchProducts(searchTerm, filters = {}) {
    try {
        let query = supabase
            .from('products')
            .select('*, users(first_name, last_name, user_type)')
            .eq('is_available', true);
        
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
        }
        
        // تطبيق الفلاتر
        if (filters.product_type) {
            query = query.eq('product_type', filters.product_type);
        }
        
        if (filters.state) {
            query = query.eq('location_state', filters.state);
        }
        
        if (filters.min_price) {
            query = query.gte('price', filters.min_price);
        }
        
        if (filters.max_price) {
            query = query.lte('price', filters.max_price);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.supabaseFunctions = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserProfile,
    addProduct,
    getProducts,
    getProductById,
    createOrder,
    getUserOrders,
    updateOrderStatus,
    sendMessage,
    getConversations,
    markMessageAsRead,
    getExperts,
    bookConsultation,
    getWeatherData,
    createFarmingPlan,
    getFarmerPlans,
    updateUserProfile,
    getDashboardStats,
    searchProducts,
    supabase // تصدير كائن supabase للاستخدام المباشر إذا لزم الأمر
};
