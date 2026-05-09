# AI Planner Setup Guide

The AI Planner feature uses Google's Gemini API to provide intelligent travel recommendations for all of Nepal - from trekking routes to city attractions, cultural sites, and local experiences.

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variable

Add your Gemini API key to `apps/web/.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart the Development Server

After adding the API key, restart your Next.js development server:

```bash
cd apps/web
npm run dev
```

## How It Works

The AI Planner is a comprehensive Nepal tourism advisor that:

1. **Accepts any travel-related query** - Users can ask about:
   - Trekking routes (e.g., "14 days trek, experienced hiker")
   - City attractions (e.g., "What are the best places in Butwal?")
   - Cultural sites (e.g., "Show me temples in Kathmandu")
   - Nature spots (e.g., "Best viewpoints near Pokhara")
   - Local experiences (e.g., "Family activities in Chitwan")
   - General travel (e.g., "First time in Nepal, 10 days")

2. **Analyzes query type** - The AI automatically detects whether you're asking about:
   - Trekking/hiking routes
   - City/town attractions
   - Cultural/religious sites
   - Nature/adventure activities
   - General travel planning

3. **Calls Gemini API** - The query is sent to Gemini Pro with a specialized prompt

4. **Returns personalized recommendations** - Gemini responds with:
   - A personalized summary addressing your specific query
   - Top 3 recommendations with:
     - Match score (how well it fits your query)
     - Details (duration, price, altitude/elevation, difficulty)
     - Pros and cons
     - Reasoning for the recommendation
   - Location-specific planning tips

5. **Displays interactive results** - Users can expand each recommendation to see full details

## What You Can Ask

### City & Town Queries
- "What are the best places to visit in Butwal?"
- "Show me tourist attractions in Pokhara"
- "Things to do in Kathmandu for 3 days"
- "Best restaurants and markets in Patan"

### Trekking Queries
- "I have 10 days, moderate fitness, budget $800"
- "Beginner trek with mountain views, 7 days"
- "Experienced trekker, want to reach 5000m+"
- "Off the beaten path treks"

### Cultural & Religious
- "Hindu temples in Kathmandu valley"
- "Buddhist monasteries near Pokhara"
- "Cultural heritage sites in Bhaktapur"
- "Pilgrimage routes in Nepal"

### Nature & Adventure
- "Best viewpoints near Pokhara"
- "Waterfalls and natural attractions in Chitwan"
- "Wildlife experiences in Nepal"
- "Day hikes from Kathmandu"

### General Travel
- "First time in Nepal, 2 weeks"
- "Family trip with kids, easy activities"
- "Solo adventure, mix of culture and nature"
- "Honeymoon destinations in Nepal"

## Features

- ✅ Natural language processing for any travel query
- ✅ Comprehensive coverage: treks, cities, attractions, experiences
- ✅ Real Nepal locations and routes
- ✅ Personalized match scoring
- ✅ Detailed pros/cons analysis
- ✅ Location-specific insider tips
- ✅ Flexible recommendations (1-day visits to 21-day treks)
- ✅ Budget-aware suggestions ($20-$2000 range)

## Example Queries & Responses

### Query: "What are the best places to visit in Butwal?"

**Response includes:**
- Tourist attractions (Siddhababa Temple, Tinau River Park)
- Local markets and shopping areas
- Nearby day trips (Lumbini, Tansen)
- Cultural sites and viewpoints
- Local cuisine recommendations
- Practical tips for getting around

### Query: "I have 10 days, moderate fitness, budget $800"

**Response includes:**
- 3 trek options matching fitness level and duration
- Price breakdowns
- Altitude profiles
- Difficulty assessments
- Acclimatization tips
- Booking recommendations

## API Endpoint

**POST** `/api/planner`

**Request Body:**
```json
{
  "query": "What are the best places to visit in Butwal?"
}
```

**Response:**
```json
{
  "summary": "Butwal offers a mix of religious sites, natural beauty, and cultural experiences...",
  "recommendations": [
    {
      "rank": 1,
      "name": "Siddhababa Temple & Viewpoint",
      "region": "Butwal, Rupandehi",
      "difficulty": "Easy",
      "duration_days": 1,
      "price_usd": 50,
      "altitude_m": 950,
      "match_score": 92,
      "pros": ["Panoramic city views", "Religious significance", "Easy access", "Sunset spot"],
      "cons": ["Crowded on weekends", "Limited facilities"],
      "why": "Perfect blend of spirituality and scenic beauty in Butwal",
      "route_id": "siddhababa-temple-butwal",
      "image_url": "/hero.png"
    },
    {
      "rank": 2,
      "name": "Tinau River Park & Promenade",
      "region": "Butwal City Center",
      "difficulty": "Easy",
      "duration_days": 1,
      "price_usd": 20,
      "altitude_m": 205,
      "match_score": 88,
      "pros": ["Family-friendly", "Evening walks", "Local food stalls", "Free entry"],
      "cons": ["Can be hot in summer", "Basic amenities"],
      "why": "Great for relaxation and experiencing local life",
      "route_id": "tinau-river-park",
      "image_url": "/hero.png"
    },
    {
      "rank": 3,
      "name": "Lumbini Day Trip (Birthplace of Buddha)",
      "region": "Lumbini (30km from Butwal)",
      "difficulty": "Easy",
      "duration_days": 1,
      "price_usd": 80,
      "altitude_m": 150,
      "match_score": 95,
      "pros": ["UNESCO World Heritage Site", "Spiritual experience", "International monasteries", "Historical significance"],
      "cons": ["Requires transport", "Can be crowded"],
      "why": "Must-visit world heritage site easily accessible from Butwal",
      "route_id": "lumbini-day-trip",
      "image_url": "/hero.png"
    }
  ],
  "tips": [
    "Best time to visit Butwal is October-March for pleasant weather",
    "Hire a local taxi for day trips to Lumbini (₹2000-3000)",
    "Try local Newari cuisine at Traffic Chowk area",
    "Siddhababa is best visited during sunset for amazing views"
  ]
}
```

## Troubleshooting

### "Gemini API key not configured" error
- Make sure you've added `GEMINI_API_KEY` to your `.env.local` file
- Restart the development server after adding the key

### "Failed to get recommendations from AI" error
- Check that your API key is valid
- Verify you have API quota remaining in Google AI Studio
- Check the server console for detailed error messages

### Invalid response structure
- The Gemini API occasionally returns malformed JSON
- The system will retry automatically
- Check server logs for the raw response

## Cost Considerations

Gemini API offers:
- **Free tier**: 60 requests per minute
- **Paid tier**: Higher rate limits

For most development and small-scale production use, the free tier is sufficient.

## Future Enhancements

Potential improvements:
- Cache common queries to reduce API calls
- Add user preference learning
- Include real-time weather data
- Integrate with booking availability
- Add multi-language support
