"use client";

import { useEffect, useState } from "react";

type Dispute = {
  id: string;
  category: string;
  status: string;
  description: string;
  created_at: string;
};

export default function DAODashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/disputes");
      if (!response.ok) return;
      const payload = await response.json();
      setDisputes(payload.disputes ?? []);
      setLoaded(true);
    };
    void load();
  }, []);

  return (
    <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-4xl font-playfair text-himalayan-blue mb-2">Trust DAO</h1>
      <p className="text-himalayan-blue/60 mb-6">Current disputes and governance-relevant events.</p>
      <div className="space-y-3">
        {disputes.length === 0 ? (
          <>
            <article className="bg-white border rounded-2xl p-5">
              <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">Demo Case - Service Quality</p>
              <p className="font-semibold">Guide arrived late at checkpoint; tourist requests partial refund.</p>
              <p className="text-sm text-himalayan-blue/60 mt-2">Status: under_review</p>
            </article>
            <article className="bg-white border rounded-2xl p-5">
              <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">Demo Case - Billing</p>
              <p className="font-semibold">Escrow release mismatch reported by operator.</p>
              <p className="text-sm text-himalayan-blue/60 mt-2">{loaded ? "Status: open" : "Loading..."}</p>
            </article>
          </>
        ) : (
          disputes.map((dispute) => (
            <article key={dispute.id} className="bg-white border rounded-2xl p-5">
              <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">{dispute.category}</p>
              <p className="font-semibold">{dispute.description}</p>
              <p className="text-sm text-himalayan-blue/60 mt-2">Status: {dispute.status}</p>
              <p className="text-xs text-himalayan-blue/40 mt-1">{new Date(dispute.created_at).toLocaleString()}</p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
