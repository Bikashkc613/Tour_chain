import { z } from "zod";
import { handle } from "@/lib/api/handle";
import { jsonOk } from "@/lib/api/response";

const PlannerInput = z.object({
  query: z.string().min(1, "Query is required"),
});

type Recommendation = {
  rank: number;
  name: string;
  region: string;
  difficulty: string;
  duration_days: number;
  price_usd: number;
  altitude_m: number;
  match_score: number;
  pros: string[];
  cons: string[];
  why: string;
  route_id: string;
  image_url: string;
};

type PlannerResponse = {
  summary: string;
  recommendations: Recommendation[];
  tips: string[];
};

// Smart recommendation engine based on query keywords
function getRecommendations(query: string): PlannerResponse {
  const lowerQuery = query.toLowerCase();
  
  // Detect query type
  const isTrekking = /trek|hike|mountain|climb|altitude|everest|annapurna|langtang/i.test(query);
  const isCityQuery = /butwal|kathmandu|pokhara|chitwan|lumbini|city|town|place/i.test(query);
  const isBudget = /budget|cheap|affordable|low cost/i.test(query);
  const isLuxury = /luxury|premium|high end|expensive/i.test(query);
  const isBeginner = /beginner|easy|first time|novice/i.test(query);
  const isExperienced = /experienced|expert|challenging|difficult|extreme/i.test(query);
  
  // City-specific recommendations
  if (lowerQuery.includes('butwal')) {
    return {
      summary: "Butwal offers a perfect blend of religious sites, natural beauty, and cultural experiences. Here are the top places to visit in and around Butwal.",
      recommendations: [
        {
          rank: 1,
          name: "Siddhababa Temple & Viewpoint",
          region: "Butwal, Rupandehi",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 50,
          altitude_m: 950,
          match_score: 95,
          pros: ["Panoramic city views", "Religious significance", "Easy access", "Perfect sunset spot"],
          cons: ["Crowded on weekends", "Limited facilities"],
          why: "Best viewpoint in Butwal with spiritual significance and stunning city panoramas",
          route_id: "siddhababa-temple-butwal",
          image_url: "/hero.png"
        },
        {
          rank: 2,
          name: "Lumbini Day Trip (Buddha's Birthplace)",
          region: "Lumbini (30km from Butwal)",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 80,
          altitude_m: 150,
          match_score: 98,
          pros: ["UNESCO World Heritage Site", "Spiritual experience", "International monasteries", "Historical significance"],
          cons: ["Requires transport", "Can be hot in summer"],
          why: "Must-visit world heritage site easily accessible from Butwal",
          route_id: "lumbini-day-trip",
          image_url: "/hero.png"
        },
        {
          rank: 3,
          name: "Tinau River Park & Local Markets",
          region: "Butwal City Center",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 30,
          altitude_m: 205,
          match_score: 85,
          pros: ["Family-friendly", "Evening walks", "Local food stalls", "Free entry"],
          cons: ["Basic amenities", "Can be hot in daytime"],
          why: "Great for experiencing local life and relaxation",
          route_id: "tinau-river-park",
          image_url: "/hero.png"
        }
      ],
      tips: [
        "Best time to visit Butwal is October-March for pleasant weather",
        "Hire a local taxi for day trips to Lumbini (₹2000-3000 round trip)",
        "Try local Newari cuisine at Traffic Chowk area",
        "Siddhababa is best visited during sunset for amazing views"
      ]
    };
  }
  
  if (lowerQuery.includes('kathmandu')) {
    return {
      summary: "Kathmandu Valley is rich in cultural heritage, ancient temples, and vibrant markets. Perfect for history and culture enthusiasts.",
      recommendations: [
        {
          rank: 1,
          name: "Durbar Square & Kumari House",
          region: "Kathmandu City Center",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 40,
          altitude_m: 1400,
          match_score: 96,
          pros: ["UNESCO World Heritage", "Living Goddess", "Ancient architecture", "Central location"],
          cons: ["Crowded", "Entrance fee required"],
          why: "Heart of Kathmandu's cultural heritage",
          route_id: "durbar-square-kathmandu",
          image_url: "/hero.png"
        },
        {
          rank: 2,
          name: "Swayambhunath (Monkey Temple)",
          region: "Kathmandu Valley",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 35,
          altitude_m: 1500,
          match_score: 94,
          pros: ["Panoramic valley views", "Ancient Buddhist site", "Unique monkeys", "Spiritual atmosphere"],
          cons: ["365 steps to climb", "Monkeys can be mischievous"],
          why: "Iconic Buddhist stupa with stunning valley views",
          route_id: "swayambhunath-temple",
          image_url: "/hero.png"
        },
        {
          rank: 3,
          name: "Pashupatinath Temple",
          region: "Kathmandu",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 30,
          altitude_m: 1350,
          match_score: 92,
          pros: ["Sacred Hindu site", "Bagmati River", "Cultural ceremonies", "UNESCO Heritage"],
          cons: ["Non-Hindus can't enter main temple", "Cremation ceremonies visible"],
          why: "Most sacred Hindu temple in Nepal",
          route_id: "pashupatinath-temple",
          image_url: "/hero.png"
        }
      ],
      tips: [
        "Hire a local guide for better understanding of cultural sites",
        "Dress modestly when visiting temples",
        "Try momos and dal bhat at local restaurants",
        "Use metered taxis or ride-sharing apps for transport"
      ]
    };
  }
  
  if (lowerQuery.includes('pokhara')) {
    return {
      summary: "Pokhara is Nepal's adventure capital with stunning lake views, mountain panoramas, and outdoor activities.",
      recommendations: [
        {
          rank: 1,
          name: "Sarangkot Sunrise Viewpoint",
          region: "Pokhara Valley",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 45,
          altitude_m: 1600,
          match_score: 97,
          pros: ["Annapurna range views", "Magical sunrise", "Paragliding launch site", "Easy access"],
          cons: ["Early morning start", "Can be cloudy"],
          why: "Best sunrise view of Annapurna and Dhaulagiri ranges",
          route_id: "sarangkot-viewpoint",
          image_url: "/hero.png"
        },
        {
          rank: 2,
          name: "Phewa Lake Boating & Tal Barahi Temple",
          region: "Pokhara Lakeside",
          difficulty: "Easy",
          duration_days: 1,
          price_usd: 35,
          altitude_m: 800,
          match_score: 93,
          pros: ["Peaceful boating", "Mountain reflections", "Island temple", "Lakeside cafes"],
          cons: ["Crowded in peak season", "Weather dependent"],
          why: "Iconic Pokhara experience with stunning mountain reflections",
          route_id: "phewa-lake-pokhara",
          image_url: "/hero.png"
        },
        {
          rank: 3,
          name: "World Peace Pagoda Hike",
          region: "Pokhara",
          difficulty: "Moderate",
          duration_days: 1,
          price_usd: 40,
          altitude_m: 1100,
          match_score: 90,
          pros: ["360° mountain views", "Peaceful atmosphere", "Good exercise", "Beautiful pagoda"],
          cons: ["2-hour hike", "Steep in sections"],
          why: "Rewarding hike with panoramic views of Pokhara valley",
          route_id: "peace-pagoda-hike",
          image_url: "/hero.png"
        }
      ],
      tips: [
        "Stay in Lakeside area for easy access to attractions",
        "Book paragliding in advance during peak season",
        "Rent a bicycle to explore the lakeside",
        "Visit during October-November for clearest mountain views"
      ]
    };
  }
  
  // Trekking recommendations
  if (isTrekking) {
    if (isBeginner || lowerQuery.includes('easy') || lowerQuery.includes('7 days') || lowerQuery.includes('short')) {
      return {
        summary: "Perfect beginner-friendly treks in Nepal with moderate difficulty and stunning mountain views.",
        recommendations: [
          {
            rank: 1,
            name: "Poon Hill Trek",
            region: "Annapurna Region",
            difficulty: "Easy",
            duration_days: 5,
            price_usd: 400,
            altitude_m: 3210,
            match_score: 96,
            pros: ["Best for beginners", "Stunning sunrise views", "Short duration", "Well-established trail"],
            cons: ["Crowded in peak season", "Lower altitude"],
            why: "Perfect introduction to Himalayan trekking with amazing views",
            route_id: "poon-hill-trek",
            image_url: "/hero.png"
          },
          {
            rank: 2,
            name: "Langtang Valley Trek",
            region: "Langtang Region",
            difficulty: "Easy",
            duration_days: 7,
            price_usd: 600,
            altitude_m: 3800,
            match_score: 92,
            pros: ["Close to Kathmandu", "Less crowded", "Beautiful scenery", "Cultural experience"],
            cons: ["Earthquake recovery ongoing", "Basic facilities"],
            why: "Accessible trek with great mountain views and Tamang culture",
            route_id: "langtang-valley-trek",
            image_url: "/hero.png"
          },
          {
            rank: 3,
            name: "Ghorepani Ghandruk Loop",
            region: "Annapurna Region",
            difficulty: "Easy",
            duration_days: 6,
            price_usd: 450,
            altitude_m: 2900,
            match_score: 89,
            pros: ["Circular route", "Gurung villages", "Rhododendron forests", "Good teahouses"],
            cons: ["Some steep sections", "Can be rainy"],
            why: "Cultural trek through traditional villages with mountain views",
            route_id: "ghorepani-ghandruk-loop",
            image_url: "/hero.png"
          }
        ],
        tips: [
          "Book 2-3 months in advance for peak season (Oct-Nov, Mar-Apr)",
          "Acclimatize properly even on shorter treks",
          "Pack layers - temperature varies with altitude",
          "Get TIMS card and national park permits before starting"
        ]
      };
    }
    
    if (isExperienced || lowerQuery.includes('14 days') || lowerQuery.includes('5000')) {
      return {
        summary: "Challenging high-altitude treks for experienced trekkers seeking adventure and stunning Himalayan vistas.",
        recommendations: [
          {
            rank: 1,
            name: "Everest Base Camp Trek",
            region: "Khumbu Region",
            difficulty: "Challenging",
            duration_days: 14,
            price_usd: 1400,
            altitude_m: 5364,
            match_score: 98,
            pros: ["Iconic destination", "World's highest peaks", "Sherpa culture", "Well-established route"],
            cons: ["Altitude sickness risk", "Expensive", "Crowded"],
            why: "Ultimate bucket-list trek to the base of Mt. Everest",
            route_id: "everest-base-camp-trek",
            image_url: "/hero.png"
          },
          {
            rank: 2,
            name: "Annapurna Circuit",
            region: "Annapurna Region",
            difficulty: "Challenging",
            duration_days: 15,
            price_usd: 1000,
            altitude_m: 5416,
            match_score: 95,
            pros: ["Diverse landscapes", "Thorong La Pass", "Cultural variety", "Great value"],
            cons: ["Long duration", "Variable weather", "Road construction"],
            why: "Classic trek with incredible diversity of landscapes and cultures",
            route_id: "annapurna-circuit-trek",
            image_url: "/hero.png"
          },
          {
            rank: 3,
            name: "Manaslu Circuit Trek",
            region: "Manaslu Region",
            difficulty: "Extreme",
            duration_days: 16,
            price_usd: 1200,
            altitude_m: 5160,
            match_score: 91,
            pros: ["Off the beaten path", "Less crowded", "Pristine nature", "Cultural immersion"],
            cons: ["Remote", "Limited facilities", "Restricted area permit required"],
            why: "Remote and challenging trek around world's 8th highest peak",
            route_id: "manaslu-circuit-trek",
            image_url: "/hero.png"
          }
        ],
        tips: [
          "Mandatory acclimatization days - don't skip them",
          "Get comprehensive travel insurance covering high altitude",
          "Hire experienced guides for safety",
          "Train for 2-3 months before the trek"
        ]
      };
    }
    
    // Default trekking recommendations
    return {
      summary: "Popular trekking routes in Nepal offering diverse experiences from cultural immersion to high-altitude adventure.",
      recommendations: [
        {
          rank: 1,
          name: "Everest Base Camp Trek",
          region: "Khumbu Region",
          difficulty: "Moderate",
          duration_days: 12,
          price_usd: 1200,
          altitude_m: 5364,
          match_score: 95,
          pros: ["Iconic destination", "Stunning mountain views", "Sherpa culture", "Well-established route"],
          cons: ["Altitude sickness risk", "Crowded in peak season", "Higher cost"],
          why: "The ultimate Himalayan trekking experience",
          route_id: "everest-base-camp-trek",
          image_url: "/hero.png"
        },
        {
          rank: 2,
          name: "Annapurna Base Camp Trek",
          region: "Annapurna Region",
          difficulty: "Moderate",
          duration_days: 10,
          price_usd: 800,
          altitude_m: 4130,
          match_score: 92,
          pros: ["Diverse landscapes", "Natural hot springs", "Gurung culture", "Affordable"],
          cons: ["Leeches in monsoon", "Steep ascents"],
          why: "Perfect balance of challenge and accessibility",
          route_id: "annapurna-base-camp-trek",
          image_url: "/hero.png"
        },
        {
          rank: 3,
          name: "Langtang Valley Trek",
          region: "Langtang Region",
          difficulty: "Easy",
          duration_days: 7,
          price_usd: 600,
          altitude_m: 3800,
          match_score: 88,
          pros: ["Close to Kathmandu", "Less crowded", "Beautiful scenery", "Budget-friendly"],
          cons: ["Earthquake recovery", "Basic facilities"],
          why: "Great alternative to more crowded treks",
          route_id: "langtang-valley-trek",
          image_url: "/hero.png"
        }
      ],
      tips: [
        "Best seasons: October-November (autumn) and March-April (spring)",
        "Acclimatize properly to avoid altitude sickness",
        "Pack warm layers and good trekking boots",
        "Get TIMS card and necessary permits in Kathmandu"
      ]
    };
  }
  
  // Default general recommendations
  return {
    summary: "Discover the best of Nepal with these top-rated destinations combining culture, nature, and adventure.",
    recommendations: [
      {
        rank: 1,
        name: "Kathmandu Valley Cultural Tour",
        region: "Kathmandu",
        difficulty: "Easy",
        duration_days: 3,
        price_usd: 250,
        altitude_m: 1400,
        match_score: 93,
        pros: ["UNESCO World Heritage sites", "Rich culture", "Easy access", "Great food"],
        cons: ["Crowded", "Air pollution"],
        why: "Perfect introduction to Nepal's rich cultural heritage",
        route_id: "kathmandu-cultural-tour",
        image_url: "/hero.png"
      },
      {
        rank: 2,
        name: "Pokhara Adventure Package",
        region: "Pokhara",
        difficulty: "Easy",
        duration_days: 3,
        price_usd: 300,
        altitude_m: 800,
        match_score: 90,
        pros: ["Lake activities", "Paragliding", "Mountain views", "Relaxed atmosphere"],
        cons: ["Touristy", "Weather dependent"],
        why: "Nepal's adventure capital with stunning natural beauty",
        route_id: "pokhara-adventure-package",
        image_url: "/hero.png"
      },
      {
        rank: 3,
        name: "Chitwan Jungle Safari",
        region: "Chitwan National Park",
        difficulty: "Easy",
        duration_days: 2,
        price_usd: 200,
        altitude_m: 200,
        match_score: 87,
        pros: ["Wildlife viewing", "Elephant rides", "Jungle activities", "Unique experience"],
        cons: ["Hot and humid", "Mosquitoes"],
        why: "Best wildlife experience in Nepal",
        route_id: "chitwan-jungle-safari",
        image_url: "/hero.png"
      }
    ],
    tips: [
      "Nepal is best visited in October-November or March-April",
      "Get a local SIM card for easy communication",
      "Try local cuisine - dal bhat, momos, and thukpa",
      "Respect local customs and dress modestly at religious sites"
    ]
  };
}

export const POST = handle(PlannerInput, async (body) => {
  const { query } = body;
  
  // Simulate API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get smart recommendations based on query
  const recommendations = getRecommendations(query);
  
  return jsonOk(recommendations);
});
