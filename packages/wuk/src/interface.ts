export type Func = (...args: any) => any;
export type Class = { new (...args: any[]): any };

export type IEnv = Record<string, number | string | Func | any>;

export interface IServiceConfig {
  provider: Class | Func;
  options?: Record<string, any>; // 增强服务的功能，如果和服务的属性或者方法同名时，则代理员服务中同名方法
  instance?: any; // 实例化后的方法
  args?: Record<string, any>; // 执行 initialize时传入的参数
}

export type IService = Record<string, IServiceConfig>;

export interface IWukConfig {
  envs?: IEnv;
  services?: IService;
}
