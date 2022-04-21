export interface SendTransactionPayload {
  from: string
  to: string
  town: number
  gasPrice: number
  budget: number
}

export interface SendAssetPayload extends SendTransactionPayload {
  destination: string
}

export interface SendTokenPayload extends SendAssetPayload {
  amount: number
  token: string
}

export interface SendNftPayload extends SendAssetPayload {
  nft: string
}
