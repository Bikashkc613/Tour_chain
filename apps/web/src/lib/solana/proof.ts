export async function mintCompletionProof(payload: {
  bookingId: string;
  name: string;
  symbol: string;
  uri: string;
}) {
  const response = await fetch("/api/proof/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to mint completion proof");
  }

  return response.json();
}
