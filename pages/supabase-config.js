// supabase-config.js
const SUPABASE_URL = 'https://ndnnqbhfhyexhkfdynti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbm5xYmhmaHlleGhrZmR5bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODkyODMsImV4cCI6MjA4MTk2NTI4M30.zNZjtbN4h_2oevpMuLUYbyBigrIkJXzOWdOFFEJNeJM';

// تهيئة عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
