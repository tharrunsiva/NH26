"use client";

import { motion } from "framer-motion";

export default function OrderCard({ order, onReportIssue }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-panel overflow-hidden rounded-[28px]"
    >
      <div className="grid gap-5 p-4 md:grid-cols-[120px_1fr_auto] md:p-6">
        <div className="overflow-hidden rounded-2xl bg-white/70">
          <img src={order.image} alt={order.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-lagoon">
              {order.status}
            </span>
            <span className="text-sm text-slate-500">{order.orderId}</span>
          </div>
          <div>
            <h3
              className="text-2xl font-semibold text-ink"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {order.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{order.eta}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => onReportIssue(order)}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
          >
            Report Issue
          </button>
        </div>
      </div>
    </motion.article>
  );
}
