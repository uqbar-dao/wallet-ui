import { GetState, SetState } from "zustand";
import { Assets } from "../../types/Assets";
import { processNft, processToken, RawToken } from "../../types/Token";
import { Transaction } from "../../types/Transaction";
import { removeDots } from "../../utils/format";
import { WalletStore } from "../walletStore";

export const handleBookUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (balanceData: { [key: string]: RawToken }) => {
  const assets: Assets = {}

  for (let account in balanceData) {
    assets[removeDots(account)] = Object.values(balanceData[account])
      .reduce((acc, cur) => cur.data.balance ? acc.concat([processToken(cur)]) : acc, [])

    const nftData = Object.values(balanceData[account]).find(tokenData => tokenData.data.items)
    if (nftData?.data?.items) {
      Object.keys(nftData.data.items)
        .forEach((index) => {
          const nft = processNft(nftData, index, nftData?.data?.items![index])
          assets[removeDots(account)].push(nft)
        })
    }
  }
  
  set({ assets })
}

export const handleTxnUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => async (txn: Transaction) => {
  console.log('TXN UPDATE:', JSON.stringify(txn))
  const { transactions } = get()
  // {"status":"submitted","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}
  // {"status":"received","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}

  const exists = transactions.find(({ hash }) => txn.hash === hash)
  console.log(2, exists)

  if (exists) {
    console.log(3)
    const newTransactions = transactions.map(t => ({ ...t, modified: t.hash === txn.hash ? new Date() : t.modified, status: Number(t.hash === txn.hash ? txn.status : t.status) }))
    set({ transactions: newTransactions })
  } else {
    console.log(4)
    // TODO: make sure sent-to-us will show up in getTransactions 
    set({ transactions: [{ ...txn, created: new Date(), modified: new Date() }].concat(transactions) })
  }
}
