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
import { DerivedAddressType, HardwareWalletType, Seed } from '../types/Accounts'
import { capitalize } from '../utils/format'

import './AccountsView.scss'

const AccountsView = () => {
  const inputRef = useRef<any>(null)
  const { accounts, importedAccounts, getAccounts, createAccount, restoreAccount, importAccount, getSeed, deriveNewAddress } = useWalletStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [password, setPassword] = useState('')
  const [seedData, setSeed] = useState<Seed | null>(null)
  const [addAddressType, setAddAddressType] = useState<DerivedAddressType | null>(null)
  const [nick, setNick] = useState('')
  const [hdpath, setHdpath] = useState('')
  const [importNick, setImportNick] = useState('')
  const [importType, setImportType] = useState<HardwareWalletType | null>(null)

  const addHardwareAddress = addAddressType && addAddressType !== 'hot'

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

  const doImport = useCallback(() => {
    if (!importNick) {
      alert('Nickname is required')
    } else {
      if (importType) {
        importAccount(importType, importNick)
      }
      setShowCreate(false)
      setShowRestore(false)
      setShowImport(false)
      setImportType(null)
    }
  }, [setShowCreate, setShowRestore, setShowImport, importAccount, importNick, importType])

  const addAddress = () => {
    if (addHardwareAddress) {
      if (!hdpath) {
        alert('You must supply an HD path')
        return
      }
      deriveNewAddress(hdpath, nick, addAddressType)
    } else if (addAddressType) {
      deriveNewAddress(hdpath, nick)
    }
    setNick('')
    setHdpath('')
    setAddAddressType(null)
  }

  const closeModal = () => {
    setNick('')
    setHdpath('')
    setAddAddressType(null)
  }

  const hardwareWalletTypes: HardwareWalletType[] =
    importedAccounts.reduce((acc, { type }) => !acc.includes(type) ? acc.concat([type]) : acc, [] as HardwareWalletType[])

  hardwareWalletTypes.push('trezor')

  return (
    <Container className='accounts-view'>
      <h3>Hot Wallets</h3>
      {accounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      {accounts.length > 0 && (
        <>
          <Button onClick={showSeed} style={{ marginBottom: 16, width: 200 }}>
            Display Seed Phrase
          </Button>
          <Button onClick={() => setAddAddressType('hot')} style={{ marginBottom: 16, width: 200 }}>
            Derive New Address
          </Button>
        </>
      )}
      <Button onClick={() => setShowCreate(true)} style={{ width: 200 }}>
        + Add Wallet
      </Button>
      <Divider style={{ margin: '40px 0 16px' }} />
      <h3>Hardware Wallets</h3>
      {importedAccounts.map(a => (
        <AccountDisplay key={a.address} account={a} />
      ))}
      {importedAccounts.length > 0 && (
        <Button onClick={() => setAddAddressType(hardwareWalletTypes[0])} style={{ marginBottom: 16, width: 200 }}>
          Derive New Address
        </Button>
      )}
      <Button onClick={() => setShowImport(true)} style={{ width: 200 }}>
        + Connect
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
          <Button  style={{ minWidth: 280, marginBottom: 24 }} onClick={create}>Create New Wallet</Button>
          <Button  style={{ minWidth: 280 }} onClick={() => setShowRestore(true)}>Restore Wallet From Seed</Button>
        </Col>
      </Modal>
      <Modal show={showRestore} hide={() => setShowRestore(false)} style={{ minHeight: 160, minWidth: 300 }}>
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <h3>Restore Wallet</h3>
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
            value={password}
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
          <Button style={{ minWidth: 120 }} onClick={() => {
            setShowImport(false)
            setImportType('ledger')
          }}>
            Connect Ledger
          </Button>
        </Col>
      </Modal>
      <Modal show={Boolean(importType)}
        hide={() => {
          setShowImport(true)
          setImportType(null)
        }}
        style={{ minHeight: 160, minWidth: 300 }}
      >
        <Col style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <h4 style={{ marginTop: 0 }}>Set Nickname</h4>
          <Input
            onChange={(e: any) => setImportNick(e.target.value)}
            placeholder={`Nickname, i.e. ${capitalize(importType || '')} primary`}
            style={{ width: 'calc(100% - 16px)' }}
            containerStyle={{ width: '100%', marginBottom: 24 }}
            value={importNick}
          />
          <Button style={{ minWidth: 120 }} onClick={doImport} variant="dark">
            Connect
          </Button>
        </Col>
      </Modal>
      <Modal show={Boolean(addAddressType)} hide={closeModal}>
        <Col style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h4 style={{ margin: '0 0 12px' }}>Derive New Address</h4>
          {(addHardwareAddress) && (
            <select className='hardware-type' value={addAddressType} onChange={(e) => setAddAddressType(e.target.value as HardwareWalletType)}>
              {hardwareWalletTypes.map(hwt => (
                <option value={hwt}>
                  {capitalize(hwt)}
                </option>
              ))}
            </select>
          )}
          <Input
            onChange={(e: any) => setNick(e.target.value)}
            placeholder="Nickname"
            style={{ width: 'calc(100% - 20px)' }}
            containerStyle={{ width: '100%', marginBottom: 16 }}
            value={nick}
          />
          <Input
            onChange={(e: any) => setHdpath(e.target.value)}
            placeholder={`HD Path ${addHardwareAddress ? '(m/44\'/60\'/0\'/0/0)' : '(optional)'}`}
            style={{ width: 'calc(100% - 20px)' }}
            containerStyle={{ width: '100%', marginBottom: 16 }}
            value={hdpath}
          />
          <Button onClick={addAddress} variant="dark">Derive</Button>
        </Col>
      </Modal>
    </Container>
  )
}

export default AccountsView
