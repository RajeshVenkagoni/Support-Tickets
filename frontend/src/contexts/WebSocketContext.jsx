import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'

const WebSocketContext = createContext(null)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export function WebSocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState({}) // ticketId -> { userId, userName, timeout }
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const listenersRef = useRef(new Map())

  const connect = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8004/ws'
    const token = localStorage.getItem('access_token')
    
    try {
      const ws = new WebSocket(`${wsUrl}/?token=${token}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 3000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }, [isAuthenticated])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const handleMessage = useCallback((data) => {
    const { type, payload } = data
    
    switch (type) {
      case 'stats_update':
        notifyListeners('stats', payload)
        break
      case 'ticket_update':
        notifyListeners(`ticket:${payload.id}`, payload)
        notifyListeners('tickets', payload)
        break
      case 'new_comment':
        notifyListeners(`comments:${payload.ticket_id}`, payload)
        break
      case 'typing':
        handleTyping(payload)
        break
      case 'stop_typing':
        handleStopTyping(payload)
        break
      default:
        notifyListeners(type, payload)
    }
  }, [])

  const handleTyping = useCallback((payload) => {
    const { ticket_id, user_id, user_name } = payload
    
    setTypingUsers(prev => {
      // Clear existing timeout if any
      if (prev[ticket_id]?.timeout) {
        clearTimeout(prev[ticket_id].timeout)
      }
      
      // Set new timeout to clear typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        setTypingUsers(current => ({
          ...current,
          [ticket_id]: null
        }))
      }, 3000)
      
      return {
        ...prev,
        [ticket_id]: { userId: user_id, userName: user_name, timeout }
      }
    })
  }, [])

  const handleStopTyping = useCallback((payload) => {
    const { ticket_id } = payload
    setTypingUsers(prev => {
      if (prev[ticket_id]?.timeout) {
        clearTimeout(prev[ticket_id].timeout)
      }
      return { ...prev, [ticket_id]: null }
    })
  }, [])

  const notifyListeners = useCallback((event, data) => {
    const listeners = listenersRef.current.get(event) || []
    listeners.forEach(callback => callback(data))
  }, [])

  const subscribe = useCallback((event, callback) => {
    const listeners = listenersRef.current.get(event) || []
    listenersRef.current.set(event, [...listeners, callback])
    
    // Return unsubscribe function
    return () => {
      const currentListeners = listenersRef.current.get(event) || []
      listenersRef.current.set(
        event,
        currentListeners.filter(cb => cb !== callback)
      )
    }
  }, [])

  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }))
    }
  }, [])

  const sendTyping = useCallback((ticketId) => {
    send('typing', { ticket_id: ticketId })
  }, [send])

  const sendStopTyping = useCallback((ticketId) => {
    send('stop_typing', { ticket_id: ticketId })
  }, [send])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }
    
    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])

  const value = {
    connected,
    typingUsers,
    subscribe,
    send,
    sendTyping,
    sendStopTyping,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
