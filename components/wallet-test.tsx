"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Check, X } from 'lucide-react'

export function WalletTest() {
  const wallet = useWallet()

  const testWalletConnection = () => {
    console.log("=== Wallet Test ===")
    console.log("Connected:", wallet.connected)
    console.log("Public Key:", wallet.publicKey?.toString())
    console.log("Has signTransaction:", !!wallet.signTransaction)
    console.log("Has signAllTransactions:", !!wallet.signAllTransactions)
    console.log("Wallet Name:", wallet.wallet?.adapter.name)
    console.log("Wallet Ready:", wallet.wallet?.adapter.ready)
    console.log("==================")
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Connection Status</label>
            <div className="flex items-center gap-2 mt-1">
              {wallet.connected ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Connected</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Not Connected</span>
                </>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Wallet Name</label>
            <p className="text-foreground mt-1">{wallet.wallet?.adapter.name || 'Unknown'}</p>
          </div>

          {wallet.connected && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Public Key</label>
                <p className="text-foreground font-mono text-sm mt-1 break-all">
                  {wallet.publicKey?.toString() || 'None'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sign Functions</label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={wallet.signTransaction ? "default" : "secondary"} className="text-xs">
                    signTransaction: {wallet.signTransaction ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={wallet.signAllTransactions ? "default" : "secondary"} className="text-xs">
                    signAllTransactions: {wallet.signAllTransactions ? '✓' : '✗'}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>

        <Button onClick={testWalletConnection} className="w-full">
          Test Wallet Connection
        </Button>

        <div className="text-xs text-muted-foreground">
          Check the browser console for detailed wallet information
        </div>
      </CardContent>
    </Card>
  )
} 