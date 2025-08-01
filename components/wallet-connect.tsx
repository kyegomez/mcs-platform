"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function WalletConnect() {
  const { publicKey, disconnect } = useWallet()

  if (!publicKey) {
    return (
      <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-lg !px-4 !py-2 !font-medium">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Phantom
      </WalletMultiButton>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </Badge>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="text-xs"
      >
        <LogOut className="w-3 h-3 mr-1" />
        Disconnect
      </Button>
    </div>
  )
} 