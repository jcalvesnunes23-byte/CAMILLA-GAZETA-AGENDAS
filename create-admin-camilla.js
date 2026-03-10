import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://vyzdttcqeaxgfsrknjbu.supabase.co';
// PERIGO: Use sua SERVICE_ROLE_KEY aqui apenas para rodar este script uma vez
const supabaseServiceRoleKey = 'COLOQUE_SUA_SERVICE_ROLE_KEY_AQUI';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdmin() {
    console.log('Criando usuário administrador no novo projeto...');

    const { data, error } = await supabase.auth.admin.createUser({
        email: 'camillanunes.cg@gmail.com',
        password: '231105',
        email_confirm: true
    });

    if (error) {
        console.error('Erro ao criar usuário:', error.message);
    } else {
        console.log('Usuário criado com sucesso no novo projeto:', data.user?.email);
    }
}

createAdmin();
