import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// Allow CORS for your frontend domain
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Step 1: Create a thread
    const thread = await openai.beta.threads.create();

    // Step 2: Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Step 3: Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Step 4: Poll for the run status until it's complete
    // WARNING: Vercel Free Tier has a 10-second timeout.
    // OpenAI Assistants can sometimes take longer than 10s.
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed');
      }
      // Reduced polling time to 500ms to save execution time
      await new Promise((resolve) => setTimeout(resolve, 500));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Step 5: Retrieve the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(
      (msg) => msg.role === 'assistant'
    );

    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    const reply =
      assistantMessage.content[0]?.text?.value || 'No response generated';

    res.json({ reply });
  } catch (error) {
    console.error('OpenAI Assistant API error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.post('/api/summary', async (req, res) => {
  try {
    const journalData = req.body;

    if (!Array.isArray(journalData) || journalData.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty journal data' });
    }

    console.log('Generating AI summary using Chat Completions...');

    const summaryPrompt = `Analyze the following journal entries and provide a structured summary in JSON format with keys: weekly_summary, emotional_patterns, weekly_themes, limiting_beliefs, strengths_and_progress, coaching_insights, reflection_questions, next_week_focus. Each key should be an array of strings except weekly_summary which is a string.\n\nEntries: ${JSON.stringify(
      journalData
    )}`;

    const systemPrompt = `You are a Weekly Journal Insight Coach. You ALWAYS respond in a fixed structured JSON format. Never change the structure. Output only the JSON.\n\nResponse format:\n{\n  "weekly_summary": "",\n  "emotional_patterns": [],\n  "weekly_themes": [],\n  "limiting_beliefs": [],\n  "strengths_and_progress": [],\n  "coaching_insights": [],\n  "reflection_questions": [],\n  "next_week_focus": []\n}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: summaryPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const reply =
      completion.choices[0]?.message?.content || 'No response generated';

    let parsedResponse;
    try {
      // Clean up markdown code blocks if the AI adds them (common issue)
      const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '');
      parsedResponse = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to generate summary' });
  }
});

// ✅ CRITICAL CHANGE: Export the app instead of listening
export default app;
