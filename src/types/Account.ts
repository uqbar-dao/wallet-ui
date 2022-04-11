export interface RawAccount {
  pubkey: string
  privkey: string
  nonces: { [key:string]: number }
}

export interface Account {
  address: string
  rawAddress: string
  privateKey: string
  rawPrivateKey: string
  nonces: { [key:string]: number }
}

export const processAccount = (raw: RawAccount) => ({
  address: raw.pubkey.replace(/\./g, ''),
  rawAddress: raw.pubkey,
  privateKey: raw.privkey.replace(/\./g, ''),
  rawPrivateKey: raw.privkey,
  nonces: raw.nonces,
})
