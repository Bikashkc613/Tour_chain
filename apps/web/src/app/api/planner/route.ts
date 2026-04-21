import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { nfts, trekBalance } = await request.json();

    // In a real implementation, we would pass this profile to an LLM
    // For the hackathon demo, we use heuristic-based "AI" logic
    
    let recommendation = "";
    let nextDifficulty = "";
    
    if (nfts.length === 0) {
      recommendation = "Langtang Valley Trek";
      nextDifficulty = "Easy";
    } else {
      const highestAltitude = Math.max(...nfts.map((n: any) => n.altitude));
      if (highestAltitude > 6000) {
        recommendation = "Manaslu Expedition";
        nextDifficulty = "Expert";
      } else if (highestAltitude > 5000) {
        recommendation = "Annapurna Circuit (High Pass Edition)";
        nextDifficulty = "Challenging";
      } else {
        recommendation = "Everest Base Camp via Gokyo Lakes";
        nextDifficulty = "Moderate";
      }
    }

    const aiResponse = {
      message: `Based on your ${nfts.length} completed treks and your recent summit of ${nfts[0]?.name || 'a regional peak'}, I've designed your next odyssey.`,
      recommendation: recommendation,
      difficulty: nextDifficulty,
      reasoning: `You have shown strong acclimatization up to ${nfts[0]?.altitude || '3,000'}m. Your $TREK balance of ${trekBalance} qualifies you for a 15% discount with Highland Adventures for this route.`,
      itinerary: [
        "Day 1: Arrival in Kathmandu",
        "Day 3: Heli-shuttle to Lukla",
        "Day 7: Acclimatization at Namche",
        "Day 12: High Pass Crossing",
        "Day 14: Verification & NFT Minting"
      ]
    };

    return NextResponse.json(aiResponse);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
