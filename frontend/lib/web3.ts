"use client"

import { ethers } from "ethers"
import { CITREA_CONFIG } from "./contracts"

declare global {
  interface Window {
    ethereum?: any
  }
}

export class Web3Manager {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  async connect(): Promise<{ address: string; signer: ethers.Signer } | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      // Check if we're on the correct network
      const network = await this.provider.getNetwork()
      if (Number(network.chainId) !== CITREA_CONFIG.chainId) {
        await this.switchToCorrectNetwork()
      }

      const address = await this.signer.getAddress()
      return { address, signer: this.signer }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      return null
    }
  }

  async switchToCorrectNetwork(): Promise<boolean> {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CITREA_CONFIG.chainId.toString(16)}` }],
      })
      return true
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CITREA_CONFIG.chainId.toString(16)}`,
                chainName: CITREA_CONFIG.name,
                nativeCurrency: {
                  name: "Citrea Bitcoin",
                  symbol: "cBTC",
                  decimals: 8,
                },
                rpcUrls: [CITREA_CONFIG.rpcUrl],
                blockExplorerUrls: [CITREA_CONFIG.explorerUrl],
              },
            ],
          })
          return true
        } catch (addError) {
          console.error("Failed to add network:", addError)
          return false
        }
      }
      console.error("Failed to switch network:", switchError)
      return false
    }
  }

  getSigner(): ethers.Signer | null {
    return this.signer
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error("Provider not connected")

    const balance = await this.provider.getBalance(address)
    return ethers.formatUnits(balance, 8) // cBTC has 8 decimals
  }

  async isConnected(): Promise<boolean> {
    if (!this.provider) return false

    try {
      const accounts = await this.provider.listAccounts()
      return accounts.length > 0
    } catch {
      return false
    }
  }
}

export const web3Manager = new Web3Manager()
