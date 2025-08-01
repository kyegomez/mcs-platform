"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, Stethoscope, Brain, Heart, Eye, Baby, Pill, Microscope } from "lucide-react"
import Head from "next/head"

const medicalSpecialists = [
  {
    id: "medical-diagnoser",
    name: "Medical Diagnoser",
    specialty: "Comprehensive Diagnosis",
    description: "Specializes in comprehensive medical diagnosis and differential diagnosis",
    icon: <Stethoscope className="h-5 w-5" />,
    iconColor: "#3B82F6",
  },
  {
    id: "medical-verifier",
    name: "Medical Verifier", 
    specialty: "Diagnostic Validation",
    description: "Validates and cross-checks diagnostic conclusions and treatment plans",
    icon: <Brain className="h-5 w-5" />,
    iconColor: "#10B981",
  },
  {
    id: "treatment-specialist",
    name: "Treatment Specialist",
    specialty: "Treatment Planning",
    description: "Provides comprehensive treatment solutions and management plans",
    icon: <Pill className="h-5 w-5" />,
    iconColor: "#F59E0B",
  },
]

export default function GroupChatIndexPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSpecialists = medicalSpecialists.filter(
    (specialist) =>
      specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <Head>
        <title>Medical Group Consultation | Multi-Agent Healthcare | MCS</title>
        <meta
          name="description"
          content="Get comprehensive medical consultations with multiple AI specialists working together. Expert diagnosis, verification, and treatment planning in one session."
        />
        <meta
          name="keywords"
          content="medical group consultation, AI medical specialists, collaborative healthcare, multi-agent medical diagnosis, treatment planning"
        />
        <link rel="canonical" href="https://mcs-health.vercel.app/groupchat" />
      </Head>

      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* Header */}
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-light text-foreground mb-2">Medical Group Consultation</h1>
          <p className="text-muted-foreground font-light">Get comprehensive care from multiple AI specialists</p>
        </header>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search specialists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground"
            aria-label="Search medical specialists"
          />
        </div>

        {/* Healthcare Assistant Promo Card */}
        <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Personal Healthcare Assistant</h2>
            <p className="text-lg text-muted-foreground mb-4">Powered by AI</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive medical consultations with our AI-powered team of specialists. 
              Our collaborative approach ensures you receive thorough diagnosis, validation, and treatment recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Expert Diagnosis</h3>
              <p className="text-xs text-muted-foreground">Comprehensive symptom analysis</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Quality Assurance</h3>
              <p className="text-xs text-muted-foreground">Cross-verified conclusions</p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <Pill className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Treatment Plans</h3>
              <p className="text-xs text-muted-foreground">Personalized care recommendations</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/groupchat/consultation">
              <Button className="btn-primary rounded-xl px-8 py-4 text-lg font-medium btn-interactive">
                <Users className="h-5 w-5 mr-2" />
                Start Your Consultation
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              Get started with your AI-powered healthcare team
            </p>
          </div>
        </div>

        {/* Specialists Grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Medical Specialists Directory"
        >
          {filteredSpecialists.map((specialist) => (
            <Card key={specialist.id} className="group cursor-default border-0 bg-background/50 hover:bg-accent transition-all duration-200 h-full">
              <CardContent className="p-6">
                <article className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: specialist.iconColor + "20",
                    }}
                  >
                    <div style={{ color: specialist.iconColor }}>
                      {specialist.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      {specialist.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-light mb-2">{specialist.specialty}</p>
                    <p className="text-xs text-muted-foreground/70 font-light line-clamp-2">{specialist.description}</p>
                  </div>
                </article>
              </CardContent>
            </Card>
          ))}
        </section>

        {filteredSpecialists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-light">No specialists found</p>
          </div>
        )}

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-2xl font-light text-foreground mb-6 text-center">How Group Consultation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Describe Your Symptoms</h3>
              <p className="text-sm text-muted-foreground">Tell us about your health concerns and symptoms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">AI Specialists Collaborate</h3>
              <p className="text-sm text-muted-foreground">Multiple AI agents work together to analyze your case</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Get Comprehensive Results</h3>
              <p className="text-sm text-muted-foreground">Receive diagnosis, verification, and treatment recommendations</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
} 