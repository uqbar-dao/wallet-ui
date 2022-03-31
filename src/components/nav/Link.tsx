import React from 'react'
import './Link.scss'

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const Link: React.FC<LinkProps> = (props) => {
  return (
    <a {...props} className={`link ${props.className || ''}`}>
      {props.children}
    </a>
  )
}

export default Link
