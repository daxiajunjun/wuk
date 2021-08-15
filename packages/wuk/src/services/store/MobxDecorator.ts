import { forEach } from 'lodash';
import {
  action,
  computed,
  configure,
  flow,
  observable,
  runInAction,
  makeObservable,
} from 'mobx';
import BaseModel from './BaseModel';

import { isGenerator } from './isGenerator';

// state变化只能在action中
configure({ enforceActions: 'observed' });

const $state = Symbol('mobx model state');
export default function mobxDecorator(
  inst: any,
  descriptorProps: Record<string, PropertyDescriptor>
) {
  if (inst[$state]) {
    return inst;
  } else {
    const decorates: any = {};
    const valueProps: string[] = [];
    forEach(descriptorProps, (prop: PropertyDescriptor, propName: string) => {
      // const method = typeof prop.value !== 'undefined' ? prop.value : prop.initializer;
      const value = prop.value;
      switch (true) {
        case typeof value !== 'undefined':
          if (typeof value === 'function') {
            if (isGenerator(value)) {
              decorates[propName] = () => {
                return {
                  value: flow(value),
                  enumerable: false,
                  configurable: true,
                  writable: true,
                };
              };
            } else {
              decorates[propName] = action;
            }
          } else {
            valueProps.push(propName);
            if (prop.value && prop.value[$state]) {
              decorates[propName] = () => prop;
            } else {
              decorates[propName] = observable;
            }
          }
          break;
        case !!prop.get:
          valueProps.push(propName);
          decorates[propName] = computed;
          break;
        case !!prop.set:
          decorates[propName] = () => prop;
          break;
        default:
          valueProps.push(propName);
          decorates[propName] = observable;
          break;
      }
    });
    const target = makeObservable(inst, decorates, descriptorProps);

    target.$runInAction = function _runInAction(
      this: BaseModel,
      cb: () => void
    ) {
      runInAction(cb);
    };
    return target;
  }
}
