import React, { useState } from 'react'
import Button from '../components/form/Button'
import Link from '../components/nav/Link'
import Loader from '../components/popups/Loader'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { formatHash } from '../utils/format'
import CopyIcon from '../components/transactions/CopyIcon';

import './SendView.scss'
import { getStatus } from '../utils/constants'
import SendTokenForm from '../components/forms/SendTokenForm'
import SendRawTransactionForm from '../components/forms/SendRawTransactionForm'

export type SendType = 'tokens' | 'nft' | 'data';

const titles = {
  tokens: 'Tokens',
  nft: 'NFT',
  data: 'Raw Data',
}

interface SelectorProps {
  title: SendType
  active: boolean
  onClick: () => void
}

const Selector = ({
  title,
  active,
  onClick,
}: SelectorProps) => {
  return (
    <Col onClick={onClick} className="selector">
      <Text className={active ? 'active' : 'inactive'}>{titles[title]}</Text>
    </Col>
  );
}

const SendView = () => {
  const { transactions } = useWalletStore()
  const txn = transactions[0]
  const [formType, setFormType] = useState<SendType>('tokens')

  const [submitted, setSubmitted] = useState(false)

  const getForm = () => {
    switch (formType) {
      case 'tokens':
        return <SendTokenForm {...{ setSubmitted, formType: 'tokens' }} />
      case 'nft':
        return <SendTokenForm {...{ setSubmitted, formType: 'nft' }} />
      case 'data':
        return <SendRawTransactionForm {...{ setSubmitted }} />
    }
  }

  return (
    <Container className='send-view'>
      <h2>Send</h2>
      {submitted ? (
        <Col className='submission-confirmation'>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Transaction Sent!</h4>
          {txn && (
            <Row style={{ marginBottom: 8 }}>
              <Text style={{ marginRight: 18 }}>Hash: </Text>
              <Link style={{ maxWidth: 'calc(100% - 100px)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} href={`/transactions/${txn.hash}`}>
                <Text mono>{formatHash(txn.hash)}</Text>
              </Link>
              <CopyIcon text={txn.hash} />
            </Row>
          )}
          {txn && (
            <Row style={{ marginBottom: 16 }}>
              <Text style={{ marginRight: 9 }}>Status: </Text>
              <Text mono>{getStatus(txn.status)}</Text>
              {(txn.status === 100 || txn.status === 101) && <Loader style={{ marginLeft: 16 }} />}
            </Row>
          )}
          <Button onClick={() => setSubmitted(false)}>Done</Button>
        </Col>
      ) : (
        <Col className="form-container">
          <Row className="form-selector">
            {['tokens', 'nft', 'data'].map((title) => (
              <Selector key={title} active={title === formType} title={title as SendType} onClick={() => setFormType(title as SendType)} />
            ))}
          </Row>
          {getForm()}
        </Col>
      )}
    </Container>
  )
}

export default SendView
