import React, { useEffect, useState } from 'react'
import * as IPFS from 'ipfs-core'
import { NftInfo } from '../../types/Token'
import './NftImage.scss'

interface NftImageProps extends React.HTMLAttributes<HTMLDivElement> {
  nftInfo?: NftInfo
}

const NftImage: React.FC<NftImageProps> = ({ nftInfo, ...props }) => {
  const [imageSource, setImageSource] = useState<string | undefined>()
  
  useEffect(() => {
    if (nftInfo?.URI) {
      (async function() {
        // prereqs
        const node = await IPFS.create()
        const cid = nftInfo.URI

        // load the raw data from js-ipfs (>=0.40.0)
        let bufs = []
        for await (const buf of node.cat(cid)) {
          bufs.push(buf)
        }
        const data = Buffer.concat(bufs)

        const blob = new Blob([data], { type: 'image/jpg' })
        setImageSource(window.URL.createObjectURL(blob))
      })()
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
