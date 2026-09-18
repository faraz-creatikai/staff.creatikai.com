"use client";

import Link from "next/link";
import BrandLogo from "@/app/component/labels/BrandLogo";
import {
  ShieldCheck,
  UserCircle,
  Sparkles,
  ArrowRight,
  Clock3,
  ClipboardCheck,
  MessageCircle,
  Copy,
} from "lucide-react";

const AI_AGENTS = [
  {
    icon: Clock3,
    label: "Smart Workflows",
    detail: "Automates repetitive tasks and flags process gaps before they become a problem.",
  },
  {
    icon: ClipboardCheck,
    label: "Intelligent Triage",
    detail: "Checks every team and client request against business rules automatically.",
  },
  {
    icon: MessageCircle,
    label: "AI Chatbot",
    detail: "Answers routine policy and operational questions instantly, day or night.",
  },
];

export default function PortalSelectionPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-hidden relative flex flex-col">
      {/* --- BACKGROUND DECORATIONS --- */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-50"
        style={{ background: "var(--color-primary-light)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-40"
        style={{ background: "var(--color-accent)" }}
      />

      {/* --- TOP BAR --- */}
      <header className="relative z-10 w-full px-3 py-3 sm:px-10 sm:py-6 flex items-center justify-between">
        <BrandLogo variant="text" className=" h-10 sm:h-14 w-auto object-contain" />
        <a
          href="https://creatikai.com/resourses/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-500 hover:text-[var(--color-primary)] transition-colors"
        >
          Trouble signing in?
        </a>
      </header>

      {/* --- MAIN CONTAINER --- */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 py-3 sm:px-10 sm:py-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm text-sm font-semibold text-gray-600 mb-8">
          <Sparkles size={15} className="text-[var(--color-primary)]" />
          Business management, run partly by AI
        </div>

        {/* Hero Messaging */}
        <div className="text-center max-w-2xl mb-14 space-y-5">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            One team.
            <br />
            <span className="text-[var(--color-primary)]">Two portals. Zero busywork.</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl mx-auto">
            Creatik AI's platform pairs a powerful CRM portal for business operations with a
            self-serve workspace for your team, while AI agents quietly handle
            routine workflows in between.
          </p>
        </div>

        {/* AI Agent Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-14">
          {AI_AGENTS.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl bg-white/70 border border-gray-100 px-4 py-3"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--color-primary-lighter)] flex items-center justify-center">
                <Icon size={16} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* CRM Portal Card — dark console */}
          <Link
            href="/dashboard"
            className="group relative rounded-2xl p-8 border border-white/10 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_-5px_var(--color-primary)]"
            style={{
              background:
                "linear-gradient(155deg, #0f172a 0%, #1e293b 100%)",
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-30 pointer-events-none"
              style={{ background: "var(--color-primary)" }}
            />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                <ShieldCheck size={26} className="text-blue-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">CRM Portal</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                Run your business operations from one intelligent screen. Manage clients, review team performance, and automate workflows — AI surfaces what needs your attention first.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-300" />
                  Client &amp; Lead Management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-300" />
                  Team analytics &amp; reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-300" />
                  AI-prioritized alerts
                </li>
              </ul>
              <div className="flex items-center text-white font-bold gap-2 group-hover:gap-3 transition-all duration-300">
                Enter CRM portal <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          {/* Employee Portal Card — light workspace */}
          <Link
            href="/employee/clock"
            className="group relative bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-[var(--color-primary-light)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-lighter)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center mb-6">
                <UserCircle size={26} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Staff workspace</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                Everything for your workday in one place. Clock in, track
                your hours, request time off, and ask the AI assistant
                anything — from your PTO balance to company policy.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                  Clock in &amp; track hours
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                  Request &amp; follow leave
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                  Ask the AI assistant anytime
                </li>
              </ul>
              <div className="flex items-center text-[var(--color-primary)] font-bold gap-2 group-hover:gap-3 transition-all duration-300">
                Enter staff workspace <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </div>

        <p className="text-sm text-gray-400 font-medium mt-8 text-center">
          Not sure which one is yours? Management and core team members use the CRM
          portal; everyone else uses the staff workspace.
        </p>
      </main>

      {/* Footer Tagline */}
      <footer className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 py-8">

      {/*  <Sparkles size={16} className="text-[var(--color-primary)]" /> */}
     
       <span>Copyright &copy;2026 Creatik AI. All rights reserved.</span>
        
      </footer>
    </div>
  );
}