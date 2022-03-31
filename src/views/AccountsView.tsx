import React from 'react'
import Button from '../components/form/Button'
import Container from '../components/spacing/Container'

import './AccountsView.scss'

const AccountsView = () => {
  return (
    <Container className='accounts-view'>
      <h2>Accounts</h2>
      <Button>
        + Add Account
      </Button>
    </Container>
  )
}

export default AccountsView
