import { injectable } from 'inversify';
import Wuk from './Wuk';
import 'reflect-metadata';

/**
 * 服务的基类，目前给服务注入wuk实例
 */
@injectable()
export default class BaseService {
  context!: Wuk;
  options!: any;

  initialize(context: Wuk, options: any = {}) {
    this.context = context;
    this.options = options;
  }
}
