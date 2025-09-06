import { supabase } from '../supabaseClient';

//匿名で来た人に番号を割り振る
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