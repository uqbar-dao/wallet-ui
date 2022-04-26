export interface NftItem {
  URI: string
  desc: string
}

export interface NftItems {
  [key: string]: NftItem
}

export interface TokenData {
  balance?: number
  metadata: string
  items?: NftItems
}

export interface RawToken {
  lord: string
  data: TokenData
  id: string
  holder: string
  town: number
}

export interface NftInfo extends NftItem {
  index: number
}

export interface Token {
  town: number
  riceId: string
  lord: string
  holder: string
  balance?: number
  nftInfo?: NftInfo
  data: TokenData
}

export const processToken = (raw: RawToken) => ({
  town: raw.town,
  riceId: raw.id,
  lord: raw.lord,
  holder: raw.holder,
  balance: raw.data.balance,
  data: raw.data
})

export const processNft = (raw: RawToken, index: string, nft: NftItem) : Token => ({
  town: raw.town,
  riceId: raw.id,
  lord: raw.lord,
  holder: raw.holder,
  nftInfo: {
    index: Number(index),
    ...nft
  },
  data: raw.data
})
