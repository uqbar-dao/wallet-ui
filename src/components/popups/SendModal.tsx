import React, { useEffect, useState } from 'react'
import Button from '../../components/form/Button'
import Link from '../../components/nav/Link'
import Loader from '../../components/popups/Loader'
import Col from '../../components/spacing/Col'
import Row from '../../components/spacing/Row'
import Text from '../../components/text/Text'
import useWalletStore from '../../store/walletStore'
import { formatHash } from '../../utils/format'
import CopyIcon from '../../components/transactions/CopyIcon';
import { getStatus } from '../../utils/constants'
import SendTokenForm from '../../components/forms/SendTokenForm'
import SendRawTransactionForm from '../../components/forms/SendRawTransactionForm'
import { Transaction } from '../../types/Transaction'
import Modal, { ModalProps } from './Modal'

import './SendModal.scss'

export type SendType = 'tokens' | 'nft' | 'data';

const titles = {
  tokens: 'Tokens',
  nft: 'NFT',
  data: 'Raw Data',
}

interface SelectorProps {
  title: SendType
  active: boolean
  onClick: () => void
}

const Selector = ({
  title,
  active,
  onClick,
}: SelectorProps) => {
  return (
    <Col onClick={onClick} className="selector">
      <Text className={active ? 'active' : 'inactive'}>{titles[title]}</Text>
    </Col>
  );
}

interface SendModalProps extends ModalProps {
  riceId?: string
  nftIndex?: number
  formType: SendType
}

const SendModal = ({
  riceId = '',
  nftIndex,
  show,
  formType,
  hide
}: SendModalProps) => {
  const { transactions } = useWalletStore()
  const [txn, setTxn] = useState<Transaction | undefined>()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const targetTxn = txn
      ? transactions.find(({ hash }) => hash === txn.hash)
      : transactions.find(({ status }) => status >= 100)

    if (targetTxn) {
      setTxn(targetTxn)
    }
  }, [transactions]) // eslint-disable-line react-hooks/exhaustive-deps

  const getForm = () => {
    switch (formType) {
      case 'tokens':
        return <SendTokenForm {...{ setSubmitted, riceId, formType: 'tokens' }} />
      case 'nft':
        return <SendTokenForm {...{ setSubmitted, riceId, nftIndex, formType: 'nft' }} />
      case 'data':
        return <SendRawTransactionForm {...{ setSubmitted }} />
    }
  }

  const hideModal = () => {
    hide();
    setSubmitted(false);
  }


  return (
    <Modal show={show} hide={hideModal} className='send-view'>
      <h4 style={{ marginTop: 0 }}>Send</h4>
      {submitted ? (
        <Col className='submission-confirmation'>
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Transaction {txn?.status === 0 ? 'Complete' : 'Sent'}!</h4>
          {txn ? (
            <>
              <Row style={{ marginBottom: 8 }}>
                <Text style={{ marginRight: 18 }}>Hash: </Text>
                <Link style={{ maxWidth: 'calc(100% - 100px)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} href={`/transactions/${txn.hash}`}>
                  <Text mono>{formatHash(txn.hash)}</Text>
                </Link>
                <CopyIcon text={txn.hash} />
              </Row>
              <Row style={{ marginBottom: 16 }}>
                <Text style={{ marginRight: 9 }}>Status: </Text>
                <Text mono>{getStatus(txn.status)}</Text>
                {(txn.status === 100 || txn.status === 101) && <Loader style={{ marginLeft: 16 }} />}
              </Row>
            </>
          ) : (
            <Text style={{ marginBottom: 16 }}>
              Your transaction should show up here in a few seconds. If it does not, please go to
              <Link href="/transactions" style={{ marginLeft: 4 }}>History</Link>
              .
            </Text>
          )}
          <Button onClick={hideModal}>Done</Button>
        </Col>
      ) : (
        getForm()
      )}
    </Modal>
  )
}

export default SendModal
