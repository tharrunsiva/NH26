"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import OrderCard from "../components/OrderCard";
import ChatWidget from "../components/ChatWidget";
import { orders } from "../utils/orders";

export default function HomePage() {
  const [activeOrder, setActiveOrder] = useState(null);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <section className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel overflow-hidden rounded-[36px] p-6 md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lagoon">
                Premium Support
              </p>
              <h1
                className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Complaint resolution that feels fast, multilingual, and deeply human.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                Review orders, launch the floating AI assistant, detect severity automatically,
                and escalate unresolved cases into live agent queues in real time.
              </p>
            </div>
            <div className="rounded-[30px] bg-ink p-6 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Hackathon Highlights</p>
              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-3xl font-semibold">4 Languages</p>
                  <p className="text-sm text-white/70">English, Hindi, Tamil, Tanglish support</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">AI Triage</p>
                  <p className="text-sm text-white/70">Severity, category, incident analysis, ticketing</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold">Realtime Ops</p>
                  <p className="text-sm text-white/70">Socket-powered dashboard notifications</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Orders
              </p>
              <h2
                className="mt-2 text-3xl font-semibold text-ink"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Amazon-style support launchpad
              </h2>
            </div>
            <a href="/dashboard" className="rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-ink">
              Open Agent Dashboard
            </a>
          </div>

          <div className="grid gap-5">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} onReportIssue={setActiveOrder} />
            ))}
          </div>
        </section>
      </section>

      <ChatWidget order={activeOrder} />
    </main>
  );
}
