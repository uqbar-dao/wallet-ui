import { SubscriptionRequestInterface } from "@urbit/http-api";
import create from "zustand"
import api from "../api";
import { Account, processAccount, RawAccount } from "../types/Account";
import { Assets } from "../types/Assets";
import { processTokenBalance, RawTokenBalance, TokenBalance } from "../types/TokenBalance";
import { SendTokenPayload } from "../types/Transaction";
import { handleBookUpdate } from "./subscriptions/wallet";

export function createSubscription(app: string, path: string, e: (data: any) => void): SubscriptionRequestInterface {
  const request = {
    app,
    path,
    event: e,
    err: () => console.warn('SUBSCRIPTION ERROR'),
    quit: () => {
      throw new Error('subscription clogged');
    }
  };
  // TODO: err, quit handling (resubscribe?)
  return request;
}

export interface WalletStore {
  loading: boolean,
  accounts: Account[],
  assets: {[key: string] : TokenBalance[]},
  selectedTown: number,
  init: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  getAccounts: () => Promise<void>,
  createAccount: () => Promise<void>,
  importAccount: (mnemonic: string, password: string) => Promise<void>,
  deleteAccount: (account: Account) => Promise<void>,
  setNode: (town: number, ship: string) => Promise<void>,
  sendTransaction: (payload: SendTokenPayload) => Promise<void>,
}

const useWalletStore = create<WalletStore>((set, get) => ({
  loading: true,
  accounts: [],
  assets: {},
  selectedTown: 0,
  init: async () => {
    // Subscriptions
    api.subscribe(createSubscription('wallet', '/book-updates', handleBookUpdate(get, set)))

    const [balanceData] = await Promise.all([
      api.scry<{[key: string]: { [key: string]: RawTokenBalance }}>({ app: 'wallet', path: '/book' }) || {},
      get().getAccounts()
    ])
    const assets: Assets = {}

    for (let account in balanceData) {
      assets[account.replace(/\./g, '')] = Object.values(balanceData[account]).map(processTokenBalance)
    }

    set({ assets, loading: false })
  },
  setLoading: (loading: boolean) => set({ loading }),
  getAccounts: async () => {
    const accountData = await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {};
    const accounts = Object.values(accountData).map(processAccount)

    set({ accounts, loading: false })
  },
  createAccount: async () => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: { create: true }
    })
    await get().getAccounts()
  },
  importAccount: async (mnemonic: string, password: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        import: { mnemonic, password }
      }
    })
    await get().getAccounts()
  },
  deleteAccount: async (account: Account) => {
    if (window.confirm(`Are you sure you want to delete this account?\n\n${account.address}`)) {
      await api.poke({
        app: 'wallet',
        mark: 'zig-wallet-poke',
        json: { delete: { pubkey: account.rawAddress } }
      })
      await get().getAccounts()
    }
  },
  setNode: async (town: number, ship: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'set-node': { town, ship }
      }
    })
  },
  sendTransaction: async ({ from, to, town, amount, destination, token, gasPrice, budget }: SendTokenPayload) => {
    console.log(2, JSON.stringify({
      send: {
        from,
        to,
        town,
        gas: {
          rate: gasPrice,
          bud: budget,
        },
        args: {
          give: {
            token,
            to: destination,
            known: false,
            amount
          },
        }
      }
    }))

    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        send: {
          from,
          to,
          town,
          gas: {
            rate: gasPrice,
            bud: budget,
          },
          args: {
            give: {
              token,
              to: destination,
              known: false,
              amount
            },
          }
        }
      }
    })
  },
}));

export default useWalletStore;
