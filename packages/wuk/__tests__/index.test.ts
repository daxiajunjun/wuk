import { inject, injectable } from 'inversify';
import BaseService from '../src/BaseService';
import Wuk from '../src/index';

@injectable()
class MacPro extends BaseService {
  name = 'MacPro';
  getName() {
    return this.name;
  }
}

@injectable()
class Pro extends BaseService {
  name = 'MacPro';

  getName() {
    return this.name;
  }
}

@injectable()
class Pro3 extends BaseService {
  name = 'MacPro';
  macPro: MacPro;
  constructor(@inject('macPro') macPro: MacPro) {
    super();
    this.macPro = macPro;
  }

  getName() {
    return this.macPro.name;
  }
}

const wuk = new Wuk({
  services: {
    macPro: {
      provider: MacPro,
      options: {
        getRealName: function () {
          return this.name + 'real';
        },
      },
    },
    pro: {
      provider: Pro,
      options: {
        getName: function () {
          return this.name + 'real';
        },
      },
    },
    pro2: {
      provider: Pro3,
    },
  },
});

describe('getDefuatEnv', () => {
  it('get isClient', async () => {
    const isClient = wuk.get('isClient');
    expect(isClient).toEqual(false);
  });
});

describe('set wuk service config', () => {
  let macPro: any;
  beforeAll(() => {
    macPro = wuk.get<MacPro>('macPro');
  });
  it('get service', async () => {
    expect(macPro).toBeInstanceOf(MacPro);
  });
  it('invoke service function', () => {
    expect(macPro?.getName()).toEqual('MacPro');
  });
  it('invoke append function', () => {
    expect(macPro.getRealName()).toEqual('MacProreal');
  });
});

describe('set wuk service config', () => {
  let pro: any;
  beforeAll(() => {
    pro = wuk.get('pro');
  });
  it('get service', async () => {
    expect(pro.getName()).toEqual('MacProreal');
  });
});

describe('test inject', () => {
  let pro: any;
  beforeAll(() => {
    pro = wuk.get('pro2');
  });
  it('get service', async () => {
    expect(pro.getName()).toEqual('MacPro');
  });
});
