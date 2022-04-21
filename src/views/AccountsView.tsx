import React, { useEffect, useRef, useState } from 'react'
import AccountDisplay from '../components/accounts/AccountDisplay'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import TextArea from '../components/form/TextArea'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'

import './AccountsView.scss'

const AccountsView = () => {
  const inputRef = useRef<any>(null)
  const { loading, accounts, getAccounts, createAccount, importAccount } = useWalletStore()
  const [showImport, setShowImport] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    getAccounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showImport && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showImport, inputRef])

  return (
    <Container className='accounts-view'>
      {loading && <Text style={{ marginBottom: 16 }}>Loading...</Text>}
      <h3>Primary Accounts</h3>
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      <Button onClick={async () => {
        if (window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
          createAccount()
        }
      }}>
        + Create Account
      </Button>
      <h3>Imported Accounts</h3>
      <Button onClick={() => setShowImport(true)}>
        + Import Account
      </Button>
      <Modal show={showImport} hide={() => setShowImport(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <h3>Import Account</h3>
          <TextArea
            ref={inputRef}
            onChange={(e: any) => setMnemonic(e.target.value)}
            placeholder="Enter seed phrase"
            style={{ width: '90%', height: 80, marginBottom: 16 }}
          />
          <Input
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{ width: '100%', marginBottom: 16, marginLeft: -3 }}
            containerStyle={{ width: 'calc(90% - 6px)' }}
            type="password"
          />
          <Button style={{ minWidth: 120 }} onClick={() => {
            if (mnemonic && window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
              importAccount(mnemonic, password)
            }
            setShowImport(false)
          }}>
            Import
          </Button>
        </Col>
      </Modal>
    </Container>
  )
}

export default AccountsView
