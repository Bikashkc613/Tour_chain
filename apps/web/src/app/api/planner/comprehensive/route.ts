import { z } from "zod";
import { handle } from "@/lib/api/handle";
import { jsonOk, jsonError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

const ComprehensivePlannerInput = z.object({
  query: z.string().min(1, "Query is required"),
  budget: z.number().optional(),
  duration_days: z.number().optional(),
  preferences: z.array(z.string()).optional(),
});

type Guide = {
  id: string;
  name: string;
  rating: number;
  total_reviews: number;
  specialties: string[];
  price_per_day: number;
  verified: boolean;
  experience_years: number;
};

type Place = {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  verified: boolean;
};

type Route = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration_days: number;
  max_altitude_m: number;
  price_usd: number;
};

type DayItinerary = {
  day: number;
  title: string;
  activities: string[];
  places: string[];
  meals: string;
  accommodation: string;
  notes: string;
};

type ComprehensivePlan = {
  summary: string;
  recommended_route: Route | null;
  recommended_guides: Guide[];
  recommended_places: Place[];
  detailed_itinerary: DayItinerary[];
  total_cost_breakdown: {
    guide_cost: number;
    accommodation: number;
    meals: number;
    permits: number;
    transport: number;
    total: number;
  };
  booking_info: {
    best_season: string;
    advance_booking_days: number;
    required_permits: string[];
    fitness_level: string;
    group_size_recommendation: string;
  };
  safety_tips: string[];
  packing_list: string[];
  emergency_contacts: string[];
};

export const POST = handle(ComprehensivePlannerInput, async (body) => {
  const { query, budget, duration_days, preferences } = body;

  const apiKey = process.env.GEMINI_API_KEY;
  const supabase = await createClient();

  try {
    // Fetch real data from database
    const [guidesResult, placesResult, routesResult] = await Promise.all([
      supabase
        .from("guides")
        .select(`
          id,
          user_id,
          specialties,
          rating,
          total_reviews,
          verified,
          experience_years,
          users!inner(name)
        `)
        .eq("verified", true)
        .gte("rating", 4.0)
        .order("rating", { ascending: false })
        .limit(10),
      
      supabase
        .from("places")
        .select("*")
        .eq("verified", true)
        .order("rating", { ascending: false })
        .limit(20),
      
      supabase
        .from("routes")
        .select("*")
        .order("rating", { ascending: false })
        .limit(10),
    ]);

    const guides = guidesResult.data || [];
    const places = placesResult.data || [];
    const routes = routesResult.data || [];

    // Prepare context for AI
    const contextData = {
      available_guides: guides.map(g => ({
        name: (g.users as { name?: string } | null)?.name || "Guide",
        specialties: g.specialties,
        rating: g.rating,
        reviews: g.total_reviews,
        experience: g.experience_years,
      })),
      available_places: places.map(p => ({
        name: p.name,
        category: p.category,
        description: p.description,
        rating: p.rating,
      })),
      available_routes: routes.map(r => ({
        name: r.name,
        description: r.description,
        difficulty: r.difficulty,
        duration: r.duration_days,
        altitude: r.max_altitude_m,
        price: r.price_usd,
      })),
    };

    // Check if we should use demo mode or real AI
    const isDemoMode = !apiKey || apiKey === "DEMO";
    
    if (isDemoMode) {
      // Return comprehensive demo data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return jsonOk(createDemoComprehensivePlan(query, guides, places, routes));
    }

    // Call Gemini API with comprehensive context
    const isProxyKey = apiKey.startsWith("sk-");
    let response;

    const prompt = `You are an expert Nepal trip planner with access to real verified guides, places, and routes.

User Query: "${query}"
Budget: ${budget ? `$${budget}` : "Flexible"}
Duration: ${duration_days ? `${duration_days} days` : "Flexible"}
Preferences: ${preferences?.join(", ") || "None specified"}

AVAILABLE VERIFIED GUIDES:
${JSON.stringify(contextData.available_guides, null, 2)}

AVAILABLE VERIFIED PLACES:
${JSON.stringify(contextData.available_places, null, 2)}

AVAILABLE ROUTES:
${JSON.stringify(contextData.available_routes, null, 2)}

Create a COMPREHENSIVE trip plan that includes:
1. Select the BEST matching route from available routes
2. Recommend TOP 3 guides from the available verified guides based on specialties and ratings
3. Recommend key places to visit from the available places
4. Create a detailed day-by-day itinerary
5. Provide complete cost breakdown
6. Include booking information and requirements
7. Add safety tips and packing list

Respond ONLY with valid JSON (no markdown):
{
  "summary": "2-3 sentence overview of the complete trip plan",
  "recommended_route": {
    "name": "Route name from available routes",
    "description": "Route description",
    "difficulty": "Easy|Moderate|Challenging|Extreme",
    "duration_days": number,
    "max_altitude_m": number,
    "price_usd": number
  },
  "recommended_guides": [
    {
      "name": "Guide name from available guides",
      "rating": number,
      "total_reviews": number,
      "specialties": ["specialty1", "specialty2"],
      "price_per_day": number,
      "verified": true,
      "experience_years": number,
      "why_recommended": "Why this guide is perfect for this trip"
    }
  ],
  "recommended_places": [
    {
      "name": "Place name from available places",
      "description": "Description",
      "category": "Category",
      "rating": number,
      "verified": true,
      "visit_duration": "How long to spend here"
    }
  ],
  "detailed_itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["Activity 1", "Activity 2"],
      "places": ["Place names to visit"],
      "meals": "Breakfast, Lunch, Dinner details",
      "accommodation": "Where to stay",
      "notes": "Important notes for this day"
    }
  ],
  "total_cost_breakdown": {
    "guide_cost": number,
    "accommodation": number,
    "meals": number,
    "permits": number,
    "transport": number,
    "total": number
  },
  "booking_info": {
    "best_season": "Best time to visit",
    "advance_booking_days": number,
    "required_permits": ["Permit 1", "Permit 2"],
    "fitness_level": "Required fitness level",
    "group_size_recommendation": "Ideal group size"
  },
  "safety_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "packing_list": ["Item 1", "Item 2", "Item 3"],
  "emergency_contacts": ["Contact 1", "Contact 2"]
}

IMPORTANT:
- Use ONLY guides, places, and routes from the provided lists
- Match the user's budget and duration preferences
- Provide realistic cost estimates
- Create a practical day-by-day itinerary
- Include all necessary booking and safety information`;

    if (isProxyKey) {
      response = await fetch("https://api.pawan.krd/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert Nepal trip planner." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });
    } else {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return jsonError(response.status, "API_ERROR", "Failed to generate comprehensive plan");
    }

    const data = await response.json();
    
    let generatedText: string;
    if (isProxyKey) {
      generatedText = data.choices?.[0]?.message?.content;
    } else {
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    
    if (!generatedText) {
      console.error("No text in API response:", data);
      return jsonError(500, "INVALID_RESPONSE", "Invalid response from AI");
    }

    // Clean and parse response
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    let result: ComprehensivePlan;
    try {
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedText);
      return jsonError(500, "PARSE_ERROR", "Failed to parse AI response");
    }

    return jsonOk(result);
  } catch (error) {
    console.error("Comprehensive planner error:", error);
    return jsonError(500, "SERVER_ERROR", "Failed to generate comprehensive plan");
  }
});

