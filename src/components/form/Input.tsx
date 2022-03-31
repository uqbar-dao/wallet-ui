import React from 'react'
import './Input.scss'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // ref?: any
}

const Input: React.FC<InputProps> = (props) => {
  return (
    <input {...props} className={`input ${props.className || ''}`} />
  )
}

export default Input
