import { EpistemicMeClient } from '../src/client/grpcClient';
import { DialecticType, UserAnswer } from '../src/generated/proto/models/dialectic_pb';
import { BeliefSystem } from '../src/generated/proto/models/beliefs_pb';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatProcessingResult {
  createdBeliefs: string[];
  lastDialecticBeliefSystem: BeliefSystem | null;
}

async function processChatConversation(
  client: EpistemicMeClient,
  selfModelId: string,
  conversation: ChatMessage[]
): Promise<ChatProcessingResult> {
  // Create initial dialectic
  const dialecticResponse = await client.createDialectic({
    userId: selfModelId,
    dialecticType: DialecticType.DEFAULT
  });

  const dialecticId = dialecticResponse?.dialectic?.id;
  if (!dialecticId) {
    throw new Error('Failed to create dialectic');
  }

  // Track created beliefs during the conversation
  const createdBeliefs: string[] = [];
  let lastDialecticBeliefSystem: BeliefSystem | null = null;

  // Process messages and create question/answer pairs
  for (const message of conversation) {
    const answer = new UserAnswer({
      userAnswer: message.role === 'user' ? message.content : '',
      createdAtMillisUtc: BigInt(Date.now())
    });

    const updateResp = await client.updateDialectic({
      userId: selfModelId,
      dialecticId,
      answer,
      ...(message.role === 'assistant' && { proposedQuestion: message.content })
    });

    // Track beliefs only for user answers
    if (message.role === 'user' && updateResp?.dialectic?.beliefSystem) {
      const beliefs = updateResp.dialectic.beliefSystem.beliefs || [];
      for (const belief of beliefs) {
        if (belief?.id) {
          createdBeliefs.push(belief.id);
        }
      }
      lastDialecticBeliefSystem = updateResp.dialectic.beliefSystem;
    }
  }

  return {
    createdBeliefs,
    lastDialecticBeliefSystem
  };
}

// Example usage
async function main() {
  const client = new EpistemicMeClient({
    baseUrl: 'http://localhost:8080'
  });

  const conversation: ChatMessage[] = [
    { role: 'assistant', content: 'How would you describe your sleep habits?' },
    { role: 'user', content: 'I usually get about 8 hours of sleep per night' },
    { role: 'assistant', content: 'What time do you typically go to bed?' },
    { role: 'user', content: 'Around 10:30 PM most nights' }
  ];

  try {
    const { createdBeliefs, lastDialecticBeliefSystem } = await processChatConversation(
      client,
      'user123',
      conversation
    );

    console.log('Created beliefs:', createdBeliefs);
    console.log('Final belief system:', lastDialecticBeliefSystem);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 