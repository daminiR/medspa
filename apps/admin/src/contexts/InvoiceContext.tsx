'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface InvoiceLineItem {
  id: string
  type: 'service' | 'product' | 'injectable'
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  metadata?: {
    productId?: string
    zones?: Array<{ id: string; name: string; units: number }>
    customPoints?: Array<{ id: string; label?: string; units: number }>
    lotNumber?: string
    expirationDate?: string
    notes?: string
    productType?: 'neurotoxin' | 'filler'
    syringeCount?: number
    totalUnits?: number
    totalVolume?: number
  }
}

export interface Invoice {
  id: string
  patientId: string
  patientName: string
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'cancelled'
  lineItems: InvoiceLineItem[]
  subtotal: number
  tax: number
  discount: number
  tip: number
  total: number
  createdAt: Date
  updatedAt: Date
  notes?: string
  paymentMethod?: string
  appointmentId?: string
}

interface InvoiceContextType {
  currentInvoice: Invoice | null
  invoices: Invoice[]
  createInvoice: (patientId: string, patientName: string) => Invoice
  addLineItem: (item: InvoiceLineItem) => void
  removeLineItem: (itemId: string) => void
  updateLineItem: (itemId: string, updates: Partial<InvoiceLineItem>) => void
  updateInvoice: (updates: Partial<Invoice>) => void
  clearCurrentInvoice: () => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  calculateTotals: () => void
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const createInvoice = (patientId: string, patientName: string): Invoice => {
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      patientId,
      patientName,
      status: 'draft',
      lineItems: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      tip: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setCurrentInvoice(newInvoice)
    return newInvoice
  }

  const addLineItem = (item: InvoiceLineItem) => {
    if (!currentInvoice) return
    
    const updatedInvoice = {
      ...currentInvoice,
      lineItems: [...currentInvoice.lineItems, item],
      updatedAt: new Date()
    }
    
    calculateTotalsForInvoice(updatedInvoice)
    setCurrentInvoice(updatedInvoice)
  }

  const removeLineItem = (itemId: string) => {
    if (!currentInvoice) return
    
    const updatedInvoice = {
      ...currentInvoice,
      lineItems: currentInvoice.lineItems.filter(item => item.id !== itemId),
      updatedAt: new Date()
    }
    
    calculateTotalsForInvoice(updatedInvoice)
    setCurrentInvoice(updatedInvoice)
  }

  const updateLineItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    if (!currentInvoice) return
    
    const updatedInvoice = {
      ...currentInvoice,
      lineItems: currentInvoice.lineItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
      updatedAt: new Date()
    }
    
    calculateTotalsForInvoice(updatedInvoice)
    setCurrentInvoice(updatedInvoice)
  }

  const updateInvoice = (updates: Partial<Invoice>) => {
    if (!currentInvoice) return
    
    const updatedInvoice = {
      ...currentInvoice,
      ...updates,
      updatedAt: new Date()
    }
    
    setCurrentInvoice(updatedInvoice)
  }

  const calculateTotalsForInvoice = (invoice: Invoice) => {
    const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxAmount = subtotal * 0.0825 // 8.25% tax rate (configurable)
    const total = subtotal + taxAmount + invoice.tip - invoice.discount
    
    invoice.subtotal = subtotal
    invoice.tax = taxAmount
    invoice.total = total
  }

  const calculateTotals = () => {
    if (!currentInvoice) return
    calculateTotalsForInvoice(currentInvoice)
  }

  const clearCurrentInvoice = () => {
    setCurrentInvoice(null)
  }

  return (
    <InvoiceContext.Provider
      value={{
        currentInvoice,
        invoices,
        createInvoice,
        addLineItem,
        removeLineItem,
        updateLineItem,
        updateInvoice,
        clearCurrentInvoice,
        setCurrentInvoice,
        calculateTotals
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoice() {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider')
  }
  return context
}