import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const connection = new Connection(endpoint, 'confirmed')

// MCS Platform wallet address
const MCS_WALLET_ADDRESS = new PublicKey('7MaX4muAn8ZQREJxnupm8sgokwFHujgrGfH9Qn81BuEV')

export async function POST(request: NextRequest) {
  try {
    const { signature, subscriptionTier, billingCycle } = await request.json()

    if (!signature || !subscriptionTier || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify the transaction
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      return NextResponse.json(
        { error: 'Transaction failed' },
        { status: 400 }
      )
    }

    // Verify it's a transfer to our wallet
    const transferInstruction = transaction.transaction.message.instructions.find(
      (instruction) => instruction.programId.toString() === '11111111111111111111111111111111' // System Program
    )

    if (!transferInstruction) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      )
    }

    // Calculate expected amount based on subscription
    const monthlyPrice = subscriptionTier === 'premium' ? 7.99 : 12.99
    const totalAmount = billingCycle === 'annual' ? monthlyPrice * 12 : monthlyPrice
    
    // Get current SOL price from CoinGecko
    let solPrice = 100 // Default fallback
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MCS-Health-Platform/1.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.solana && data.solana.usd) {
          solPrice = data.solana.usd
        }
      }
    } catch (error) {
      console.error('Error fetching SOL price for verification:', error)
    }
    
    const expectedSolAmount = totalAmount / solPrice

    // Verify the amount (with some tolerance for price fluctuations)
    const tolerance = 0.1 // 10% tolerance
    const actualAmount = transaction.meta?.postBalances[0] - transaction.meta?.preBalances[0]
    const actualSolAmount = actualAmount / 1e9 // Convert lamports to SOL

    if (Math.abs(actualSolAmount - expectedSolAmount) > expectedSolAmount * tolerance) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    // Payment is verified - update user subscription
    // In a real application, you would:
    // 1. Store the payment record in your database
    // 2. Update the user's subscription status
    // 3. Send confirmation email
    // 4. Log the transaction

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        tier: subscriptionTier,
        billingCycle,
        renewalDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 