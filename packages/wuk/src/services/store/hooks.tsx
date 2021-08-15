import Store from '.';
import { Class } from '../../interface';
import useConstant from 'use-constant';
import { useService } from '../../react/hooks';

export function useModel<T>(model: string | Class): T | null {
  const store = useService<Store>('Store');
  if (!store) {
    throw new Error('connot find store, place add store service');
  }
  const modelInstance = useConstant(() => store.get<T>(model));
  return modelInstance;
}
