import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../form/Button'
import Form from '../form/Form'
import Input from '../form/Input'
import Row from '../spacing/Row'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { Token } from '../../types/Token'
import { addHexDots } from '../../utils/number'
import { displayPubKey } from '../../utils/account'

import './SendTokenForm.scss'
import { signLedgerTransaction } from '../../utils/ledger'
import { removeDots } from '../../utils/format'

interface SendTokenFormProps {
  formType: 'tokens' | 'nft'
  setSubmitted: (submitted: boolean) => void
  riceId: string
  nftIndex?: number
}

const SendTokenForm = ({
  formType,
  setSubmitted,
  riceId,
  nftIndex
}: SendTokenFormProps) => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const { assets, metadata, accounts, importedAccounts, setLoading, getPendingHash, sendTokens, sendNft, submitSignedHash } = useWalletStore()
  const [currentFormType, setCurrentFormType] = useState(formType)

  const isNft = currentFormType === 'nft'
  // TODO: base this on whether isNft or not
  const assetsList = useMemo(() => Object.values(assets)
    .reduce((acc, cur) => acc.concat(cur), [])
    .filter(t => isNft ? !t.balance : t.balance),
    [assets, isNft]
  )

  const [selected, setSelected] =
    useState<Token | undefined>(assetsList.find(a => a.riceId === riceId && (!isNft || a.nftInfo?.index === Number(nftIndex))))
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
      setSelected(assetsList.find(a => a.riceId === riceId && (nftIndex === undefined || Number(nftIndex) === a.nftInfo?.index)))
    }
  }, [assetsList]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isNft && (!amount || !Number(amount))) {
      alert('You must enter an amount')
    } else if (selected?.balance && Number(amount) > selected?.balance) {
      alert(`You do not have that many tokens. You have ${selected.balance} tokens.`)
    } else if (!selected) {
      alert('You must select a \'from\' account')
    } else if (!destination) {
      // TODO: validate the destination address
      alert('You must specify a destination address')
    } else if (removeDots(destination) === removeDots(selected.holder)) {
      alert('Destination cannot be the same as the origin')
    } else if (Number(gasPrice) < 1 || Number(budget) < Number(gasPrice)) {
      alert('You must specify a gas price and budget')
    } else if (!accounts.find(a => a.rawAddress === selected.holder) && !importedAccounts.find(a => a.rawAddress === selected.holder)) {
      alert('You do not have this account, did you remove a hardware wallet account?')
    } else {
      const payload = {
        from: selected.holder,
        to: selected.lord,
        town: selected.town,
        salt: selected.data.salt,
        destination: addHexDots(destination),
        gasPrice: Number(gasPrice),
        budget: Number(budget),
      }
      
      if (isNft && selected.nftInfo?.index) {
        await sendNft({ ...payload, nftIndex: selected.nftInfo?.index })
      } else if (!isNft) {
        await sendTokens({ ...payload, amount: Number(amount) })
      }

      clearForm()

      if (importedAccounts.find(a => a.rawAddress === selected.holder)) {
        const { hash, egg } = await getPendingHash()
        console.log('egg', 2, egg)
        setLoading('Please sign the transaction on your Ledger')
        const { ethHash, sig } = await signLedgerTransaction(removeDots(selected.holder), hash, egg)
        setLoading(null)
        if (sig) {
          console.log('sig', 3, sig)
          await submitSignedHash(hash, ethHash, sig)
        } else {
          alert('There was an error signing the transaction with Ledger.')
        }
      }

      setSubmitted(true)
    }
  }

  const tokenMetadata = selected && metadata[selected.data.salt]

  return (
    <Form className="send-token-form" onSubmit={submit}>
      {tokenMetadata && (
        <Row style={{ alignItems: 'center' }}>
          <Text style={{ margin: '8px 12px 0px 0px', fontSize: 14 }}>Token: </Text>
          <Text mono style={{ marginTop: 10 }}>{tokenMetadata.symbol} - rice ID: {displayPubKey(selected?.riceId)}</Text>
        </Row>
      )}
      {isNft && (
        <Row style={{ alignItems: 'center' }}>
          <Text style={{ margin: '8px 12px 0px 0px', fontSize: 14 }}>NFT: </Text>
          <Text mono style={{ marginTop: 10 }}>{`${selected?.nftInfo?.desc || ''} - # ${selected?.nftInfo?.index || ''}`}</Text>
        </Row>
      )}
      <Input
        label="To:"
        containerStyle={{ marginTop: 12, width: '100%' }}
        placeholder='Destination address'
        value={destination}
        onChange={(e: any) => setDestination(e.target.value)}
        style={{ width: 'calc(100% - 24px)' }}
      />
      {!isNft && <Input
        label="Amount:"
        containerStyle={{ marginTop: 12, width: '100%' }}
        style={{ width: 'calc(100% - 24px)' }}
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
