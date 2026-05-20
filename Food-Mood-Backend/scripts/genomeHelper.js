require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function fetchGenomeFromGPT(dishName, description) {
  const prompt = `
Given the dish "${dishName}", described as: "${description}", estimate its taste genome.

Include values for:
spiciness, sweetness, sourness, saltiness, bitterness, umami, crunchiness, creaminess, chewiness, juiciness, hotness, oiliness, smokiness, charredness, herbaceous, garlicky, oniony, citrusy, fermented, meatiness, seafoodiness, vegetal, dairiness, carb_rich, nutty.

Return a JSON object only, with float values from 0.0 to 1.0.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.choices[0].message.content;

    // Try parsing the JSON directly
    const genome = JSON.parse(content);
    return genome;
  } catch (err) {
    console.error(`Failed to fetch genome for "${dishName}":`, err.message);
    return null;
  }
}

async function ensureGenomeData(dishes) {
  for (const dish of dishes) {
    if (!dish.genome_data || Object.keys(dish.genome_data).length === 0) {
      console.log(`Generating genome with GPT for: ${dish.name}`);
      const genome = await fetchGenomeFromGPT(dish.name, dish.description || '');
      if (genome) {
        dish.genome_data = genome;
      } else {
        console.warn(`GPT failed to return genome for "${dish.name}".`);
      }
    }
  }
  return dishes;
}

module.exports = {
  ensureGenomeData
};
