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
  const [showModal, setShowModal] = useState(false)
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
      <h2>Accounts</h2>
      {loading && <Text style={{ marginBottom: 16 }}>Loading...</Text>}
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      <Button onClick={() => setShowModal(true)}>
        + New Account
      </Button>
      <Modal show={showModal} hide={() => setShowModal(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Button style={{ minWidth: 160, marginBottom: 16 }} onClick={async () => {
            if (window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
              createAccount()
              setShowModal(false)
            }
          }}>
            Create Account
          </Button>
          <Button style={{ minWidth: 160 }} onClick={() => {
            if (window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
              setShowImport(true)
              setShowModal(false)
            }
          }}>
            Import Account
          </Button>
        </Col>
      </Modal>
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
            if (mnemonic) {
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
