import Wuk from './Wuk';

/**
 * 判断是不是在浏览器中
 */
export const isClient = typeof window !== 'undefined';

/**
 * 获取url上面的参数
 * @param this
 * @returns
 */
export function getQuery(this: Wuk) {
  return (name: string) => {
    if (this.get('isClient')) {
      const mt = (window as any).location.search.match(
        new RegExp(`${name}=([^&]+)`)
      );
      return mt && decodeURIComponent(mt[1]);
    }
  };
}
