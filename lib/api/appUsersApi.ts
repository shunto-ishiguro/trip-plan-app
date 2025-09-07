import { supabase } from '../supabaseClient';

//匿名で来た人に番号を割り振る
//app_user tableのほうでidを一意的に生成することにしているからからのオブジェクトを挿入するだけでいい
async function createAnonymousUserInDB() {
    const { data, error } = await supabase
        .from('app_users')
        .insert([{}])
        .select();

    if (error) throw error;
    return data[0].id; //自動生成されたUUIDを返す
}
function registerUserIdInLocalStorage(userId: string) {
    localStorage.setItem('user_id', userId);
}

//ユーザーidを取得するやつ
export async function getUserId() {
    const value = localStorage.getItem("user_id");
    if(value === null){
        //userが存在しなかったときの処理
        const userId = await createAnonymousUserInDB();
        registerUserIdInLocalStorage(userId);
        return userId;
    }
    else{
        //userが存在したときの処理
        return value;
    }
}