import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

type ReadResult<T> = { value: T; error: string };

function readValue<T>(key: string, initialValue: T): ReadResult<T> {
  try {
    const stored = window.localStorage.getItem(key);
    return { value: stored ? (JSON.parse(stored) as T) : initialValue, error: '' };
  } catch (error) {
    console.warn(`Không đọc được dữ liệu trên thiết bị: ${key}`, error);
    return { value: initialValue, error: 'Dữ liệu trên thiết bị chưa đọc được; nội dung mới sẽ không ghi đè bản cũ.' };
  }
}

export function useDeviceValue<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, string] {
  const [loaded] = useState(() => readValue(key, initialValue));
  const [value, setValue] = useState(loaded.value);
  const [error, setError] = useState(loaded.error);
  const [dirty, setDirty] = useState(false);

  const updateValue = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setValue(next);
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setError('');
    } catch (writeError) {
      console.error(`Không lưu được dữ liệu trên thiết bị: ${key}`, writeError);
      setError('Thiết bị chưa lưu được nội dung. Hãy sao chép lại trước khi rời trang.');
    }
  }, [dirty, key, value]);

  return [value, updateValue, error];
}
