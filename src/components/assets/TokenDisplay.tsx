import React, { useState } from 'react'
import { FaCaretRight, FaCaretDown } from 'react-icons/fa';
import useWalletStore from '../../store/walletStore';
import { Token } from '../../types/Token'
import { getTownColor } from '../../utils/colors';
import { formatAmount } from '../../utils/number';
import Button from '../form/Button';
import Col from '../spacing/Col';
import Row from '../spacing/Row'
import Text from '../text/Text';
import NftImage from './NftImage';
import './TokenDisplay.scss'

interface TokenDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  tokenBalance: Token
  setRiceId: (riceId: string) => void
  setNftIndex: (nftIndex?: number) => void
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  tokenBalance,
  setRiceId,
  setNftIndex,
  ...props
}) => {
  const { metadata } = useWalletStore()
  const { lord, balance, town, riceId, nftInfo } = tokenBalance
  const [open, setOpen] = useState(false)
  const tokenMetadata = metadata[tokenBalance.data.salt]
  const isToken = Boolean(balance)
  const selectToken = () => {
    setRiceId(riceId)
    setNftIndex(nftInfo?.index)
  }

  return (
    <Col {...props} className={`token-display ${props.className || ''}`} style={{ ...props.style, background: getTownColor(town) }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row>
          <Row onClick={() => setOpen(!open)} style={{ padding: '2px 4px', cursor: 'pointer' }}>
            {open ? <FaCaretDown /> : <FaCaretRight />}
          </Row>
          {isToken ? (
            <Text mono>{tokenMetadata?.symbol || lord}</Text>
          ) : (
            nftInfo && <Text mono>{nftInfo.desc}</Text>
          )}
        </Row>
        <Row>
          {isToken ? (
            <Text>{formatAmount(balance!)}</Text>
            ) : (
            <Text># {nftInfo?.index}</Text>
          )}
          <Button onClick={selectToken} style={{ marginLeft: 16, padding: '4px 8px', fontSize: '14px' }} variant="dark">
            Transfer
          </Button>
        </Row>
      </Row>
      {open && (
        <Col style={{ paddingLeft: 24, paddingTop: 8 }}>
          {tokenMetadata && (
            <>
              <Row>
                <Text style={{ width: 80 }}>Name:</Text>
                <Text mono>{' ' + tokenMetadata.name}</Text>
              </Row>
            </>
          )}
          <Row>
            <Text style={{ width: 80 }}>Town:</Text>
            <Text mono>{' ' + town}</Text>
          </Row>
          <Row>
            <Text style={{ width: 80 }}>Rice ID:</Text>
            <Text mono>{' ' + riceId}</Text>
          </Row>
          <NftImage nftInfo={nftInfo} />
        </Col>
      )}
    </Col>
  )
}

export default TokenDisplay
