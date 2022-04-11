import { GetState, SetState } from "zustand";
import { Assets } from "../../types/Assets";
import { processTokenBalance, RawTokenBalance } from "../../types/TokenBalance";
import { WalletStore } from "../walletStore";


export const handleBookUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (balanceData: { [key: string]: RawTokenBalance }) => {
  console.log('BOOK UPDATE:', balanceData)
  const assets: Assets = {}

  for (let account in balanceData) {
    assets[account.replace(/\./g, '')] = Object.values(balanceData[account]).map(processTokenBalance)
  }
  
  set({ assets })
}
