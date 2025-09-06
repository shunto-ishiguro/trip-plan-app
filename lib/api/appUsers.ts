import { supabase } from '../supabaseClient';

export async function createAnonymousUser() {
    const { data, error } = await supabase
        .from('app_users')
        .insert([{}])
        .select();

    if (error) throw error;
    const user = data[0];

    localStorage.setItem('user_id', user.id);
    return user;
}
