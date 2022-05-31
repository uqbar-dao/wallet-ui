import { GetState, SetState } from "zustand";
import { Assets } from "../../types/Assets";
import { processNft, processToken, RawToken, Token } from "../../types/Token";
import { Transaction } from "../../types/Transaction";
import { removeDots } from "../../utils/format";
import { showNotification } from "../../utils/notification";
import { WalletStore } from "../walletStore";
import { formatHash } from '../../utils/format';

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

    assets[removeDots(account)].sort((a: Token, b: Token) => a.town - b.town)
  }

  set({ assets })
}

export const handleTxnUpdate = (get: GetState<WalletStore>, set: SetState<WalletStore>) => async (rawTxn: { [key: string]: Transaction }) => {
  const txnHash = Object.keys(rawTxn)[0]
  const txn = { ...rawTxn[txnHash], hash: txnHash }
  console.log('TXN UPDATE:', txn)
  const { transactions } = get()
  // {"status":"submitted","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}
  // {"status":"received","hash":"0x7fbd.5f0e.13d5.24ea.8989.95d5.5051.a6f3.aeae.d01d.e0c3.79bf.10b9.0b49.9de3.eb10"}

  const exists = transactions.find(({ hash }) => txn.hash === hash)

  if (exists) {
    const newTransactions = transactions.map(t => ({ ...t, modified: t.hash === txn.hash ? new Date() : t.modified, status: Number(t.hash === txn.hash ? txn.status : t.status) }))
    set({ transactions: newTransactions })
  } else if (txn.hash) {
    // TODO: make sure sent-to-us will show up in getTransactions 
    set({ transactions: [{ ...txn, created: new Date(), modified: new Date() } as Transaction].concat(transactions) })
  }

  if (txn.status === 0) {
    showNotification(`Transaction ${formatHash(txn.hash)} confirmed!`)
  }
}
