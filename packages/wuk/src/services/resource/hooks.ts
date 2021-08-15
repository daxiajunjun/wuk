import useConstant from 'use-constant';
import Resource from '.';
import { Class } from '../../interface';
import { useService } from '../../react/hooks';

export default function useResource<T>(resource: string | Class) {
  const resourceService = useService<Resource>('Resource');

  return useConstant(() => resourceService?.get<T>(resource));
}
