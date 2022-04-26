import React, { useCallback, useEffect, useRef, useState } from 'react'
import AccountDisplay from '../components/accounts/AccountDisplay'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import TextArea from '../components/form/TextArea'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Divider from '../components/spacing/Divider'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { ImportedWalletType, Seed } from '../types/Accounts'

import './AccountsView.scss'

const AccountsView = () => {
  const inputRef = useRef<any>(null)
  const { loading, accounts, importedAccounts, getAccounts, createAccount, restoreAccount, importAccount, getSeed } = useWalletStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')
  const [seedData, setSeed] = useState<Seed | null>(null)

  useEffect(() => {
    getAccounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showRestore && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showRestore, inputRef])

  const showSeed = useCallback(async () => {
    if (window.confirm('Are you sure you want to display your seed phrase? Anyone viewing this will have access to your account.')) {
      const seed = await getSeed()
      setSeed(seed)
    }
  }, [getSeed, setSeed])

  const create = useCallback(async (restore = false) => {
    if (window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
      if (restore) {
        if (!mnemonic) {
          alert('Mnemonic is required')
        } else {
          restoreAccount(mnemonic, password)
        }
      } else {
        createAccount()
      }
    }
  }, [mnemonic, password, createAccount, restoreAccount])

  const doImport = useCallback((type: ImportedWalletType) => {
    importAccount(type)
    setShowCreate(false)
    setShowRestore(false)
    setShowImport(false)
  }, [setShowCreate, setShowRestore, setShowImport, importAccount])

  return (
    <Container className='accounts-view'>
      {loading && <Text style={{ marginBottom: 16 }}>Loading...</Text>}
      <h3>Primary Accounts</h3>
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      {accounts.length > 0 && <Button onClick={showSeed} style={{ marginBottom: 16, width: 200 }}>
        Display Seed Phrase
      </Button>}
      <Button onClick={() => setShowCreate(true)} style={{ width: 200 }}>
        + Create Account
      </Button>
      <Divider style={{ margin: '40px 0 16px' }} />
      <h3>Imported Accounts</h3>
      {importedAccounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      <Button onClick={() => setShowImport(true)} style={{ width: 200 }}>
        + Import Account
      </Button>
      <Modal show={Boolean(seedData)} hide={() => setSeed(null)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', height: '100%', width: '300px' }}>
          <h4 style={{ margin: '0 0 8px' }}>Seed:</h4>
          <Text mono>{seedData?.mnemonic}</Text>
          {seedData?.password && (
            <>
              <h4>Password:</h4>
              <Text mono>{seedData?.password}</Text>
            </>
          )}
        </Col>
      </Modal>
      <Modal show={showCreate} hide={() => setShowCreate(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button  style={{ minWidth: 280, marginBottom: 24 }} onClick={create}>Create New Account</Button>
          <Button  style={{ minWidth: 280 }} onClick={() => setShowRestore(true)}>Restore Account From Seed</Button>
        </Col>
      </Modal>
      <Modal show={showRestore} hide={() => setShowRestore(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <h3>Restore Account</h3>
          <TextArea
            ref={inputRef}
            onChange={(e: any) => setMnemonic(e.target.value)}
            placeholder="Enter seed phrase"
            containerStyle={{ width: '100%', marginBottom: 16 }}
            style={{ width: 'calc(100% - 8px)', height: 80 }}
          />
          <Input
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{ width: 'calc(100% - 16px)', marginBottom: 16, marginLeft: -3 }}
            containerStyle={{ width: '100%' }}
            type="password"
          />
          <Button style={{ minWidth: 120 }} onClick={() => {
            if (mnemonic && window.confirm('Please make sure you have backed up your seed phrase and password. This will overwrite your existing account(s), are you sure?')) {
              restoreAccount(mnemonic, password)
            }
            setShowRestore(false)
          }}>
            Restore
          </Button>
        </Col>
      </Modal>
      <Modal show={showImport} hide={() => setShowImport(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button style={{ minWidth: 120 }} onClick={() => doImport('ledger')}>
            Connect Ledger
          </Button>
        </Col>
      </Modal>
    </Container>
  )
}

export default AccountsView
