import { SubscriptionRequestInterface } from "@urbit/http-api"
import create from "zustand"
import api from "../api"
import { Account, processAccount, RawAccount, ImportedAccount, ImportedWalletType, Seed } from "../types/Accounts"
import { Token } from "../types/Token"
import { SendNftPayload, SendRawTransactionPayload, SendTokenPayload, SendTransactionPayload } from "../types/SendTransaction"
import { handleBookUpdate, handleTxnUpdate } from "./subscriptions/wallet"
import { RawTransactions, Transaction } from "../types/Transaction"
import { TokenMetadataStore } from "../types/TokenMetadata"
import ls from '../utils/local-storage'
import { getLedgerAddress } from "../utils/ledger"

export function createSubscription(app: string, path: string, e: (data: any) => void): SubscriptionRequestInterface {
  const request = {
    app,
    path,
    event: e,
    err: () => console.warn('SUBSCRIPTION ERROR'),
    quit: () => {
      throw new Error('subscription clogged')
    }
  }
  // TODO: err, quit handling (resubscribe?)
  return request
}

export interface WalletStore {
  loading: boolean,
  accounts: Account[],
  importedAccounts: ImportedAccount[],
  metadata: TokenMetadataStore,
  assets: {[key: string] : Token[]},
  selectedTown: number,
  transactions: Transaction[],
  init: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  getAccounts: () => Promise<void>,
  getMetadata: () => Promise<void>,
  getTransactions: () => Promise<void>,
  createAccount: () => Promise<void>,
  restoreAccount: (mnemonic: string, password: string) => Promise<void>,
  importAccount: (type: ImportedWalletType) => Promise<void>,
  deleteAccount: (account: Account) => Promise<void>,
  removeAccount: (account: ImportedAccount) => Promise<void>,
  getSeed: () => Promise<Seed>,
  setNode: (town: number, ship: string) => Promise<void>,
  sendTokens: (payload: SendTokenPayload) => Promise<void>,
  sendNft: (payload: SendNftPayload) => Promise<void>,
  sendRawTransaction: (payload: SendRawTransactionPayload) => Promise<void>,
}

const useWalletStore = create<WalletStore>((set, get) => ({
  loading: true,
  accounts: [],
  importedAccounts: [],
  metadata: {},
  assets: {},
  selectedTown: 0,
  transactions: [],
  init: async () => {
    // Subscriptions, includes getting assets
    api.subscribe(createSubscription('wallet', '/book-updates', handleBookUpdate(get, set)))
    api.subscribe(createSubscription('wallet', '/tx-updates', handleTxnUpdate(get, set)))

    await Promise.all([
      get().getAccounts(),
      get().getMetadata(),
    ])

    const importedAccounts = ls.get<ImportedAccount[]>('importedAccounts') || []

    set({ importedAccounts, loading: false })
  },
  setLoading: (loading: boolean) => set({ loading }),
  getAccounts: async () => {
    const accountData = await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {}
    const accounts = Object.values(accountData).map(processAccount)

    set({ accounts, loading: false })
  },
  getMetadata: async () => {
    const metadata = await api.scry<any>({ app: 'wallet', path: '/token-metadata' })
    set({ metadata })
  },
  getTransactions: async () => {
    const { accounts } = get()
    if (accounts.length) {
      const rawTransactions = await api.scry<RawTransactions>({ app: 'wallet', path: `/transactions/${accounts[0].rawAddress}` })
      const transactions = Object.keys(rawTransactions).map(hash => ({ ...rawTransactions[hash], hash }))
      set({ transactions })
    }
  },
  createAccount: async () => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: { create: true }
    })
    await get().getAccounts()
  },
  restoreAccount: async (mnemonic: string, password: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        import: { mnemonic, password }
      }
    })
    await get().getAccounts()
  },
  importAccount: async (type: ImportedWalletType) => {
    // only Ledger for now
    const importedAddress = await getLedgerAddress()

    if (importedAddress) {
      // TODO: get nonce info
      const { importedAccounts } = get()

      if (!importedAccounts.find(({ address }) => importedAddress === address)) {
        const newImportedAccounts = importedAccounts.concat([{ address: importedAddress.toLowerCase(), nonces: {}, type }])
        ls.set('importedAccounts', newImportedAccounts)
        set({ importedAccounts: newImportedAccounts })
      } else {
        alert('You have already imported this account.')
      }
    }
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
  removeAccount: async (account: ImportedAccount) => {
    if (window.confirm(`Are you sure you want to remove this imported account?\n\n${account.address}`)) {
      const newImportedAccounts = get().importedAccounts.filter(({ address }) => address !== account.address)
      ls.set('importedAccounts', newImportedAccounts)
      set({ importedAccounts: newImportedAccounts })
    }
  },
  getSeed: async () => {
    const seedData = await api.scry<Seed>({ app: 'wallet', path: '/seed' })
    return seedData
  },
  setNode: async (town: number, ship: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'set-node': { town, ship }
      }
    })
    set({ selectedTown: town })
  },
  sendTokens: async ({ from, to, town, amount, destination, token, gasPrice, budget }: SendTokenPayload) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        submit: {
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
              amount
            },
          }
        }
      }
    })

    get().getTransactions()
  },
  sendNft: async ({ from, to, town, destination, nftIndex, gasPrice, budget }: SendNftPayload) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        submit: {
          from,
          to,
          town,
          gas: {
            rate: gasPrice,
            bud: budget,
          },
          args: {
            'give-nft': {
              'item-id': nftIndex,
              to: destination,
            },
          }
        }
      }
    })

    get().getTransactions()
  },
  sendRawTransaction: async ({ from, to, town, data, riceInputs, gasPrice, budget }: SendRawTransactionPayload) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        submit: {
          from,
          to,
          town,
          gas: {
            rate: gasPrice,
            bud: budget,
          },
          args: {
            data,
            riceInputs
          }
        }
      }
    })

    get().getTransactions()
  },
}))

export default useWalletStore
