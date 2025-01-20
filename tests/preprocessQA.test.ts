import { describe, test, expect, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

import { EpistemicMeClient } from "../src/client/grpcClient";

describe('PreprocessQA Integration Tests', () => {
  let client: EpistemicMeClient;

  beforeAll(async () => {
    // Create client with longer timeout
    client = new EpistemicMeClient({
      baseUrl: 'http://localhost:8080',
      defaultTimeoutMs: 10000  // Increase client timeout to 10s
    });

    // Create a developer for authentication
    const developerName = `Test Developer ${uuidv4()}`;
    const developerEmail = `test_${uuidv4()}@example.com`;
    
    const createResponse = await client.createDeveloper({
      name: developerName,
      email: developerEmail
    });
    
    if (!createResponse.developer?.apiKeys?.[0]) {
      throw new Error('Failed to get API key from developer response');
    }
    
    // Set the API key for subsequent calls
    client.setApiKey(createResponse.developer.apiKeys[0]);
  });

  test('processes sleep and diet questions', async () => {
    // Sleep questions test
    const sleepQuestions = `
      ### Sleep Habits
      - How many hours do you sleep?
      - What is your bedtime routine?
      - Do you have trouble falling asleep?
    `.trim();

    const sleepAnswers = `
      I typically sleep 8 hours per night.
      I read a book and meditate before bed.
      No, I fall asleep easily within 10 minutes.
    `.trim();

    const sleepResponse = await client.preprocessQA(sleepQuestions, sleepAnswers);
    expect(sleepResponse.qaPairs).toBeDefined();
    expect(sleepResponse.qaPairs.length).toBeGreaterThan(0);

    // Diet questions test
    const dietQuestions = `
      ### Diet and Nutrition
      - Can you describe a typical day's meals for you?
      - How do you make your food choices?
      - What specific beliefs influence your dietary choices?
      - What do you believe are the benefits of your current diet?
    `.trim();

    const dietAnswers = `
      I have a protein shake for breakfast, salad for lunch, and fish with vegetables for dinner.
      I make choices based on nutrition, hunger and enjoyment.
      I believe in eating to manage metabolic health and maintain energy levels.
      My diet gives me energy and keeps me healthy as measured by my blood tests.
    `.trim();

    const dietResponse = await client.preprocessQA(dietQuestions, dietAnswers);
    expect(dietResponse.qaPairs).toBeDefined();
    expect(dietResponse.qaPairs.length).toBeGreaterThan(0);

    // Verify specific diet question matches
    const dietPairs = dietResponse.qaPairs;
    for (const pair of dietPairs) {
      switch (pair.question) {
        case "Can you describe a typical day's meals for you?":
          expect(pair.answer).toContain("shake for breakfast");
          break;
        case "How do you make your food choices?":
          expect(pair.answer).toContain("based on nutrition");
          expect(pair.answer).toContain("hunger and enjoyment");
          break;
        case "What specific beliefs influence your dietary choices?":
          expect(pair.answer).toContain("manage metabolic health");
          break;
        case "What do you believe are the benefits of your current diet?":
          expect(pair.answer).toContain("gives me energy");
          expect(pair.answer).toContain("healthy as measured by my blood tests");
          break;
      }
    }
  }, 15000);

  test('handles empty input appropriately', async () => {
    await expect(client.preprocessQA('', 'Some answer'))
      .rejects
      .toThrow('Question blob and answer blob are required');

    await expect(client.preprocessQA('Some question', ''))
      .rejects
      .toThrow('Question blob and answer blob are required');
  }, 10000);

  test('handles structured question format', async () => {
    const questionBlob = `
      Q: What is your favorite color?
      Q: How do you feel about the weather?
    `.trim();

    const answerBlob = `
      A: My favorite color is blue.
      A: I enjoy sunny days.
    `.trim();

    const response = await client.preprocessQA(questionBlob, answerBlob);
    expect(response.qaPairs).toBeDefined();
    expect(response.qaPairs.length).toBeGreaterThan(0);
  }, 10000);
}); 