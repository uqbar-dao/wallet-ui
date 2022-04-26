import React from 'react'
import Row from '../spacing/Row'
import Link from './Link'
// import logoWithText from '../../assets/img/uqbar-logo-text.png'
import logo from '../../assets/img/logo192.png'
import './Navbar.scss'
import { isMobileCheck } from '../../utils/dimensions'
import Dropdown from '../form/Dropdown'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { BASENAME } from '../../utils/constants'
import { FaWallet, FaKey, FaPaperPlane, FaHistory } from 'react-icons/fa'

const Navbar = () => {
  const isMobile = isMobileCheck()
  const { selectedTown, setNode } = useWalletStore()

  const selectTown = (town: number, setOpen: Function) => () => {
    setNode(town, '~zod')
    setOpen(false)
  }

  const dropdownContent = (setOpen: Function) => (
    <>
     {[0, 1].map((town) => <Text key={town} onClick={selectTown(town, setOpen)}>Town {town}</Text>)}
    </>
  )

  return (
    <Row className='navbar'>
      <Row>
        <div className="nav-link logo">
          <img src={logo} alt="Uqbar Logo" />
        </div>
        <Link className={`nav-link ${window.location.pathname === `${BASENAME}/` || window.location.pathname === BASENAME ? 'selected' : ''}`} href="/">
          {isMobile ? <FaWallet  /> : 'Portfolio'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/accounts') ? 'selected' : ''}`} href="/accounts">
          {isMobile ? <FaKey  /> : 'Accounts'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/send') ? 'selected' : ''}`} href="/send">
          {isMobile ? <FaPaperPlane  /> : 'Send'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/transactions') ? 'selected' : ''}`} href="/transactions">
          {isMobile ? <FaHistory  /> : 'History'}
        </Link>
      </Row>
      <Row className='town'>
        <Dropdown content={dropdownContent}>
          <Text style={{ fontWeight: 600 }}>Town: {selectedTown}</Text>
        </Dropdown>
      </Row>
    </Row>
  )
}

export default Navbar
