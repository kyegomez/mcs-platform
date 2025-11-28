"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Head from "next/head"

export default function GroupChatIndexPage() {
  return (
    <>
      <Head>
        <title>Group Consultation | MCS</title>
        <meta
          name="description"
          content="Get comprehensive medical consultations with multiple AI specialists working together."
        />
        <link rel="canonical" href="https://mcs-health.vercel.app/groupchat" />
      </Head>

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-blue-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-light tracking-tight text-foreground">
                Group Consultation
              </h1>
              <p className="text-xl text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
                Multiple AI specialists collaborate to provide comprehensive medical insights.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link href="/groupchat/consultation">
              <Button 
                size="lg" 
                className="h-14 px-12 text-lg font-medium rounded-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Consultation
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Available 24/7
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 