import { forEach } from 'lodash';

const noop = (cb: () => any) => cb();

export default class BaseModel {
  $runInAction = noop;

  setState(state: any) {
    this.$runInAction(() => {
      forEach(state, (value: any, key: string) => {
        this[key as keyof this] = value;
      });
    });
  }

  setAge(value: any) {
    console.log(value);
  }
}
