import React, { useCallback, useState } from 'react'
import AccountBalance from '../components/assets/AccountBalance'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Modal from '../components/popups/Modal'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'

import './PortfolioView.scss'

const PortfolioView = () => {
  const { assets, loading, addAsset } = useWalletStore()
  const assetsList = Object.keys(assets)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [asset, setAsset] = useState('')

  const addNewAsset = useCallback(() => {
    if (asset) {
      addAsset(asset)
      setShowAddAsset(false)
    }
  }, [asset, addAsset, setShowAddAsset])

  return (
    <Container className='portfolio-view'>
      <h2>Portfolio</h2>
      <Button onClick={() => setShowAddAsset(true)} style={{ width: 200 }}>
        + Add New Asset
      </Button>
      <Col>
        {loading && <Text style={{ marginTop: 16 }}>Loading...</Text>}
        {(!assetsList.length && !loading) && (
          <Text style={{ marginTop: 16 }}>You do not have any Uqbar assets yet.</Text>
        )}
        {assetsList.map(a => (
          <AccountBalance key={a} pubKey={a} balances={assets[a]} />
        ))}
      </Col>
      <Modal show={showAddAsset} hide={() => setShowAddAsset(false)}>
        <h4>Add New Asset</h4>
        <Input
          onChange={(e: any) => setAsset(e.target.value)}
          placeholder="Asset contract address"
          style={{ width: 'calc(100% - 16px)', marginBottom: 16, marginLeft: -3 }}
          containerStyle={{ width: '100%' }}
        />
        <Button style={{ minWidth: 120 }} onClick={addNewAsset}>
          Add
        </Button>
      </Modal>
    </Container>
  )
}

export default PortfolioView
