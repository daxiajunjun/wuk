import React, { createContext } from 'react';
import Wuk from '../Wuk';

const WukContext = createContext<{ wuk: Wuk }>({ wuk: new Wuk({}) });

interface IProvider {
  wuk: Wuk;
  children: React.ReactDOM;
}

function WukProvider({ wuk, children }: IProvider) {
  if (!wuk) {
    console.warn('wuk instance cannot be null');
  }
  return (
    <WukContext.Provider value={{ wuk: wuk }}>{children}</WukContext.Provider>
  );
}

const WukConsumer = WukContext.Consumer;

export { WukContext, WukProvider, WukConsumer };
