import React, { useCallback, useEffect, useState } from 'react'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import TransactionShort from '../components/transactions/TransactionShort'
import useWalletStore from '../store/walletStore'
import { displayPubKey } from '../utils/account'
import { addHexDots } from '../utils/number'
import { groupTransactions } from '../utils/transactions'

import './TransactionsView.scss'

const PLACEHOLDER = 'All addresses'

const TransactionsView = () => {
  const { accounts, transactions } = useWalletStore()
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>()

  const filterByAddress = useCallback((address?: string) => {
    if (address) {
      setFilteredTransactions(
        transactions.filter(({ from }) => from === addHexDots(address))
      )
    } else {
      setFilteredTransactions(transactions)
    }
  }, [transactions, setFilteredTransactions])

  const selectAddress = (e: any) => {
    setSelectedAddress(e.target.value === PLACEHOLDER ? undefined : e.target.value)
  }

  useEffect(() => {
    filterByAddress(selectedAddress)
  }, [selectedAddress, transactions, filterByAddress])

  const { pending, rejected, finished } = groupTransactions(filteredTransactions)

  return (
    <Container className='transactions-view'>
      <Col className="header">
        <Row style={{ maxWidth: 600, justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: '16px 0' }}>Transaction History</h2>
          <Row>
            <label style={{ marginRight: 8 }}>Address:</label>
            <select style={{ width: 160 }} value={selectedAddress} onChange={selectAddress}>
              <option>{PLACEHOLDER}</option>
              {accounts.map(({ address }) => (
                <option value={address} key={address}>
                  {displayPubKey(address)}
                </option>
              ))}
            </select>
          </Row>
        </Row>
      </Col>
      <h3>Pending</h3>
      <Col>
        {pending.length ? (
          pending.map(txn => <TransactionShort key={txn.hash} txn={txn} />)
        ) : (
          <Text>None</Text>
        )}
      </Col>
      <h3>Rejected</h3>
      <Col>
        {rejected.length ? (
          rejected.map(txn => <TransactionShort key={txn.hash} txn={txn} />)
        ) : (
          <Text>None</Text>
        )}
      </Col>
      <h3>Completed</h3>
      <Col>
        {finished.length ? (
          finished.map(txn => <TransactionShort key={txn.hash} txn={txn} />)
        ) : (
          <Text>None</Text>
        )}
      </Col>
    </Container>
  )
}

export default TransactionsView
