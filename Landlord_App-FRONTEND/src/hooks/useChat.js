import { useContext } from 'react'
import ChatContext from '../contexts/ChatContext.jsx'

export const useChat = () => {
  const context = useContext(ChatContext)
  return context
}

export default useChat