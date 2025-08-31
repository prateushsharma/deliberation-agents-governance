"use client"

import { useState, useEffect, useCallback } from "react"
import type { ethers } from "ethers"
import { web3Manager } from "@/lib/web3"

export interface WalletState {
  address: string | null
  balance: string | null
  isConnected: boolean
  isConnecting: boolean
  signer: ethers.Signer | null
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    signer: null,
  })

  const connect = useCallback(async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true }))

    try {
      const result = await web3Manager.connect()

      if (result) {
        const balance = await web3Manager.getBalance(result.address)

        setWalletState({
          address: result.address,
          balance,
          isConnected: true,
          isConnecting: false,
          signer: result.signer,
        })
      } else {
        setWalletState((prev) => ({ ...prev, isConnecting: false }))
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setWalletState((prev) => ({ ...prev, isConnecting: false }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      signer: null,
    })
  }, [])

  const refreshBalance = useCallback(async () => {
    if (walletState.address) {
      try {
        const balance = await web3Manager.getBalance(walletState.address)
        setWalletState((prev) => ({ ...prev, balance }))
      } catch (error) {
        console.error("Failed to refresh balance:", error)
      }
    }
  }, [walletState.address])

  // Check if already connected on mount
  useEffect(() => {
    async function checkConnection() {
      const isConnected = await web3Manager.isConnected()
      if (isConnected) {
        await connect()
      }
    }

    checkConnection()
  }, [connect])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          connect()
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [connect, disconnect])

  return {
    ...walletState,
    connect,
    disconnect,
    refreshBalance,
  }
}
