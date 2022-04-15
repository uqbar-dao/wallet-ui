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

const Navbar = () => {
  const isMobile = isMobileCheck()
  const { selectedTown } = useWalletStore()

  const dropdownContent = (setOpen: Function) => (
    <>
      <Text onClick={() => setOpen(false)}>Town 1</Text>
      <Text>Town 2</Text>
      <Text>Town 3</Text>
    </>
  )

  return (
    <Row className='navbar'>
      <Row>
        <div className="nav-link logo">
          <img src={logo} alt="Uqbar Logo" />
        </div>
        <Link className={`nav-link ${window.location.pathname === `${BASENAME}/` ? 'selected' : ''}`} href="/">Portfolio</Link>
        <Link className={`nav-link ${window.location.pathname.includes('/accounts') ? 'selected' : ''}`} href="/accounts">Accounts</Link>
        <Link className={`nav-link ${window.location.pathname.includes('/send') ? 'selected' : ''}`} href="/send">Send</Link>
        <Link className={`nav-link ${window.location.pathname.includes('/transactions') ? 'selected' : ''}`} href="/transactions">History</Link>
      </Row>
      <Row style={{ marginRight: 4 }}>
        <Dropdown content={dropdownContent}>
          <Text style={{ fontWeight: 600 }}>Town: {selectedTown}</Text>
        </Dropdown>
      </Row>
    </Row>
  )
}

export default Navbar
