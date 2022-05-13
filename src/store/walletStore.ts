import { SubscriptionRequestInterface } from "@urbit/http-api"
import create from "zustand"
import api from "../api"
import { HotWallet, processAccount, RawAccount, HardwareWallet, HardwareWalletType, Seed } from "../types/Accounts"
import { Token } from "../types/Token"
import { SendNftPayload, SendRawTransactionPayload, SendTokenPayload, SendTransactionPayload } from "../types/SendTransaction"
import { handleBookUpdate, handleTxnUpdate } from "./subscriptions/wallet"
import { RawTransactions, Transaction } from "../types/Transaction"
import { TokenMetadataStore } from "../types/TokenMetadata"
import { removeDots } from "../utils/format"
import { deriveLedgerAddress, getLedgerAddress } from "../utils/ledger"
import { addHexDots } from "../utils/number"
// import { getLedgerAddress } from "../utils/ledger"

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
  loadingText: string | null,
  accounts: HotWallet[],
  importedAccounts: HardwareWallet[],
  metadata: TokenMetadataStore,
  assets: {[key: string] : Token[]},
  selectedTown: number,
  transactions: Transaction[],
  init: () => Promise<void>,
  setLoading: (loadingText: string | null) => void,
  getAccounts: () => Promise<void>,
  getMetadata: () => Promise<void>,
  getTransactions: () => Promise<void>,
  createAccount: () => Promise<void>,
  deriveNewAddress: (hdpath: string, nick: string, type?: HardwareWalletType) => Promise<void>,
  trackAddress: (address: string, nick: string) => Promise<void>,
  editNickname: (address: string, nick: string) => Promise<void>,
  restoreAccount: (mnemonic: string, password: string) => Promise<void>,
  importAccount: (type: HardwareWalletType, nick: string) => Promise<void>,
  deleteAccount: (address: string) => Promise<void>,
  getSeed: () => Promise<Seed>,
  setNode: (town: number, ship: string) => Promise<void>,
  setIndexer: (ship: string) => Promise<void>,
  sendTokens: (payload: SendTokenPayload) => Promise<void>,
  sendNft: (payload: SendNftPayload) => Promise<void>,
  sendRawTransaction: (payload: SendRawTransactionPayload) => Promise<void>,
  addAsset: (assetContract: string) => Promise<void>,
  getPendingHash: () => Promise<{ hash: string; egg: any; }>
  submitSignedHash: (hash: string, ethHash: string, sig: { v: number; r: number; s: number; }) => Promise<void>
}

const useWalletStore = create<WalletStore>((set, get) => ({
  loadingText: 'Loading...',
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

    get().getTransactions()

    set({ loadingText: null })
  },
  setLoading: (loadingText: string | null) => set({ loadingText }),
  getAccounts: async () => {
    const accountData = await api.scry<{[key: string]: RawAccount}>({ app: 'wallet', path: '/accounts' }) || {}
    const allAccounts = Object.values(accountData).map(processAccount).sort((a, b) => a.nick.localeCompare(b.nick))

    const { accounts, importedAccounts } = allAccounts.reduce(({ accounts, importedAccounts }, cur) => {
      if (cur.imported) {
        const [nick, type] = cur.nick.split('//')
        importedAccounts.push({ ...cur, type: type as HardwareWalletType, nick })
      } else {
        accounts.push(cur)
      }
      return { accounts, importedAccounts }
    }, { accounts: [] as HotWallet[], importedAccounts: [] as HardwareWallet[] })

    set({ accounts, importedAccounts, loadingText: null })
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
      console.log('TRANSACTIONS:', transactions)
      set({ transactions })
    }
  },
  createAccount: async () => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: { 'generate-hot-wallet': true }
    })
    get().getAccounts()
  },
  deriveNewAddress: async (hdpath: string, nick: string, type?: HardwareWalletType) => {
    set({ loadingText: 'Deriving address, this could take up to 60 seconds...' })
    if (type) {
      let deriveAddress: ((path: string) => Promise<string>) | undefined
      if (type === 'ledger') {
        deriveAddress = deriveLedgerAddress
      }

      if (deriveAddress !== undefined) {
        const importedAddress = await deriveAddress(hdpath)
        if (importedAddress) {
          const { importedAccounts } = get()
          if (!importedAccounts.find(({ address }) => importedAddress === address)) {
            await api.poke({
              app: 'wallet',
              mark: 'zig-wallet-poke',
              json: {
                'add-tracked-address': { address: addHexDots(importedAddress), nick: `${nick}//${type}` }
              }
            })
          } else {
            alert('You have already imported this address.')
          }
        }
      }
    } else {
      await api.poke({
        app: 'wallet',
        mark: 'zig-wallet-poke',
        json: {
          'derive-new-address': { hdpath, nick }
        }
      })
    }
    get().getAccounts()
    set({ loadingText: null })
  },
  trackAddress: async (address: string, nick: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'add-tracked-address': { address, nick }
      }
    })
    get().getAccounts()
  },
  editNickname: async (address: string, nick: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'edit-nickname': { address, nick }
      }
    })
    get().getAccounts()
  },
  restoreAccount: async (mnemonic: string, password: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'import-seed': { mnemonic, password }
      }
    })
    get().getAccounts()
  },
  importAccount: async (type: HardwareWalletType, nick: string) => {
    // only Ledger for now
    set({ loadingText: 'Importing...' })
    const importedAddress = await getLedgerAddress()

    if (importedAddress) {
      // TODO: get nonce info
      const { importedAccounts } = get()

      if (!importedAccounts.find(({ address }) => importedAddress === address)) {
        await api.poke({
          app: 'wallet',
          mark: 'zig-wallet-poke',
          json: {
            'add-tracked-address': { address: addHexDots(importedAddress), nick: `${nick}//${type}` }
          }
        })
        get().getAccounts()
      } else {
        set({ loadingText: null })
        alert('You have already imported this address.')
      }
    }
    set({ loadingText: null })
  },
  deleteAccount: async (address: string) => {
    if (window.confirm(`Are you sure you want to remove this address?\n\n${removeDots(address)}`)) {
      await api.poke({
        app: 'wallet',
        mark: 'zig-wallet-poke',
        json: { 'delete-address': { address } }
      })
      get().getAccounts()
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
  setIndexer: async (ship: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'set-indexer': { ship }
      }
    })
  },
  sendTokens: async ({ from, to, town, amount, destination, salt, gasPrice, budget }: SendTokenPayload) => {
    console.log({
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
            salt,
            to: destination,
            amount
          },
        }
      }
    })
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
              salt,
              to: destination,
              amount
            },
          }
        }
      }
    })
  },
  sendNft: async ({ from, to, town, destination, salt, nftIndex, gasPrice, budget }: SendNftPayload) => {
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
              salt,
              'item-id': nftIndex,
              to: destination,
            },
          }
        }
      }
    })
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
  },
  addAsset: async (assetContract: string) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'add-asset': { asset: assetContract }
      }
    })
  },
  getPendingHash: async () => {
    const { hash, egg } = await api.scry<{ hash: string; egg: any }>({ app: 'wallet', path: '/pending' }) || {}
    console.log('PENDING:', hash, egg)
    return { hash, egg }
  },
  submitSignedHash: async (hash: string, ethHash: string, sig: { v: number; r: number; s: number; }) => {
    await api.poke({
      app: 'wallet',
      mark: 'zig-wallet-poke',
      json: {
        'submit-signed': { hash, ethHash, sig }
      }
    })
  },
}))

export default useWalletStore
