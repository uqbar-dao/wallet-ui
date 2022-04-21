import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../form/Button'
import Form from '../form/Form'
import Input from '../form/Input'
import Row from '../spacing/Row'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { TokenBalance } from '../../types/TokenBalance'
import { removeDots } from '../../utils/format'
import { addHexDots } from '../../utils/number'

import './SendTokenForm.scss'

interface SendTokenFormProps {
  formType: 'tokens' | 'nft'
  setSubmitted: (submitted: boolean) => void
}

const SendTokenForm = ({ formType, setSubmitted }: SendTokenFormProps) => {
  const { riceId } = useParams()
  const selectRef = useRef<HTMLSelectElement>(null)
  const { assets, metadata, sendTokens, sendNft } = useWalletStore()
  const [currentFormType, setCurrentFormType] = useState(formType)

  const isNft = currentFormType === 'nft'
  // TODO: base this on whether isNft or not
  const assetsList = useMemo(() => Object.values(assets).reduce((acc, cur) => acc.concat(cur), []), [assets])

  const [selected, setSelected] = useState<TokenBalance | undefined>(assetsList.find(a => a.riceId === riceId))
  const setSelectedAsset = (riceId: string) => setSelected(assetsList.find(a => a.riceId === riceId))
  const [destination, setDestination] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [budget, setBudget] = useState('')
  const [amount, setAmount] = useState('')
  
  const clearForm = () => {
    setSelected(undefined)
    setDestination('')
    setGasPrice('')
    setBudget('')
    setAmount('')
  }

  useEffect(() => {
    if (selected === undefined && riceId) {
      setSelected(assetsList.find(a => a.riceId === riceId))
    }
  }, [assetsList])

  useEffect(() => {
    if (currentFormType !== formType) {
      setCurrentFormType(formType)
      setAmount('')
      setSelected(undefined)
      if (selectRef.current) {
        selectRef.current.value = 'Select an asset'
      }
    }
  }, [formType, currentFormType, setCurrentFormType])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!isNft && (!amount || !Number(amount))) {
      alert('You must enter an amount')
    } else if (!selected) {
      alert('You must select a \'from\' account')
    } else if (!destination) {
      // TODO: validate the destination address
      alert('You must specify a destination address')
    } else if (Number(gasPrice) < 1 || Number(budget) < Number(gasPrice)) {
      alert('You must specify a gas price and budget')
    } else {
      const payload = {
        from: selected.holder,
        to: selected.lord,
        town: selected.town,
        destination: addHexDots(destination),
        gasPrice: Number(gasPrice),
        budget: Number(budget),
      }
      
      if (isNft) {
        // sendNft({ ...payload, nft: selected })
      } else {
        sendTokens({ ...payload, amount: Number(amount), token: selected.data.metadata })
      }

      clearForm()
      setSubmitted(true)
    }
  }

  const tokenMetadata = selected && metadata[selected.data.metadata]

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
        style={{ width: 'calc(100% - 16px)' }}
      />
      {!isNft && <Input
        label="Amount:"
        containerStyle={{ marginTop: 12, width: '100%' }}
        style={{ width: 'calc(100% - 16px)' }}
        value={amount}
        placeholder="Amount"
        onChange={(e: any) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
      />}
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

export default SendTokenForm
