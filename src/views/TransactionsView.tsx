import React, { useCallback, useEffect, useState } from 'react'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Text from '../components/text/Text'
import TransactionShort from '../components/transactions/TransactionShort'
import useWalletStore from '../store/walletStore'
import { groupTransactions } from '../utils/transactions'

import './TransactionsView.scss'

const TransactionsView = () => {
  const { accounts, transactions, getTransactions } = useWalletStore()
  const [address, setAddress] = useState<string | undefined>()
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const filterByAddress = useCallback((rawAddress?: string) => {
    setAddress(rawAddress)
    if (rawAddress) {
      setFilteredTransactions(
        transactions.filter(({ from }) => from === rawAddress)
      )
    } else {
      setFilteredTransactions(transactions)
    }
  }, [transactions, setFilteredTransactions])

  useEffect(() => {
    if (transactions.length !== filteredTransactions.length) {
      filterByAddress(address)
    }
  }, [address, transactions, filteredTransactions.length, filterByAddress])

  useEffect(() => {
    if (accounts.length) {
      getTransactions()
    }
  }, [accounts]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const { pending, rejected, finished } = groupTransactions(filteredTransactions)

  return (
    <Container className='transactions-view'>
      <Col className="header">
        <h2>Transaction History</h2>
        <select name="assets" value={address} onChange={(e: any) => filterByAddress(e.target.value)} style={{ width: 360, height: 28, marginTop: 4, fontSize: 16 }}>
          <option>All Transactions</option>
          {accounts.map(a => (
            <option key={a.address} value={a.rawAddress} style={{ fontFamily: 'monospace monospace' }}>
              {a.address}
            </option>
          ))}
        </select>
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
