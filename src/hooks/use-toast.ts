"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000 * 60 * 60 // 1 hour, effectively infinite for a session

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    case "REMOVE_TOAST":
      if (!action.toastId) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

let count = 0
const genId = () => (count++).toString()

type ToastContextValue = {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id">) => {
    id: string
    dismiss: () => void
    update: (props: Partial<ToasterToast>) => void
  }
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })
  const toastTimeouts = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  const toast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      const id = genId()
      const update = (props: Partial<ToasterToast>) =>
        dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
      const localDismiss = () => dismiss(id)

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) localDismiss()
          },
        },
      })

      return { id, dismiss: localDismiss, update }
    },
    [dismiss]
  )
    
  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open === false && !toastTimeouts.current.has(toast.id)) {
        const timeout = setTimeout(() => {
          toastTimeouts.current.delete(toast.id)
          dispatch({ type: "REMOVE_TOAST", toastId: toast.id })
        }, TOAST_REMOVE_DELAY)
        toastTimeouts.current.set(toast.id, timeout)
      }
    })
    
    return () => {
        toastTimeouts.current.forEach(clearTimeout);
    }
  }, [state.toasts])

  const value = React.useMemo(() => ({ toasts: state.toasts, toast, dismiss }), [state.toasts, toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}


export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
