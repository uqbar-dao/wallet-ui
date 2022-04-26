import React from 'react'
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../../store/walletStore';
import { Account, ImportedAccount } from '../../types/Accounts';
import { displayPubKey } from '../../utils/account';
import { capitalize } from '../../utils/format';
import Col from '../spacing/Col';
import Row from '../spacing/Row'
import Text from '../text/Text';
import CopyIcon from '../transactions/CopyIcon';
import './AccountDisplay.scss'

interface AccountDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  account: Account | ImportedAccount
  full?: boolean
}

const AccountDisplay: React.FC<AccountDisplayProps> = ({
  account,
  full = false,
  ...props
}) => {
  const navigate = useNavigate()
  const { deleteAccount, removeAccount } = useWalletStore()

  return (
    <Col {...props} className={`account-display ${props.className || ''}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row>
          {'type' in account && <Text style={{ fontWeight: 600, marginRight: 16 }}>{capitalize(account.type)}</Text>}
          <Text mono style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${account.address}`)}>{displayPubKey(account.address)}</Text>
          <CopyIcon text={account.address} />
        </Row>
        <Row className="icon" onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if ('rawAddress' in account) {
            deleteAccount(account)
          } else {
            removeAccount(account)
          }
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
