import React, { useEffect, useState } from 'react'
import { NftInfo } from '../../types/Token'
import { ipfsConnection } from '../../utils/ipfs'
import './NftImage.scss'

interface NftImageProps extends React.HTMLAttributes<HTMLDivElement> {
  nftInfo?: NftInfo
}

const NftImage: React.FC<NftImageProps> = ({ nftInfo, ...props }) => {
  const [imageSource, setImageSource] = useState<string | undefined>()
  
  useEffect(() => {
    if (nftInfo?.URI) {
      if (nftInfo.URI.includes('ipfs')) {
        (async function() {
          // prereqs
          const node = await ipfsConnection
          const cid = nftInfo.URI.replace('ipfs://', '/ipfs/')
  
          // load the raw data from js-ipfs (>=0.40.0)
          let bufs = []
          for await (const buf of node.cat(cid)) {
            bufs.push(buf)
          }
          const data = Buffer.concat(bufs)
  
          const blob = new Blob([data], { type: 'image/jpg' })
          setImageSource(window.URL.createObjectURL(blob))
        })()
      } else {
        setImageSource(nftInfo.URI)
      }
    }
  }, [nftInfo])

  if (!nftInfo) {
    return null
  }

  return (
    <img src={imageSource} className="nft-image" alt={nftInfo.desc} />
  )
}

export default NftImage
