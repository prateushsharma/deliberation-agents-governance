"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Brain, Activity } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">AI Governance</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/proposals" className="text-slate-300 hover:text-white transition-colors">
              Proposals
            </Link>
            <Link href="/agents" className="text-slate-300 hover:text-white transition-colors">
              AI Agents
            </Link>
            {/* <CHANGE> Added contracts page link */}
            <Link href="/contracts" className="text-slate-300 hover:text-white transition-colors">
              Contracts
            </Link>
            
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Activity className="h-4 w-4 mr-2" />
              Live Status
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/50 rounded-lg mt-2">
              <Link\
