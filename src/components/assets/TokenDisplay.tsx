import React, { useState } from 'react'
import { FaCaretRight, FaCaretDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { TokenBalance } from '../../types/TokenBalance'
import { formatAmount } from '../../utils/number';
import Button from '../form/Button';
import Col from '../spacing/Col';
import Row from '../spacing/Row'
import Text from '../text/Text';
import './TokenDisplay.scss'

interface TokenDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  tokenBalance: TokenBalance
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ tokenBalance, ...props }) => {
  const navigate = useNavigate()
  const { lord, balance, town, riceId } = tokenBalance
  const [open, setOpen] = useState(false)

  return (
    <Col {...props} className={`token-display ${props.className || ''}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row>
          <Row onClick={() => setOpen(!open)} style={{ padding: '2px 4px', cursor: 'pointer' }}>
            {open ? <FaCaretDown /> : <FaCaretRight />}
          </Row>
          <Text mono>{lord}</Text>
        </Row>
        <Row>
          <Text>{formatAmount(balance)}</Text>
          <Button onClick={() => navigate(`/send/${lord}`)} style={{ marginLeft: 16, padding: '4px 8px', fontSize: '14px' }}>
            Transfer
          </Button>
        </Row>
      </Row>
      {open && (
        <Col style={{ paddingLeft: 24, paddingTop: 8 }}>
          <Row>
            <Text style={{ width: 80 }}>Town:</Text>
            <Text mono>{' ' + town}</Text>
          </Row>
          <Row>
            <Text style={{ width: 80 }}>Rice ID:</Text>
            <Text mono>{' ' + riceId}</Text>
          </Row>
        </Col>
      )}
    </Col>
  )
}

export default TokenDisplay
