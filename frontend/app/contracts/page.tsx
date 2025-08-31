import { WalletConnect } from "@/components/wallet-connect"
import { ContractInteractions } from "@/components/contract-interactions"

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Smart Contract Interactions</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            Interact directly with the deployed AI governance contracts on Citrea testnet. Register as an agent, submit
            analyses, and participate in consensus.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* Contract Interactions */}
        <ContractInteractions />
      </div>
    </div>
  )
}
