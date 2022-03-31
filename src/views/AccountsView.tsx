import React, { useEffect, useRef, useState } from 'react'
import AccountDisplay from '../components/accounts/AccountDisplay'
import Button from '../components/form/Button'
import TextArea from '../components/form/TextArea'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import useWalletStore from '../store/walletStore'

import './AccountsView.scss'

const AccountsView = () => {
  const inputRef = useRef<any>(null)
  const { accounts, init, getAccounts, createAccount, importAccount } = useWalletStore()
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importSeed, setImportSeed] = useState('')

  useEffect(() => {
    init()
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
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      <Button onClick={() => setShowModal(true)}>
        + Add Account
      </Button>
      <Modal show={showModal} hide={() => setShowModal(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Button style={{ minWidth: 160, marginBottom: 16 }} onClick={async () => {
            await createAccount()
            await getAccounts()
            setShowModal(false)
          }}>
            Create Account
          </Button>
          <Button style={{ minWidth: 160 }} onClick={() => {
            setShowImport(true)
            setShowModal(false)
          }}>
            Import Account
          </Button>
        </Col>
      </Modal>
      <Modal show={showImport} hide={() => setShowImport(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <h3>Import Account</h3>
          <TextArea
            ref={inputRef}
            onChange={(e: any) => setImportSeed(e.target.value)}
            placeholder="Enter seed phrase"
            style={{ width: '90%', height: 80, marginBottom: 16 }}
          />
          <Button style={{ minWidth: 120 }} onClick={() => {
            if (importSeed) {
              importAccount(importSeed)
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
