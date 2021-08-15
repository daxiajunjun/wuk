import { WukContext } from './context';
import { useContext, useState, useEffect } from 'react';
import useConstant from 'use-constant';

function useWuk() {
  const context = useContext(WukContext);
  return useConstant(() => context.wuk || (window as any).wuk);
}

/**
 * 获取指定服务的实例
 * @param name
 * @returns
 */
function useService<T>(name: string): T | null {
  const wuk = useWuk();
  const service = wuk.get<T>(name);
  if (!service) {
    console.warn(`${service} cannot be find, please check wuk config`);
  }
  return service;
}

/**
 * 能够捕捉到env 的变化, 并且能够反馈到组件中，可以用作全局的小型数据中心，不过不建议如此使用
 * @param name
 * @returns
 */
function useEnv(name: string) {
  const wuk = useWuk();

  const [env, setEnv] = useState(wuk.get(name));

  useEffect(() => {
    const token = wuk.addSubscribe(name, (msg: string, data: any) => {
      console.log(`envs ${name} changed`);
      setEnv(data);
    });
    return () => {
      wuk.unsubscribe(token);
    };
  }, []);

  if (!env) {
    console.warn(`env ${env} cannot be find, please check wuk config`);
  }
  return [env, wuk.setEnv];
}

function useSubscribe(name: string, func: (value: any) => void) {
  const wuk = useWuk();
  wuk.addSubscribe(name, func);
}

function usePublish(name: string, value: any) {
  const wuk = useWuk();
  wuk.publish(name, value);
}

export { useWuk, useService, useEnv, useSubscribe, usePublish };
