import Wuk from '../src';
import Http from '../src/services/http';
import Resource from '../src/services/resource';
import Store from '../src/services/store';
import BaseModel from '../src/services/store/BaseModel';

class Model extends BaseModel {
  age: any;
  test = () => {
    console.log(this.age);
  };
  setAge(value: number) {
    this.setState({
      age: value,
    });
  }
}

class Model1 extends Model {
  name = 123;
  setName(name: number) {
    this.setState({ name: name });
    this.setAge(23);
  }
}

class Dto {
  getRequest() {
    console.log(2);
  }
}

const wuk = new Wuk({
  services: {
    store: {
      provider: Store,
    },
    http: {
      provider: Http,
    },
    resource: {
      provider: Resource,
      options: {
        resources: {
          dto: Dto,
        },
      },
    },
  },
});

describe('test store service', () => {
  let store: any;
  let model: any;
  beforeAll(() => {
    store = wuk.get('store');
    model = store.get(Model1);
  });
  it('get store service', () => {
    expect(store).toBeInstanceOf(Store);
  });
  it('get store model', () => {
    expect(model).toBeInstanceOf(Model1);
  });
  it('get model property', () => {
    expect(model.name).toEqual(123);
  });
  it('test model function', () => {
    model.setName(222);
    expect(model.name).toEqual(222);
  });
});

describe('test http service', () => {
  let http: Http;
  beforeAll(() => {
    http = wuk.get('http') as Http;
  });
  it('get http service', () => {
    expect(http).toBeInstanceOf(Http);
  });

  it('test http has request method', () => {
    expect(http.request).toBeInstanceOf(Function);
  });
});

describe('test resource service', () => {
  let resource: any;
  beforeAll(() => {
    resource = wuk.get('resource');
  });
  it('get resource service', () => {
    expect(resource).toBeInstanceOf(Resource);
  });

  it('get resource from resource service', () => {
    const res = resource.get('dto');
    expect(res).toBeInstanceOf(Dto);
    expect(res.getRequest).toBeInstanceOf(Function);
  });
});
