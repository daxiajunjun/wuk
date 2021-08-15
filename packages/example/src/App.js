import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import Store, {Model} from 'store';
import {observer} from 'mobx-react-lite'

class TestStore extends Model {
  number = 0;
  list = [
    {
      name: 23
    }, {
      name: 32
    }
  ]
  realName = '';

  add() {
    this.setState({
      number: this.number + 1
    })
  }

  changeList() {
    this.setState({
      list: [
        ...this.list, {
          name: '234'
        }
      ]
    })
  }
  change() {
    let list = this.list;
    list[1].name = 'bbb'
    this.setState({list: list})
  }

  async getName() {
    const name = await Promise.resolve('ww');
    this.setState({realName: name})
  }
}
const store = new Store();

function App() {
  const [testStore,
    setStore] = useState(null);
  useEffect(() => {
    store
      .get(TestStore)
      .then(setStore)
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          <button onClick={() => testStore.add()}>add</button>
        </p>
        <p>
          {testStore
            ?.number}
        </p>
        <button onClick={() => testStore.changeList()}>add</button>
        <button onClick={() => testStore.change()}>change</button>
        {testStore
          .list
          .map(item => <div>{item.name}</div>)}

        <button onClick={() => testStore.getName()}>getName</button>
        {testStore.realName}
      </header>
    </div>
  );
}

export default observer(App);
