"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ExternalLink, RefreshCw } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { CITREA_CONFIG } from "@/lib/contracts"

export function WalletConnect() {
  const { address, balance, isConnected, isConnecting, connect, disconnect, refreshBalance } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Wallet className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium">{formatAddress(address)}</div>
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  {balance} cBTC
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshBalance}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <RefreshCw className="h-3 w-3 text-slate-500 hover:text-slate-300" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                Connected
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                asChild
              >
                <a href={`${CITREA_CONFIG.explorerUrl}/address/${address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-600/50 rounded-full flex items-center justify-center">
              <Wallet className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="text-white font-medium">Connect Wallet</div>
              <div className="text-slate-400 text-sm">Connect to interact with contracts</div>
            </div>
          </div>

          <Button onClick={connect} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
