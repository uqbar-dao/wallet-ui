import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import CopyIcon from '../components/transactions/CopyIcon'
import useWalletStore from '../store/walletStore'
import { getStatus } from '../utils/constants'
import { removeDots } from '../utils/format'

import './TransactionView.scss'

const TransactionView = () => {
  const { hash } = useParams()
  const { transactions, getTransactions } = useWalletStore()
  const txn = transactions.find(t => t.hash === hash)

  console.log(transactions)

  useEffect(() => {
    getTransactions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!txn) {
    return (
      <Container className='transaction-view'>
        <h3>Transaction not found</h3>
        <Text>Please go back.</Text>
      </Container>
    )
  }

  return (
    <Container className='transaction-view'>
      <h2>Transaction</h2>
      <Col className="transaction">
        <Col style={{ marginBottom: 12 }}>
          <Row>
            <Text style={{ marginRight: 12, fontWeight: 600 }}>Hash:</Text>
            <CopyIcon text={txn.hash} />
          </Row>
          <Text style={{ overflowWrap: 'break-word' }} mono>{removeDots(txn.hash)}</Text>
        </Col>
        <Col style={{ marginBottom: 12 }}>
          <Text style={{ marginRight: 12, fontWeight: 600 }}>From:</Text>
          <Text style={{ overflowWrap: 'break-word' }} mono>{removeDots(txn.from)}</Text>
        </Col>
        <Col style={{ marginBottom: 12 }}>
          <Text style={{ marginRight: 12, fontWeight: 600 }}>To:</Text>
          <Text style={{ overflowWrap: 'break-word' }} mono>{removeDots(txn.to)}</Text>
        </Col>
        {txn.destination && (
          <Row>
            <Text style={{ marginRight: 12, fontWeight: 600 }}>Destination:</Text>
            <Text mono>{txn.destination}</Text>
          </Row>
        )}
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <Text style={{ marginRight: 12, fontWeight: 600 }}>Status:</Text>
            <Text mono>{getStatus(txn.status)}</Text>
          </Row>
          {txn.created && <Text mono>{txn.created.toDateString()}</Text>}
        </Row>
      </Col>
    </Container>
  )
}

export default TransactionView
