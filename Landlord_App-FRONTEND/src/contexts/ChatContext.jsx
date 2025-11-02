import React, { createContext } from 'react'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  return (
    <ChatContext.Provider value={{}}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContext