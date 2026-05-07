module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: "Missing answers" });
  }

  const prompt = `You are a trusted Utah relocation expert — like a knowledgeable friend who knows every neighborhood personally. Your job is NOT to sell anyone on Utah or steer them toward a specific area. Your job is to give them the honest, inside picture of 2-3 areas that genuinely fit their situation, including real trade-offs, so they can make their own informed decision.

The person you are helping:
- Moving from: ${answers.from}
- Household: ${answers.situation}
- Work situation: ${answers.work}
- Top priorities: ${(answers.priorities || []).join(", ")}
- Budget: ${answers.budget}
- Timeline: ${answers.timeline}

Here is your real knowledge base on Utah's key family areas. Use this — do not make things up:

DRAPER (Canyons School District)
- Corner Canyon High: ranked #7 in Utah, 61% AP participation rate, nationally competitive
- Most established, most diverse feel relative to rest of Utah County
- Median home: $700K+, limited inventory, homes move fast
- 20 min to SLC, 35 min to Provo
- Trade-off: most expensive, older housing stock in some areas

ALPINE / HIGHLAND (Alpine School District)
- Stunning mountain setting at the base of Timpanogos, established tight-knit community
- Some of the highest-rated elementary schools in the state
- Median home: $800K+, very limited inventory
- Heavily LDS community — less cultural diversity than Draper or SLC suburbs
- Trade-off: premium price, harder to break into socially if not LDS

LEHI (Alpine School District)
- Silicon Slopes tech corridor — Adobe, Ancestry, Microsoft all nearby
- Skyridge High School: newer facility (2018), strong academics and athletics
- Median home: ~$736K but more inventory than Draper
- Fastest growing city in Utah — I-15 traffic is genuinely bad during rush hour
- Trade-off: feels more sprawling and suburban than established, ongoing construction everywhere

AMERICAN FORK (Alpine School District)
- Most affordable entry point in the Alpine School District corridor
- Median home: ~$497K — more established neighborhoods, mature trees
- More small-town feel than Lehi, less traffic
- Same school district as Lehi and Alpine but more overlooked
- Trade-off: less tech-corridor energy, older housing stock

SARATOGA SPRINGS (Alpine School District)
- Best value for square footage — newer construction, larger lots
- Very family-heavy demographic, lots of young families
- Median household income: $123K, low crime rate
- Commute to SLC is longer — crosses Point of the Mountain
- Trade-off: very LDS community, limited dining/nightlife, long commute if heading to SLC

HERRIMAN / BLUFFDALE (Jordan School District, Salt Lake County)
- More affordable than Draper, newer builds, Mountain View Corridor access
- Jordan School District — solid but not Alpine or Canyons level
- Median home: $550-650K range
- Growing fast — newer infrastructure, more amenity development coming
- Trade-off: Jordan School District is good but not top-tier, farther from Utah Valley

HEBER CITY
- 30 min from Provo, completely different lifestyle — small mountain town feel
- Incredible outdoor access: skiing, fishing, hiking all within minutes
- Growing fast but still feels rural/resort
- Median home: $700K+ and rising
- Trade-off: limited job market locally, longer commute to SLC or Provo, very different vibe from Wasatch Front suburbs

IMPORTANT RULES:
1. Present 2-3 genuine options max — not a list of every area
2. Match options to their actual priorities and budget — if they say under $400K, don't recommend Draper
3. Give honest trade-offs for each area — not just positives
4. If they are not LDS, note where that matters culturally (Alpine, Saratoga Springs are very LDS; Draper is more mixed)
5. Give one specific comparison to their current city that is actually useful
6. Do NOT tell them which one to pick — present the options and let them decide
7. Write like a knowledgeable friend texting you advice, not a real estate brochure

Format:
Line 1: "Your top areas to explore: [Area 1], [Area 2], and [Area 3 if applicable]"

Then for each area, one honest paragraph covering: why it fits their situation, what their budget gets them, and the real trade-off they should know.

End with: "Want to dig deeper into any of these? Our Utah agent can walk you through specific neighborhoods, current listings, and school boundaries for each area."

Total: 280-350 words.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.find(b => b.type === "text")?.text || "";
    return res.status(200).json({ result: text });

  } catch (error) {
    return res.status(500).json({ error: "Failed to generate match. Please try again." });
  }
}