function createDemoComprehensivePlan(
  query: string, 
  guides: Guide[], 
  places: Place[], 
  routes: Route[]
): ComprehensivePlan {
  return {
    summary: `Based on your query "${query}", we've created a comprehensive ${routes[0]?.duration_days || 10}-day trip plan with verified guides, curated places, and detailed itinerary. (Demo Mode - Connect real API for AI-powered planning)`,
    recommended_route: routes[0] ? {
      id: routes[0].id,
      name: routes[0].name,
      description: routes[0].description,
      difficulty: routes[0].difficulty,
      duration_days: routes[0].duration_days,
      max_altitude_m: routes[0].max_altitude_m,
      price_usd: routes[0].price_usd,
    } : null,
    recommended_guides: guides.slice(0, 3).map((g, i) => ({
      id: g.id,
      name: g.users?.name || `Guide ${i + 1}`,
      rating: g.rating,
      total_reviews: g.total_reviews,
      specialties: g.specialties || [],
      price_per_day: 50 + (i * 10),
      verified: true,
      experience_years: g.experience_years || 5,
      why_recommended: `Highly rated guide with ${g.experience_years || 5}+ years experience in ${g.specialties?.[0] || "trekking"}`,
    })),
    recommended_places: places.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      rating: p.rating,
      verified: true,
      visit_duration: "2-3 hours",
    })),
    detailed_itinerary: Array.from({ length: routes[0]?.duration_days || 7 }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? "Arrival & Orientation" : i === (routes[0]?.duration_days || 7) - 1 ? "Departure" : `Trek Day ${i}`,
      activities: [
        i === 0 ? "Airport pickup" : "Morning trek",
        i === 0 ? "Hotel check-in" : "Lunch break",
        i === 0 ? "Trip briefing" : "Afternoon exploration",
      ],
      places: places.slice(i % places.length, (i % places.length) + 2).map(p => p.name),
      meals: "Breakfast, Lunch, Dinner included",
      accommodation: i === 0 || i === (routes[0]?.duration_days || 7) - 1 ? "Hotel" : "Tea house/Lodge",
      notes: i === 0 ? "Rest and acclimatize" : "Stay hydrated and pace yourself",
    })),
    total_cost_breakdown: {
      guide_cost: 500,
      accommodation: 300,
      meals: 200,
      permits: 100,
      transport: 150,
      total: 1250,
    },
    booking_info: {
      best_season: "October-November, March-April",
      advance_booking_days: 60,
      required_permits: ["TIMS Card", "National Park Entry Permit"],
      fitness_level: "Moderate - able to walk 5-6 hours daily",
      group_size_recommendation: "2-8 people ideal",
    },
    safety_tips: [
      "Acclimatize properly - don't rush altitude gain",
      "Stay hydrated - drink 3-4 liters of water daily",
      "Follow your guide's instructions at all times",
      "Have travel insurance covering high-altitude trekking",
      "Carry emergency contact numbers",
    ],
    packing_list: [
      "Warm layers (fleece, down jacket)",
      "Waterproof jacket and pants",
      "Trekking boots (broken in)",
      "Sleeping bag (rated for -10°C)",
      "Headlamp with extra batteries",
      "First aid kit and personal medications",
      "Water purification tablets",
      "Sunscreen and sunglasses",
      "Trekking poles",
      "Power bank and charging cables",
    ],
    emergency_contacts: [
      "Nepal Tourism Board: +977-1-4256909",
      "Tourist Police: 1144",
      "Ambulance: 102",
      "Your guide's mobile number (provided at briefing)",
    ],
  };
}
