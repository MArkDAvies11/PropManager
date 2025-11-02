import { useState } from 'react'

export const usePayments = () => {
  const [payments, setPayments] = useState([])
  
  return {
    payments,
    setPayments
  }
}

export default usePayments