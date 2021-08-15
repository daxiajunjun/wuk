import 'reflect-metadata';

import Wuk, { getWukInstance } from './Wuk';
import { IWukConfig, IServiceConfig } from './interface';

import { WukProvider, WukContext } from './react/context';
import { useService, useEnv } from './react/hooks';

import { injectable } from 'inversify';
import BaseService from './BaseService';

export * from './services';

export {
  IWukConfig,
  IServiceConfig,
  getWukInstance,
  BaseService,
  useService,
  useEnv,
  WukProvider,
  WukContext,
  /**
   * 提供自定义服务的注册功能
   */
  injectable,
};
export default Wuk;
