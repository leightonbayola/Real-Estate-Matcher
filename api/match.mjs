export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { answers } = req.body;
  
    if (!answers) {
      return res.status(400).json({ error: "Missing answers" });
    }
  
    const prompt = `You are a Utah real estate relocation expert — knowledgeable, warm, and genuinely helpful. Give a personalized neighborhood match for someone with this profile:
  
  - Moving from: ${answers.from}
  - Household: ${answers.situation}
  - Work situation: ${answers.work}
  - Top priorities: ${(answers.priorities || []).join(", ")}
  - Budget: ${answers.budget}
  - Timeline: ${answers.timeline}
  
  Write exactly this structure:
  Line 1: "Your Match: [1-2 specific Utah city/neighborhood names]"
  
  Then 3 paragraphs (no headers, no bullet points):
  - Paragraph 1: Why these specific neighborhoods fit their household type and work situation. Mention commute times, school districts by name, specific landmarks.
  - Paragraph 2: What their budget actually gets them in this area right now — home size, style, what's realistic. Compare to what the same money buys in their current city.
  - Paragraph 3: One insider tip specific to someone moving from ${answers.from} — something they would miss in a generic relocation guide.
  
  Final sentence: "Ready to explore homes in [neighborhood]? We'll connect you with a local specialist who knows these streets."
  
  Be warm and conversational, not like a real estate brochure. Write like a knowledgeable friend. 230-270 words total.`;
  
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {