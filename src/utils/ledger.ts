import 'core-js/actual';
import { ethers } from "ethers";
import { listen } from "@ledgerhq/logs"
import Eth from "@ledgerhq/hw-app-eth"
import TransportWebUSB from "@ledgerhq/hw-transport-webusb" // eslint-disable-line

export const getLedgerAddress = async () => {
  try {
    const transport = await TransportWebUSB.create()
    listen(log => console.log(log))
    const appEth = new Eth(transport)

    const { address } = await appEth.getAddress("44'/60'/0'/0/0", false);

    console.log('ETH ADDRESS:', address)

    return address
  } catch (e) {
    alert('Please make sure your Ledger is connected, unlocked, and the Ethereum app is open then try again.')
    console.warn('LEDGER CONNECTION:', e)
  }
}

export const signLedgerTransaction = async (address: string, transaction: any) => {
  try {
    const transport = await TransportWebUSB.create()
    listen(log => console.log(log))
    const appEth = new Eth(transport)

    // TODO: check what the backend expects for this
    const unsignedTx = ethers.utils.serializeTransaction(transaction).substring(2);

    const signature = await appEth.signTransaction("44'/60'/0'/0/0", unsignedTx);

    const attachedSig = {
      r: "0x"+signature.r,
      s: "0x"+signature.s,
      v: parseInt(signature.v),
      from: address,
    }

    const signedTx = ethers.utils.serializeTransaction(transaction, attachedSig);

    return signedTx
  } catch (e) {
    console.warn('LEDGER CONNECTION:', e)
  }
}
