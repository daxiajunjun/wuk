import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import { injectable } from 'inversify';
import BaseService from '../../BaseService';
import Wuk from '../../Wuk';

export interface IRequestConfig extends AxiosRequestConfig {
  /**
   * 请求url
   */
  url: string;
  /**
   * 发送请求的数据
   */
  params?: Record<string, any>;
  /**
   * 请求方法， 默认为 get
   */
  method?: Method;
  errorHandle: (error: any) => void;
  transformResponse: (response: AxiosResponse) => void;
}

@injectable()
export default class Http extends BaseService {
  baseUrl!: string;
  axiosInstance: AxiosInstance;
  defaultConfig: {
    timeout: 1000;
  };

  constructor() {
    super();
    // return new Proxy(this, {
    //   get(target: Http, prop) {
    //     if (Reflect.has(target, prop)) {
    //       return Reflect.get(target, prop);
    //     } else {
    //       return Reflect.get(target, 'axiosInstance')[prop];
    //     }
    //   },
    // });
  }

  initialize(wuk: Wuk, options: any = {}) {
    super.initialize(wuk, options);
    axios.defaults = Object.assign(
      {},
      axios.defaults,
      this.defaultConfig,
      options
    );
    this.axiosInstance = axios.create();
    if (options.reqInterceptors && Array.isArray(options.reqInterceptors)) {
      options.reqInterceptors.map(
        (interceptor: (config: AxiosRequestConfig) => AxiosRequestConfig) => {
          this.axiosInstance.interceptors.request.use(interceptor);
        }
      );
    }
    if (options.resInterceptors && Array.isArray(options.resInterceptors)) {
      options.resInterceptors.map(
        (interceptor: (response: AxiosResponse) => AxiosResponse) => {
          this.axiosInstance.interceptors.response.use(interceptor);
        }
      );
    }
  }

  request(config: IRequestConfig): Promise<any> {
    config.method = config.method ?? 'get';
    if (config.method === 'POST' || config.method === 'post') {
      config.data = config.params;
    }
    return this.axiosInstance
      .request(config)
      .then((response) => {
        if (config.transformResponse) {
          return config.transformResponse(response);
        }
        return response.data;
      })
      .catch((error) => {
        if (error.response) {
          console.error(error.response.status, error.response.url);
        } else if (error.request) {
          console.error(error.request);
        } else {
          console.error('Error', error.message);
        }
        if (config.errorHandle) {
          return config.errorHandle(error);
        }
      });
  }

  uploadFile(config: any) {
    return this.axiosInstance.post(config.url, config.data, {
      headers: {
        'Content-Type': 'multipart/form-data;charset=UTF-8',
      },
      onUploadProgress(progressEvent) {
        const complete =
          (((progressEvent.loaded / progressEvent.total) * 100) | 0) + '%';
        config.onUploadProgress(complete, progressEvent);
      },
      onDownloadProgress(progressEvent) {
        config.onDownloadProgress('100%', progressEvent);
      },
    });
  }
}

export * from './hooks';
