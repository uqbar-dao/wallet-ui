import React, { useCallback, useMemo, useState } from 'react'
import AccountBalance from '../components/assets/AccountBalance'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Modal from '../components/popups/Modal'
import SendModal from '../components/popups/SendModal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { displayPubKey } from '../utils/account';

import './AssetsView.scss'

const PLACEHOLDER = 'All addresses'
const TOWN = 'All towns'

const AssetsView = () => {
  const { assets, accounts, loadingText, addAsset } = useWalletStore()
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>()
  const [selectedTown, setSelectedTown] = useState<number | undefined>()
  const [asset, setAsset] = useState('')
  const [riceId, setRiceId] = useState<string | undefined>()
  const [nftIndex, setNftIndex] = useState<number | undefined>()
  const accountsList = useMemo(() => selectedAddress ? [selectedAddress] : Object.keys(assets), [assets, selectedAddress])
  const towns = Object.values(assets).reduce((acc: number[], cur) => {
    cur.forEach(({ town }) => {
      if (!acc.includes(town))
        acc.push(town)
    })
    return acc
  }, [])

  const selectAddress = (e: any) => {
    setSelectedAddress(e.target.value === PLACEHOLDER ? undefined : e.target.value)
  }

  const addNewAsset = useCallback(() => {
    if (asset) {
      addAsset(asset)
      setShowAddAsset(false)
    }
  }, [asset, addAsset, setShowAddAsset])

  return (
    <Container className='assets-view'>
      <Row style={{ maxWidth: 600, justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Assets</h2>
        <Row>
          <label style={{ marginRight: 8 }}>Address:</label>
          <select className='address-selector' value={selectedAddress} onChange={selectAddress}>
            <option>{PLACEHOLDER}</option>
            {accounts.map(({ address }) => (
              <option value={address} key={address}>
                {displayPubKey(address)}
              </option>
            ))}
          </select>
        </Row>
      </Row>
      <Row style={{ maxWidth: 600, justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={() => setShowAddAsset(true)} style={{ width: 160 }}>
          + Add New Asset
        </Button>
        <Row>
          <label style={{ marginRight: 8 }}>Town:</label>
          <select className='address-selector' value={selectedTown} onChange={(e) => setSelectedTown(e.target.value === TOWN ? undefined : Number(e.target.value))}>
            <option>{TOWN}</option>
            {towns.map(town => (
              <option value={town} key={town}>
                {town}
              </option>
            ))}
          </select>
        </Row>
      </Row>
      <Col>
        {(!accountsList.length && !loadingText) && (
          <Text style={{ marginTop: 16 }}>You do not have any Uqbar assets yet.</Text>
        )}
        {accountsList.map(a => (
          <AccountBalance
            key={a}
            pubKey={a}
            showAddress={!selectedAddress}
            setRiceId={setRiceId}
            setNftIndex={setNftIndex}
            balances={assets[a]?.filter(({ town }) => selectedTown === undefined || town === selectedTown) || []}
          />
        ))}
      </Col>
      <Modal show={showAddAsset} hide={() => setShowAddAsset(false)}>
        <h4 style={{ marginTop: 0 }}>Add New Asset</h4>
        <Input
          onChange={(e: any) => setAsset(e.target.value)}
          placeholder="Asset contract address"
          style={{ width: 'calc(100% - 16px)', marginBottom: 16, marginLeft: -3 }}
          containerStyle={{ width: '100%' }}
          value={asset}
        />
        <Button style={{ minWidth: 120 }} onClick={addNewAsset}>
          Add
        </Button>
      </Modal>
      <SendModal
        show={Boolean(riceId)}
        riceId={riceId}
        nftIndex={nftIndex}
        formType={nftIndex !== undefined ? 'nft' : 'tokens'}
        children={null}
        hide={() => {
          setRiceId(undefined)
          setNftIndex(undefined)
        }}
      />
    </Container>
  )
}

export default AssetsView
