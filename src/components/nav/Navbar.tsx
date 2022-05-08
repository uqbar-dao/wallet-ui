import React from 'react'
import Row from '../spacing/Row'
import Link from './Link'
// import logoWithText from '../../assets/img/uqbar-logo-text.png'
import logo from '../../assets/img/logo192.png'
import './Navbar.scss'
import { isMobileCheck } from '../../utils/dimensions'
import Text from '../text/Text'
import useWalletStore from '../../store/walletStore'
import { BASENAME } from '../../utils/constants'
import { FaWallet, FaKey, FaHistory } from 'react-icons/fa'

const Navbar = () => {
  const isMobile = isMobileCheck()
  const { selectedTown, setNode } = useWalletStore()

  const selectTown = (town: number, setOpen: Function) => () => {
    setNode(town, '~zod')
    setOpen(false)
  }

  return (
    <Row className='navbar'>
      <Row>
        <div className="nav-link logo">
          <img src={logo} alt="Uqbar Logo" />
        </div>
        <Link className={`nav-link ${window.location.pathname === `${BASENAME}/` || window.location.pathname === BASENAME ? 'selected' : ''}`} href="/">
          {isMobile ? <FaWallet  /> : 'Assets'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/accounts') ? 'selected' : ''}`} href="/accounts">
          {isMobile ? <FaKey  /> : 'Accounts'}
        </Link>
        <Link className={`nav-link ${window.location.pathname.includes('/transactions') ? 'selected' : ''}`} href="/transactions">
          {isMobile ? <FaHistory  /> : 'History'}
        </Link>
      </Row>
      <Row className='town'>
        <Text style={{ fontWeight: 600 }}>Town: {selectedTown}</Text>
      </Row>
    </Row>
  )
}

export default Navbar
