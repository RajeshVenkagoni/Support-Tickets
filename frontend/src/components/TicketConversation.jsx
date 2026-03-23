import { useEffect, useRef } from 'react'
import { User, Shield, Bot } from 'lucide-react'
import { formatDate, getInitials } from '../utils/format.js'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function TicketConversation({ comments, currentUser, typingUser }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  if (!comments?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <MessageSquareIcon className="w-12 h-12 mb-3" />
        <p>No comments yet</p>
        <p className="text-sm">Be the first to respond</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => {
        const isCustomer = comment.author_role === 'customer'
        const isInternal = comment.is_internal
        const isCurrentUser = comment.author_id === currentUser?.id

        return (
          <div
            key={comment.id || index}
            className={cn(
              "flex gap-3",
              isCustomer ? "justify-start" : "justify-end"
            )}
          >
            {/* Avatar - only for customer on left */}
            {isCustomer && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                isInternal
                  ? "bg-yellow-50 border border-yellow-200 rounded-tl-none"
                  : isCustomer
                  ? "bg-white border border-slate-200 rounded-tl-none"
                  : "bg-primary-600 text-white rounded-tr-none"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isCustomer || isInternal ? "text-slate-900" : "text-white"
                )}>
                  {comment.author_name}
                </span>
                
                {isInternal && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
                    <Shield className="w-3 h-3" />
                    Internal
                  </span>
                )}
                
                <span className={cn(
                  "text-xs",
                  isCustomer || isInternal ? "text-slate-400" : "text-primary-100"
                )}>
                  {formatDate(comment.created_at)}
                </span>
              </div>

              {/* Content */}
              <div className={cn(
                "text-sm whitespace-pre-wrap",
                isCustomer || isInternal ? "text-slate-700" : "text-white"
              )}>
                {comment.content}
              </div>
            </div>

            {/* Avatar - only for agent on right */}
            {!isCustomer && (
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  isCurrentUser ? "bg-primary-100 text-primary-700" : "bg-slate-200 text-slate-600"
                )}>
                  {getInitials(comment.author_name)}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{typingUser} is typing</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function MessageSquareIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}
