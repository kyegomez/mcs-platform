import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

// MCS Platform wallet address
const MCS_WALLET_ADDRESS = new PublicKey('7MaX4muAn8ZQREJxnupm8sgokwFHujgrGfH9Qn81BuEV')

// Current SOL price (you might want to fetch this from an API)
const SOL_PRICE_USD = 100 // This should be fetched from a price API

export interface PaymentDetails {
  amount: number // Amount in USD
  solAmount: number // Amount in SOL
  description: string
  subscriptionTier: 'premium' | 'family'
  billingCycle: 'monthly' | 'annual'
}

export class SolanaPaymentService {
  private connection: Connection
  private lastPriceFetch: number = 0
  private cachedPrice: number = 100
  private readonly CACHE_DURATION = 60000 // 1 minute cache

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed')
  }

  /**
   * Calculate SOL amount based on USD price
   */
  calculateSolAmount(usdAmount: number): number {
    return usdAmount / SOL_PRICE_USD
  }

  /**
   * Get current SOL price from CoinGecko API with caching
   */
  async getCurrentSolPrice(): Promise<number> {
    const now = Date.now()
    
    // Return cached price if it's still valid
    if (now - this.lastPriceFetch < this.CACHE_DURATION) {
      return this.cachedPrice
    }

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MCS-Health-Platform/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.solana || !data.solana.usd) {
        throw new Error('Invalid response format from CoinGecko API')
      }
      
      const solPrice = data.solana.usd
      
      // Update cache
      this.cachedPrice = solPrice
      this.lastPriceFetch = now
      
      console.log(`Current SOL price: $${solPrice} USD`)
      
      return solPrice
    } catch (error) {
      console.error('Error fetching SOL price from CoinGecko:', error)
      // Return cached price if available, otherwise fallback
      return this.cachedPrice
    }
  }

  /**
   * Create subscription payment transaction
   */
  async createSubscriptionPayment(
    wallet: WalletContextState,
    subscriptionTier: 'premium' | 'family',
    billingCycle: 'monthly' | 'annual'
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      console.log("Payment service called with:", {
        hasPublicKey: !!wallet.publicKey,
        hasSignTransaction: !!wallet.signTransaction,
        subscriptionTier,
        billingCycle
      })

      if (!wallet.publicKey) {
        throw new Error('Wallet public key is missing')
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet sign transaction function is missing')
      }

      // Calculate payment amount
      const monthlyPrice = subscriptionTier === 'premium' ? 7.99 : 12.99
      const totalAmount = billingCycle === 'annual' ? monthlyPrice * 12 : monthlyPrice
      
      // Get current SOL price and calculate SOL amount
      const solPrice = await this.getCurrentSolPrice()
      const solAmount = totalAmount / solPrice
      
      console.log(`Payment Details:
        - Subscription: ${subscriptionTier} ${billingCycle}
        - USD Amount: $${totalAmount}
        - SOL Price: $${solPrice}
        - SOL Amount: ${solAmount.toFixed(6)} SOL
        - To Address: ${MCS_WALLET_ADDRESS.toString()}
      `)

      // Create transaction
      const transaction = new Transaction()
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: MCS_WALLET_ADDRESS,
        lamports: Math.floor(solAmount * LAMPORTS_PER_SOL),
      })

      transaction.add(transferInstruction)

      // Get recent blockhash
      console.log("Getting latest blockhash...")
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      console.log("Transaction created, signing...")
      // Sign transaction
      const signedTransaction = await wallet.signTransaction(transaction)
      console.log("Transaction signed successfully")

      // Send transaction
      console.log("Sending transaction to network...")
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize())
      console.log(`Transaction sent with signature: ${signature}`)

      // Wait for confirmation
      console.log("Waiting for transaction confirmation...")
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed')

      if (confirmation.value.err) {
        console.error("Transaction confirmation error:", confirmation.value.err)
        throw new Error('Transaction failed to confirm')
      }

      console.log('Transaction confirmed successfully!')

      return {
        success: true,
        signature,
      }
    } catch (error) {
      console.error('Payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(signature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      })

      if (!transaction) {
        return false
      }

      // Verify transaction was successful
      if (transaction.meta?.err) {
        return false
      }

      // Verify it's a transfer to our wallet
      const transferInstruction = transaction.transaction.message.instructions.find(
        (instruction) => instruction.programId.equals(SystemProgram.programId)
      )

      if (!transferInstruction) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  /**
   * Get payment details for display
   */
  async getPaymentDetails(
    subscriptionTier: 'premium' | 'family',
    billingCycle: 'monthly' | 'annual'
  ): Promise<PaymentDetails> {
    const monthlyPrice = subscriptionTier === 'premium' ? 7.99 : 12.99
    const totalAmount = billingCycle === 'annual' ? monthlyPrice * 12 : monthlyPrice
    const solPrice = await this.getCurrentSolPrice()
    const solAmount = totalAmount / solPrice

    return {
      amount: totalAmount,
      solAmount,
      description: `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} ${billingCycle} subscription`,
      subscriptionTier,
      billingCycle,
    }
  }
} 