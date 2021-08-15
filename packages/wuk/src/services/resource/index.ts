import { Container, injectable, METADATA_KEY } from 'inversify';
import BaseService from '../../BaseService';
import { Class } from '../../interface';
import Wuk from '../../Wuk';

interface ResourceConfig {
  name?: string;
  provider: Class; // 构造函数
  instance?: any; //实例
}

@injectable()
export default class Resource extends BaseService {
  _container: Container;
  resourcesMap = new Map<string, ResourceConfig>();

  constructor() {
    super();
    this._container = new Container();
  }

  initialize(wuk: Wuk, options: any) {
    super.initialize(wuk, options);
    this.initResources(options.resources);
  }

  initResources(resources: Record<string, Class> = {}) {
    Object.entries(resources).map(([key, value]: [string, Class]) => {
      if (this.resourcesMap.has(key)) {
        throw `has same ${key} resource, place rename`;
      }
      this._container.bind(key).to(value).inSingletonScope();
      this.resourcesMap.set(key, {
        name: key,
        provider: value,
      });
    });
  }

  get<T>(resource: string | Class): T | null {
    const name = (resource as Class).name ?? resource;
    const target = this.resourcesMap.get(name);
    if (target) {
      if (target.instance) {
        return target.instance as T;
      } else {
        return this.set(target);
      }
    } else if (typeof resource !== 'string') {
      return this.set({ name: resource.name, provider: resource }) as T;
    }
    return null;
  }

  set(resource: ResourceConfig) {
    const name = resource.name as string;
    if (!Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, resource.provider)) {
      injectable()(resource.provider);
    }
    let res = this._container.get(name) as any;
    if (!res) {
      this._container.bind(name).to(resource.provider).inSingletonScope();
    }

    res = this._container.get(name);

    if (res.initialize) {
      res.initialize.call(this, this.context);
    }
    this.resourcesMap.set(name, {
      name: name,
      provider: resource.provider,
      instance: res,
    });
    return res;
  }
}

export * from './hooks';
