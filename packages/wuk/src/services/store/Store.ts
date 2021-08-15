import { injectable } from 'inversify';
import BaseService from '../../BaseService';
import { Class } from '../../interface';
import mobxDecorator from './MobxDecorator';
interface ModelConfig {
  name: string;
  provider?: Class; // 构造函数
  instance?: any; //实例
}

interface StoreOptions {
  models?: ModelConfig[]; // TODO 还要考虑是否有初始化models的必要
  [x: string]: any;
}

/**
 * 使用场景
 * let model = store.get('model')
 * let model = store.get(ModelA)
 *
 * 这两种方法，获取modelA，让modalA具有响应属性
 */

@injectable()
export default class Store extends BaseService {
  private models = new Map<string, ModelConfig>();

  /**
   *
   * @param modalName
   * @param opts
   * @returns
   */
  get<T>(model: string | Class, opts: Record<string, any> = {}): T | null {
    let config!: ModelConfig;
    const isModalName = typeof model === 'string';
    if (isModalName) {
      config = { name: model as string };
    } else {
      config = this._getConfig(model as Class);
    }

    if (!opts.new && this.models.has(config.name)) {
      return this.models.get(config.name)?.instance;
    } else if (isModalName) {
      throw Error(`${model}没有实例化过，请使用${model}的类来获取`);
    } else {
      return this.addModel(config) as T;
    }
  }

  set(modelConfig: ModelConfig) {
    this.addModel(modelConfig);
  }

  /**
   * 添加modal
   */
  addModel(modelConfig: ModelConfig) {
    // 对于名称相同的类，进行名称修改
    for (const config of this.models.values()) {
      if (config.name === modelConfig.name) {
        modelConfig.name = modelConfig.provider!.toString();
        break;
      }
    }
    if (!modelConfig.instance) {
      const instance = new Function('Provider', 'return new Provider();')(
        modelConfig.provider
      );
      /**
       * 获取对象的属性和类方法
       */
      const descriptors = {
        // 获取类方法
        ...this._getDescriptors(modelConfig.provider?.prototype),
        // 获取实例属性
        ...this._getDescriptors(instance),
      };
      const target = mobxDecorator(instance, descriptors);
      if (instance.initialize) {
        instance.initialize.call(target, this.context);
      }
      modelConfig.instance = instance;
      this.models.set(modelConfig.name, modelConfig);
      return instance;
    }
  }

  _getDescriptors(instance: any) {
    if (!instance) {
      return {};
    }
    const propNames = Object.getOwnPropertyNames(instance);
    const descriptorProps: Record<string, PropertyDescriptor> = {};

    propNames.forEach((propName: string) => {
      if (
        propName[0] !== '_' &&
        !['constructor', '$runInAction'].includes(propName)
      ) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          instance,
          propName
        );
        propertyDescriptor && (descriptorProps[propName] = propertyDescriptor);
      }
    });
    return descriptorProps;
  }

  _getConfig(modal: Class): ModelConfig {
    for (const config of this.models.values()) {
      if (config.provider === modal) {
        return config;
      }
    }
    return {
      name: modal.name,
      provider: modal,
    };
  }
}
