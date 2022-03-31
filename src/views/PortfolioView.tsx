import React from 'react'
import AccountBalance from '../components/assets/AccountBalance'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import useWalletStore from '../store/walletStore'

import './PortfolioView.scss'

const PortfolioView = () => {
  const { assets } = useWalletStore()

  return (
    <Container className='portfolio-view'>
      <h2>Portfolio</h2>
      <Col>
        {Object.keys(assets).map(a => (
          <AccountBalance key={a} pubKey={a} balances={assets[a]} />
        ))}
      </Col>
    </Container>
  )
}

export default PortfolioView
