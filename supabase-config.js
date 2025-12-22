// supabase-config.js
const SUPABASE_URL = 'https://ndnnqbhfhyexhkfdynti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbm5xYmhmaHlleGhrZmR5bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODkyODMsImV4cCI6MjA4MTk2NTI4M30.zNZjtbN4h_2oevpMuLUYbyBigrIkJXzOWdOFFEJNeJM';

// تهيئة عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// وظيفة للتحقق من صلاحيات المسؤول
async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return false;
    }
    
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    
    if (error || !profile || !profile.is_admin) {
        return false;
    }
    
    return true;
}

// وظيفة تسجيل الدخول
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        throw error;
    }
    
    return data;
}

// وظيفة تسجيل الخروج
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
}