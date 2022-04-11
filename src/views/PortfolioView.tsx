import React from 'react'
import AccountBalance from '../components/assets/AccountBalance'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'

import './PortfolioView.scss'

const PortfolioView = () => {
  const { assets, loading } = useWalletStore()
  const assetsList = Object.keys(assets)

  return (
    <Container className='portfolio-view'>
      <h2>Portfolio</h2>
      <Col>
        {loading && <Text>Loading...</Text>}
        {(!assetsList.length && !loading) && (
          <Text>You do not have any Uqbar assets yet.</Text>
        )}
        {assetsList.map(a => (
          <AccountBalance key={a} pubKey={a} balances={assets[a]} />
        ))}
      </Col>
    </Container>
  )
}

export default PortfolioView
