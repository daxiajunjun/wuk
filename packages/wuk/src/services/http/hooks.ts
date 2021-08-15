import { useEffect, useState } from 'react';
import Http, { IRequestConfig } from '.';
import { useService } from '../../react/hooks';

/**
 * @param config 请求配置
 * @returns 请求的数据，和请求的状态
 */
export function useGet(config: IRequestConfig) {
  const httpService = useService<Http>('http');
  const [res, setRes] = useState<{
    data: any;
    loading: boolean;
  }>({
    data: null,
    loading: false,
  });

  useEffect(() => {
    httpService?.request(config).then((res) => {
      setRes({ data: res, loading: true });
    });
  });

  return res;
}

export function usePost(config: IRequestConfig) {
  const httpService = useService<Http>('http');
  const [res, setRes] = useState<{
    data: any;
    loading: boolean;
  }>({
    data: null,
    loading: false,
  });

  useEffect(() => {
    config.method = 'post';
    httpService?.request(config).then((res) => {
      setRes({ data: res, loading: true });
    });
  }, []);

  return res;
}
