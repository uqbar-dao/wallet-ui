import React, { useCallback, useState } from 'react'
import { FaTrash, FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../../store/walletStore';
import { Account } from '../../types/Account';
import { displayPubKey } from '../../utils/account';
import Col from '../spacing/Col';
import Row from '../spacing/Row'
import Text from '../text/Text';
import './AccountDisplay.scss'

interface AccountDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  account: Account
  full?: boolean
}

const AccountDisplay: React.FC<AccountDisplayProps> = ({
  account,
  full = false,
  ...props
}) => {
  const navigate = useNavigate()
  const { deleteAccount } = useWalletStore()
  const [didCopy, setDidCopy] = useState(false)

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(account.address)
    setDidCopy(true)
    setTimeout(() => setDidCopy(false), 1000)
  }, [account.address])

  return (
    <Col {...props} className={`account-display ${props.className || ''}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row>
          <Text mono style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${account.address}`)}>{displayPubKey(account.address)}</Text>
          <Row style={{ marginLeft: 12, padding: '2px 4px' }} className="icon" onClick={onCopy}>
            {didCopy ? <Text style={{ fontSize: 14 }}>Copied!</Text> : <FaCopy />}
          </Row>
        </Row>
        <Row className="icon" onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          deleteAccount(account.address)
        }}>
          <FaTrash />
        </Row>
      </Row>
      {full && (
        <Col>
          <h4>Nonces</h4>
          {Object.keys(account.nonces).map(n => (
            <Row>
              <Text style={{ marginRight: 8, width: 72 }}>Town: {n}</Text>
              <Text>Nonce: {account.nonces[n]}</Text>
            </Row>
          ))}
        </Col>
      )}
    </Col>
  )
}

export default AccountDisplay
