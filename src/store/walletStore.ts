import create from "zustand"
import api from "../api";
import { Assets } from "../types/Assets";
import { processTokenBalance, RawTokenBalance, TokenBalance } from "../types/TokenBalance";

export interface WalletStore {
  init: () => Promise<void>,
  assets: {[key: string] : TokenBalance[]},
}

const useWalletStore = create<WalletStore>((set) => ({
  assets: {},
  init: async () => {
    const data = await api.scry<{[key: string]: { [key: string]: RawTokenBalance }}>({ app: 'wallet', path: '/book' }) || {};
    const assets: Assets = {}

    for (let account in data) {
      assets[account] = Object.values(data[account]).map(processTokenBalance)
    }

    set({ assets })
  },
}));

export default useWalletStore;
