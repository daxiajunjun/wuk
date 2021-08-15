import {
  Class,
  Func,
  IEnv,
  IService,
  IServiceConfig,
  IWukConfig,
} from './interface';
import { isFunction, forEach, isEmpty } from 'lodash';
import { Container } from 'inversify';
import { isClient, getQuery } from './defaultEnv';
import BaseService from './BaseService';
import PubSub from 'pubsub-js';

/**
 * 提供业务层统一的服务管理功能
 * new Wuk({
 *  env 设置好之后，不让在动态设置了
 *  envs: {
 *    name: '234',
 *    age: () => '23'
 *  },
 *  services: {
 *    store: {
 *      provider: xxx,
 *      config: xxx
 *      methods: {}
 *    }
 *    http: {}
 *  }
 * })
 * const wuk = new Wuk({});
 *
 */
class Wuk {
  defaultEnvs = { isClient, getQuery };
  envs: IEnv = {};
  services: IService;
  container: Container;
  subscribe: typeof PubSub;

  constructor(config: IWukConfig = { envs: {} }) {
    if (isEmpty(config.envs) && isEmpty(config.services)) {
      console.warn('place set valid envs or services');
    }
    this.services = {};
    const { envs, services = {} } = config;

    this.container = new Container();
    this.subscribe = PubSub;

    if (!isEmpty(services)) {
      // 初始化服务
      this.initializeService(services);
    }

    // 对一些变量进行处理
    this.envs = Object.assign({}, this.defaultEnvs, envs);
    forEach(this.envs, (value, key) => {
      if (isFunction(value)) {
        this.envs[key] = value.call(this);
      }
    });

    // 把变量挂载到全局
    if (this.get('isClient')) {
      (window as any)['wuk'] = this;
    }
  }

  /**
   * 绑定服务实例
   * @param services
   */
  initializeService(services: IService) {
    forEach(services, (value: IServiceConfig, key: string) => {
      const bindKey = key;
      if (!this.container.isBound(bindKey)) {
        if (value.provider.prototype instanceof BaseService) {
          this.container
            .bind(bindKey)
            .to(value.provider as Class)
            .inSingletonScope();
        } else if (typeof value.provider === 'function') {
          this.container
            .bind(bindKey)
            .toDynamicValue((value.provider as Func).bind(this))
            .inSingletonScope();
        } else {
          this.container.bind(bindKey).toConstantValue(value);
        }
        this.services[key] = value;
      } else {
        throw new Error(`${key} already set`);
      }
    });
  }

  /**
   * 先获取env中的变量，在获取service, 所以，env和service, 最好不同名
   * @param name
   */
  get<T>(name: string): T | null {
    if (this.envs[name] !== undefined) {
      return this.envs[name];
    } else if (this.services[name]) {
      return this.getService<T>(name);
    }
    console.warn(
      `cannot find ${name} in wuk instance, please check wuk config`
    );
    return null;
  }

  /**
   * 获取service的值
   * @param name
   * @returns
   */
  getService<T>(name: string): T {
    return this.getServiceValue<T>(name);
  }

  getServiceValue<T>(name: string): T {
    if (this.services[name].instance) {
      return this.services[name].instance;
    }
    const { options = {} } = this.services[name];
    let instance = this.container.get(name) as any;
    if (instance.initialize) {
      instance.initialize.call(instance, this, options);
    }
    // 通过 options 做属性代理，有利也有弊，需要小心options里面的变量是否是真的需要通过属性代理来操作
    instance = new Proxy(instance, {
      get(...args) {
        const [target, prop] = args;
        // 有代理属性的执行代理属性；
        const value = options[prop as string];
        if (value) {
          if (isFunction(value)) {
            return function (...args: any) {
              return value.apply(target, args);
            };
          }
          return value;
        } else {
          return Reflect.get(...args);
        }
      },
    });
    this.services[name].instance = instance as T;
    return instance as T;
  }

  /**
   * 只推荐修改env 中的变量
   * @param name
   * @param value
   */
  setEnv(name: string, value: any) {
    let newVal = value;
    if (isFunction(value)) {
      newVal = value.call(this);
    }
    this.envs[name] = newVal;
    if (!isFunction(newVal)) {
      this.publish(name, value);
    }
  }

  /**
   * 添加时间订阅
   * @param name
   * @param func
   * @returns
   */
  addSubscribe(name: string, func: (...arg: any) => void) {
    return this.subscribe.subscribe(Symbol.for(name), func);
  }

  /**
   * 发布时间订阅
   * @param name
   * @param value
   */
  publish(name: string, value: any) {
    this.subscribe.publish(Symbol.for(name), value);
  }

  /**
   * 取消对环境变量的订阅
   * @param token
   */
  unsubscribe(token: string) {
    this.subscribe.unsubscribe(token);
  }
}

export default Wuk;

export function getWukInstance() {
  if (isClient) {
    return (window as any).wuk;
  }
  return null;
}
