export interface SendTransactionPayload {
  from: string
  to: string
  town: number
  gasPrice: number
  budget: number
}

export interface SendRawTransactionPayload extends SendTransactionPayload {
  data: string
  riceInputs: string[]
}

export interface SendAssetPayload extends SendTransactionPayload {
  destination: string
  salt: string
}

export interface SendTokenPayload extends SendAssetPayload {
  amount: number
}

export interface SendNftPayload extends SendAssetPayload {
  nftIndex: number
}
