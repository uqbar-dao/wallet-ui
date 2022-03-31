import create from "zustand"
import api from "../api";
import { Account, processAccount, RawAccount } from "../types/Account";
import { Assets } from "../types/Assets";
import { processTokenBalance, RawTokenBalance, TokenBalance } from "../types/TokenBalance";

export interface WalletStore {
  accounts: Account[],
  assets: {[key: string] : TokenBalance[]},
  init: () => Promise<void>,
  getAccounts: () => Promise<void>,
  createAccount: () => Promise<void>,
  importAccount: (seed: string) => Promise<void>,
  deleteAccount: (pubKey: string) => Promise<void>,
  sendTransaction: () => Promise<void>,
}

const useWalletStore = create<WalletStore>((set, get) => ({
  accounts: [],
  assets: {},
  init: async () => {
    const [balanceData, accountData] = await Promise.all([
      api.scry<{[key: string]: { [key: string]: RawTokenBalance }}>({ app: 'wallet', path: '/book' }) || {},
      api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {}
    ])
    const assets: Assets = {}

    for (let account in balanceData) {
      assets[account.replace(/\./g, '')] = Object.values(balanceData[account]).map(processTokenBalance)
    }

    const accounts = Object.values(accountData).map(processAccount)

    set({ assets, accounts })
  },
  getAccounts: async () => {
    const accountData = await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {};
    const accounts = Object.values(accountData).map(processAccount)
    console.log(3, accounts)

    set({ accounts })
  },
  createAccount: async () => {
    console.log(1)
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: { create: {} }
    })
    console.log(2)
  },
  importAccount: async (seed: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: { import: { seed } }
    })
  },
  deleteAccount: async (address: string) => {
    if (window.confirm(`Are you sure you want to delete this account?\n\n${address}`)) {
      await api.poke({
        app: 'wallet',
        mark: 'zig-wallet-poke',
        json: { delete: { address } }
      })
    }
  },
  sendTransaction: async () => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        send: {
          from: 'id:smart',  //  account in your wallet to send from
          to: 'id:smart',
          sequencer: '(unit ship)',  //  optional custom node choice
          town: '@ud',
          gas: '[rate=@ud bud=@ud]',
          args: '(unit *)',
          'my-grains': '(set @ux)',
          'cont-grains': '(set @ux)',
        }
      }
    })
  },
}));

export default useWalletStore;
