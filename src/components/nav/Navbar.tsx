import React from 'react'
import Row from '../spacing/Row'
import Link from './Link'
import './Navbar.scss'

const Navbar = () => {

  return (
    <Row className='navbar'>
      <Link className={`nav-link ${window.location.pathname === '/' ? 'selected' : ''}`} href="/">Portfolio</Link>
      <Link className={`nav-link ${window.location.pathname.includes('/accounts') ? 'selected' : ''}`} href="/accounts">Accounts</Link>
      <Link className={`nav-link ${window.location.pathname === '/send' ? 'selected' : ''}`} href="/send">Send</Link>
    </Row>
  )
}

export default Navbar
