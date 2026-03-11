"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Users, FileText, Cpu } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Metrics {
  uptime: number;
  cpu: { model: string; cores: number };
  memory: { totalMB: number; usedMB: number; freeMB: number; usagePercent: number };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm font-medium">{label}</span></div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

export default function DevDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    apiClient.get<Metrics>("/dev/metrics").then(setMetrics).catch(console.error);
  }, []);

  const uptimeHours = metrics ? Math.floor(metrics.uptime / 3600) : 0;
  const uptimeMins = metrics ? Math.floor((metrics.uptime % 3600) / 60) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">God Mode Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Real-time server metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Uptime"
          value={`${uptimeHours}h ${uptimeMins}m`}
          sub="Server running"
        />
        <StatCard
          icon={<Cpu className="h-5 w-5" />}
          label="CPU Cores"
          value={metrics ? String(metrics.cpu.cores) : "—"}
          sub={metrics?.cpu.model}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Memory Usage"
          value={metrics ? `${metrics.memory.usagePercent}%` : "—"}
          sub={metrics ? `${metrics.memory.usedMB} MB / ${metrics.memory.totalMB} MB` : ""}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Free Memory"
          value={metrics ? `${metrics.memory.freeMB} MB` : "—"}
          sub="Available"
        />
      </div>
    </div>
  );
}
