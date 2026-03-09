import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://voibrtarzaaeipyqcycm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaWJydGFyemFhZWlweXFjeWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDE1MzksImV4cCI6MjA4MDYxNzUzOX0.c1VYrOrdlS866sJow5D-21211P-_GYda3PZ-DLaJOSo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    console.log('Creating admin user...');

    const { data, error } = await supabase.auth.signUp({
        email: 'martinsjhuly8@gmail.com',
        password: '231105',
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.email);
    }
}

createAdmin();
