import React from 'react'
import { TokenBalance } from '../../types/TokenBalance'
import TokenDisplay from './TokenDisplay'
import './AccountBalance.scss'
import Line from '../spacing/Line'
import { displayPubKey } from '../../utils/account'

interface AccountBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  pubKey: string
  balances: TokenBalance[]
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ balances, pubKey, ...props }) => {
  return (
    <div {...props} className={`account-balance ${props.className || ''}`}>
      <h4 style={{ marginBottom: 0 }}>Account</h4>
      <h4 style={{ fontFamily: 'monospace, monospace', marginTop: 0 }}>{displayPubKey(pubKey)}</h4>
      <Line style={{ marginBottom: '8px' }} />
      {balances.map(b => (
        <TokenDisplay tokenBalance={b} key={b.riceId} />
      ))}
    </div>
  )
}

export default AccountBalance
