import { GetState, SetState } from "zustand";
import { Assets } from "../../types/Assets";
import { processNft, processToken, RawToken } from "../../types/Token";
import { Transaction } from "../../types/Transaction";
import { removeDots } from "../../utils/format";
import { WalletStore } from "../walletStore";

export const handleBookUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (balanceData: { [key: string]: RawToken }) => {
  const assets: Assets = {}
  console.log('book UPDATE:', JSON.stringify(balanceData))
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

export const handleTxnUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => (transaction: Transaction) => {
  console.log('TXN UPDATE:', JSON.stringify(transaction))
  const { transactions } = get()
  // {"status":"submitted","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}
  // {"status":"received","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}

  const exists = transactions.find(({ hash }) => transaction.hash === hash)

  if (exists) {
    set({ transactions: transactions.map(t => ({ ...t, modified: t.hash === transaction.hash ? new Date() : t.modified, status: Number(t.hash === transaction.hash ? transaction.status : t.status) })) })
  } else {
    // TODO: make sure sent-to-us will show up in getTransactions 
    // set({ transactions: [{ ...transaction, created: new Date(), modified: new Date() }].concat(transactions) })
    get().getTransactions()
  }
}
