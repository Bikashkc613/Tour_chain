"use client";

import { useEffect, useState } from "react";

type Proof = {
  id: string;
  booking_id: string;
  nft_mint_address: string | null;
  metadata_uri: string | null;
  created_at: string;
  route?: { name?: string } | null;
};

export default function VibePage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/proofs");
      const payload = await res.json();
      if (res.ok) {
        setProofs(payload.proofs ?? []);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  return (
    <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-4xl font-playfair text-himalayan-blue mb-2">Himalayan Vibe</h1>
      <p className="text-himalayan-blue/60 mb-6">Completion proofs and moments from your verified journeys.</p>
      {proofs.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          <article className="bg-white border rounded-2xl p-5">
            <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">Demo: Poon Hill</p>
            <p className="text-sm text-himalayan-blue/70">Mint: 9wQ...demoMint1</p>
            <p className="text-sm text-himalayan-blue/70">URI: ipfs://demo-proof-1</p>
            <p className="text-xs text-himalayan-blue/40 mt-2">Sample completion proof card</p>
          </article>
          <article className="bg-white border rounded-2xl p-5">
            <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">Demo: Annapurna Circuit</p>
            <p className="text-sm text-himalayan-blue/70">Mint: GsM...demoMint2</p>
            <p className="text-sm text-himalayan-blue/70">URI: ipfs://demo-proof-2</p>
            <p className="text-xs text-himalayan-blue/40 mt-2">{loaded ? "Live proofs will appear here." : "Loading proofs..."}</p>
          </article>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {proofs.map((proof) => (
            <article key={proof.id} className="bg-white border rounded-2xl p-5">
              <p className="text-xs uppercase text-himalayan-blue/40 font-bold mb-1">{proof.route?.name ?? "Route proof"}</p>
              <p className="text-sm text-himalayan-blue/70">Mint: {proof.nft_mint_address ?? "pending"}</p>
              <p className="text-sm text-himalayan-blue/70">URI: {proof.metadata_uri ?? "pending"}</p>
              <p className="text-xs text-himalayan-blue/40 mt-2">{new Date(proof.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
