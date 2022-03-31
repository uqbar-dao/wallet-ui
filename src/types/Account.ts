export interface RawAccount {
  address: string
  seed: string
  nonces: { [key:string]: number }
}

export interface Account {
  address: string
  seed: string
  nonces: { [key:string]: number }
}

export const processAccount = (raw: RawAccount) => ({
  address: raw.address.replace(/\./g, ''),
  seed: raw.seed.replace(/\./g, ''),
  nonces: raw.nonces,
})
