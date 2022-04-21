import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../form/Button'
import Form from '../form/Form'
import Input from '../form/Input'
import Row from '../spacing/Row'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { removeDots } from '../../utils/format'
import { addHexDots } from '../../utils/number'

import './SendTokenForm.scss'

interface SendTransactionFormProps {
  setSubmitted: (submitted: boolean) => void
}

const SendTransactionForm = ({ setSubmitted }: SendTransactionFormProps) => {
  const { riceId } = useParams()
  const selectRef = useRef<HTMLSelectElement>(null)
  const { sendTransaction } = useWalletStore()

  const [destination, setDestination] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [budget, setBudget] = useState('')
  // TODO: how do I fund this? Do I have to select rice?
  
  const clearForm = () => {
    setDestination('')
    setGasPrice('')
    setBudget('')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!destination) {
      // TODO: validate the destination address
      alert('You must specify a destination address')
    } else if (Number(gasPrice) < 1 || Number(budget) < Number(gasPrice)) {
      alert('You must specify a gas price and budget')
    } else {
      const payload = {
        from: selected.holder, // what is this?
        to: selected.lord, // what is this?
        town: selected.town, // do I need this?
        destination: addHexDots(destination),
        gasPrice: Number(gasPrice),
        budget: Number(budget),
      }
      
      sendTransaction(payload)

      clearForm()
      setSubmitted(true)
    }
  }

  return (
    <Form className="send-token-form" onSubmit={submit}>
      <Text style={{ fontSize: 14 }}>From:</Text>
      <select ref={selectRef} name="assets" value={selected?.riceId} onChange={(e: any) => setSelectedAsset(e.target.value)} style={{ width: 'calc(100% - 4px)', height: 28, marginTop: 4, fontSize: 16 }}>
        <option>Select an asset</option>
        {assetsList.map(a => (
          <option key={a.riceId} value={a.riceId} style={{ fontFamily: 'monospace monospace' }}>
            {removeDots(a.riceId)}
          </option>
        ))}
      </select>
      <Input
        label="To:"
        containerStyle={{ marginTop: 12, width: '100%' }}
        placeholder='Destination address'
        value={destination}
        onChange={(e: any) => setDestination(e.target.value)}
        style={{ width: 'calc(100% - 16px)' }}
      />
      <Row style={{ justifyContent: 'space-between' }}>
        <Input
          label="Gas Price:"
          containerStyle={{ marginTop: 12 }}
          style={{ width: 'calc(100% - 22px)' }}
          value={gasPrice}
          placeholder="Gas price"
          onChange={(e: any) => setGasPrice(e.target.value.replace(/[^0-9.]/g, ''))}
        />
        <Input
          label="Budget:"
          containerStyle={{ marginTop: 12, marginLeft: 8 }}
          style={{ width: 'calc(100% - 22px)' }}
          value={budget}
          placeholder="Budget"
          onChange={(e: any) => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
        />
      </Row>
      <Button style={{ width: '100%', margin: '16px 0px 8px' }} type="submit" variant='dark' onClick={submit}>
        Send
      </Button>
    </Form>
  )
}

export default SendTransactionForm
