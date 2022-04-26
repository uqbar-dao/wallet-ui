import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/nav/Navbar';
import useWalletStore from './store/walletStore';
import { BASENAME } from './utils/constants';
import AccountsView from './views/AccountsView';
import AccountView from './views/AccountView';
import PortfolioView from './views/PortfolioView';
import SendView from './views/SendView';
import TransactionsView from './views/TransactionsView';
import TransactionView from './views/TransactionView';

function App() {
  const { init } = useWalletStore()

  useEffect(() => {
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter basename={BASENAME}>
      <Navbar />
      <Routes>
        <Route path="/" element={<PortfolioView />} />
        <Route path="accounts/:account" element={<AccountView />} />
        <Route path="accounts" element={<AccountsView />} />
        <Route path="send/:riceId/:nftIndex" element={<SendView />} />
        <Route path="send/:riceId" element={<SendView />} />
        <Route path="send" element={<SendView />} />
        <Route path="transactions/:hash" element={<TransactionView />} />
        <Route path="transactions" element={<TransactionsView />} />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
