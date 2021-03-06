import React from 'react'
import { Token } from '../../types/Token'
import TokenDisplay from './TokenDisplay'
import './AccountBalance.scss'
import Line from '../spacing/Line'
import { displayPubKey } from '../../utils/account'
import { useNavigate } from 'react-router-dom'
import Row from '../spacing/Row'
import CopyIcon from '../transactions/CopyIcon'
import { removeDots } from '../../utils/format'

interface AccountBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
  pubKey: string
  balances: Token[]
  showAddress: boolean
  setRiceId: (riceId: string) => void
  setNftIndex: (nftIndex?: number) => void
}

const AccountBalance: React.FC<AccountBalanceProps> = ({
  balances,
  pubKey,
  showAddress,
  setRiceId,
  setNftIndex,
  ...props
}) => {
  const navigate = useNavigate()

  return (
    <div {...props} className={`account-balance ${props.className || ''}`}>
      {showAddress && (
        <>
          <h4 style={{ marginBottom: 0 }}>Account</h4>
          <Row style={{ alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontFamily: 'monospace, monospace', margin: 0, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${pubKey}`)}>
              {displayPubKey(pubKey)}
            </h4>
            <CopyIcon text={removeDots(pubKey)} />
          </Row>
          <Line style={{ marginBottom: '8px' }} />
        </>
      )}
      {balances.map(b => (
        <TokenDisplay tokenBalance={b} key={b.riceId} setRiceId={setRiceId} setNftIndex={setNftIndex} />
      ))}
    </div>
  )
}

export default AccountBalance
