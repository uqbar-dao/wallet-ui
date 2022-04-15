import React, { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/form/Button'
import Form from '../components/form/Form'
import Input from '../components/form/Input'
import Link from '../components/nav/Link'
import Loader from '../components/popups/Loader'
import Col from '../components/spacing/Col'
import Container from '../components/spacing/Container'
import Row from '../components/spacing/Row'
import Text from '../components/text/Text'
import useWalletStore from '../store/walletStore'
import { TokenBalance } from '../types/TokenBalance'
import { removeDots } from '../utils/format'
import { addHexDots } from '../utils/number'
import CopyIcon from '../components/transactions/CopyIcon';

import './SendView.scss'
import { getStatus } from '../utils/constants'

const SendView = () => {
  const { riceId } = useParams()
  const { assets, metadata, transactions, sendTransaction } = useWalletStore()
  const firstTxn = transactions[0]
  const txn = firstTxn && (firstTxn.status === 100 || firstTxn.status === 101) ? firstTxn : null

  const assetsList = Object.values(assets).reduce((acc, cur) => acc.concat(cur), [])

  const [selected, setSelected] = useState<TokenBalance | undefined>(assetsList.find(a => a.riceId === riceId))
  const [loaded, setLoaded] = useState(false)
  const setSelectedAsset = (riceId: string) => setSelected(assetsList.find(a => a.riceId === riceId))
  const [destination, setDestination] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [budget, setBudget] = useState('')
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const clearForm = () => {
    setSelected(undefined)
    setDestination('')
    setGasPrice('')
    setBudget('')
    setAmount('')
  }

  useEffect(() => {
    if (riceId && assetsList && !selected && !loaded) {
      setSelected(assetsList.find(a => a.riceId === riceId))
      setLoaded(true)
    }
  }, [riceId, assetsList, selected, loaded, setSelected, setLoaded])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount || !Number(amount)) {
      alert('You must enter an amount')
    } else if (!selected) {
      alert('You must select a \'from\' account')
    } else if (!destination) {
      // TODO: validate the destination address
      alert('You must specify a destination address')
    } else if (Number(gasPrice) < 1 || Number(budget) < Number(gasPrice)) {
      alert('You must specify a gas price and budget')
    } else {
      sendTransaction({
        from: selected.holder,
        to: selected.lord,
        town: selected.town,
        amount: Number(amount),
        destination: addHexDots(destination),
        token: selected.data.metadata,
        gasPrice: Number(gasPrice),
        budget: Number(budget),
      })
      clearForm()
      setSubmitted(true)
    }
  }

  const tokenMetadata = selected && metadata[selected.data.metadata]

  return (
    <Container className='send-view'>
      <h2>Send</h2>
      {submitted ? (
        <Col className='submission-confirmation'>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Transaction Sent!</h4>
          {txn && (
            <Row style={{ marginBottom: 8 }}>
              <Text style={{ marginRight: 18 }}>Hash: </Text>
              <Link style={{ maxWidth: 'calc(100% - 100px)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} href={`/transactions`}>
                <Text mono>{removeDots(txn.hash)}</Text>
              </Link>
              <CopyIcon text={txn.hash} />
            </Row>
          )}
          {txn && (
            <Row style={{ marginBottom: 16 }}>
              <Text style={{ marginRight: 9 }}>Status: </Text>
              <Text mono>{getStatus(txn.status)}</Text>
              <Loader style={{ marginLeft: 16 }} />
            </Row>
          )}
          <Button onClick={() => setSubmitted(false)}>Done</Button>
        </Col>
      ) : (
        <Form style={{ width: 360 }} onSubmit={submit}>
          <Text style={{ fontSize: 14 }}>From:</Text>
          <select name="assets" value={selected?.riceId} onChange={(e: any) => setSelectedAsset(e.target.value)} style={{ width: 360, height: 28, marginTop: 4, fontSize: 16 }}>
            <option>Select an asset</option>
            {assetsList.map(a => (
              <option key={a.riceId} value={a.riceId} style={{ fontFamily: 'monospace monospace' }}>
                {removeDots(a.riceId)}
              </option>
            ))}
          </select>
          {tokenMetadata && (
            <Row style={{ alignItems: 'center' }}>
              <Text style={{ margin: '8px 8px 0px 0px', fontSize: 14 }}>Token: </Text>
              <Text mono style={{ marginTop: 10 }}>{tokenMetadata.symbol}</Text>
            </Row>
          )}
          <Input
            label="To:"
            containerStyle={{ marginTop: 12, width: '100%' }}
            placeholder='Destination address'
            value={destination}
            onChange={(e: any) => setDestination(e.target.value)}
            style={{ width: 340 }}
          />
          <Input
            label="Amount:"
            containerStyle={{ marginTop: 12, width: '100%' }}
            style={{ width: 340 }}
            value={amount}
            placeholder="Amount"
            onChange={(e: any) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          />
          <Row style={{ justifyContent: 'space-between' }}>
            <Input
              label="Gas Price:"
              containerStyle={{ marginTop: 12 }}
              style={{ width: 150 }}
              value={gasPrice}
              placeholder="Gas price"
              onChange={(e: any) => setGasPrice(e.target.value.replace(/[^0-9.]/g, ''))}
            />
            <Input
              label="Budget:"
              containerStyle={{ marginTop: 12 }}
              style={{ width: 150 }}
              value={budget}
              placeholder="Budget"
              onChange={(e: any) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </Row>
          <Button style={{ width: '100%', margin: '16px 0px 8px' }} type="submit" variant='dark' onClick={submit}>
            Send
          </Button>
        </Form>
      )}
    </Container>
  )
}

export default SendView
