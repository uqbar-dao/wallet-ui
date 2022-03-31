import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import useWalletStore from '../store/walletStore'
import { TokenBalance } from '../types/TokenBalance'

import './SendView.scss'

const SendView = () => {
  const { lord } = useParams()
  const { assets } = useWalletStore()

  const assetsList = Object.values(assets).reduce((acc, cur) => acc.concat(cur), [])

  const [selected, setSelected] = useState<TokenBalance | undefined>(assetsList.find(a => a.lord === lord))
  const [to, setTo] = useState('')
  const [sequencer, setSequencer] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [budget, setBudget] = useState('')
  const [amount, setAmount] = useState('')

  return (
    <Container className='send-view'>
      <h2>Send</h2>
      <Col style={{ width: 360 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 60, margin: '12px 0px 12px' }}>From:</h4>
          <select name="assets" value={selected?.riceId} onChange={(e: any) => setSelected(e.target.value)} style={{ width: 300 }}>
            <option>Select an asset</option>
            {assetsList.map(a => (
              <option key={a.riceId} value={a.riceId} style={{ fontFamily: 'monospace monospace' }}>
                {a.riceId}
              </option>
            ))}
          </select>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 60, margin: '12px 0px 12px' }}>To:</h4>
          <Input
            placeholder='Destination address'
            value={to}
            onChange={(e: any) => setTo(e.target.value)}
            style={{ width: 250 }}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 96, margin: '12px 0px 12px' }}>Amount:</h4>
          <Input
            style={{ width: 250 }}
            value={amount}
            placeholder="Amount"
            onChange={(e: any) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 96, margin: '12px 0px 12px' }}>Sequencer:</h4>
          <Input
            style={{ width: 250 }}
            value={sequencer}
            placeholder="Sequencer"
            onChange={(e: any) => setSequencer(e.target.value)}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 96, margin: '12px 0px 12px' }}>Gas Price:</h4>
          <Input
            style={{ width: 250 }}
            value={gasPrice}
            placeholder="Gas price"
            onChange={(e: any) => setGasPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <h4 style={{ width: 96, margin: '12px 0px 12px' }}>Budget:</h4>
          <Input
            style={{ width: 250 }}
            value={budget}
            placeholder="Budget"
            onChange={(e: any) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </Row>
        <Button style={{ width: '100%', marginTop: 16 }}>
          Send
        </Button>
      </Col>
    </Container>
  )
}

export default SendView
