import { removeDots } from "./format";

export const formatAmount = (amount: number, decimals: number) => {
  //  I notice this rounds at the thousandths-place
  //  in the future we will require up to 18 decimal points of
  //  precision (to match ETH) -- they probably have eth libs for this
  return new Intl.NumberFormat('en-US').format(amount / 10**decimals);
}

export const addHexDots = (hex: string) => {
  const clearLead = removeDots(hex.replace('0x', '').toLowerCase())
  let result = ''

  for (let i = clearLead.length - 1; i > -1; i--) {
    if (i < clearLead.length - 1 && (clearLead.length - 1 - i) % 4 === 0) {
      result = '.' + result
    }
    result = clearLead[i] + result
  }

  return `0x${result}`
}
