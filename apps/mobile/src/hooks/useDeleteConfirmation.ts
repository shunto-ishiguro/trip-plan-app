import type { Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';

export function useDeleteConfirmation<T extends { id: string }>(
  deleteFn: (id: string) => Promise<void>,
  setItems: Dispatch<SetStateAction<T[]>>,
) {
  const confirmDelete = (item: T, title: string, message?: string) => {
    Alert.alert(title, message ?? '操作を選択', [
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFn(item.id);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
          } catch {
            Alert.alert('エラー', '削除に失敗しました');
          }
        },
      },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  };

  return { confirmDelete };
}
