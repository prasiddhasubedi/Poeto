"use client"

import * as React from "react"
import { X, CheckCircle, XCircle, Info } from "lucide-react"
import { useToast, type Toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = 
    toast.type === "success" ? CheckCircle :
    toast.type === "error" ? XCircle :
    Info

  const colorClasses = 
    toast.type === "success" ? "bg-green-500" :
    toast.type === "error" ? "bg-red-500" :
    "bg-blue-500"

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg text-white animate-in slide-in-from-right",
        colorClasses
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
