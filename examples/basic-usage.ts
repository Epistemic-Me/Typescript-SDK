import { EpistemicMeClient } from '../src/client/grpcClient';
import { DialecticType } from '../src/generated/proto/models/dialectic_pb';

async function main() {
  const client = new EpistemicMeClient({
    baseUrl: 'http://localhost:8080'
  });

  try {
    // Create a belief
    const belief = await client.createBelief({
      userId: 'test-user',
      beliefContent: 'Regular exercise improves mental clarity'
    });
    console.log('Created belief:', belief);

    // List beliefs
    const beliefs = await client.listBeliefs({
      userId: 'test-user'
    });
    console.log('All beliefs:', beliefs);

    // Create a dialectic
    const dialectic = await client.createDialectic({
      userId: 'test-user',
      dialecticType: DialecticType.DEFAULT
    });
    console.log('Created dialectic:', dialectic);

    // Get belief system detail
    const beliefSystem = await client.getBeliefSystemDetail({
      userId: 'test-user',
      currentObservationContextIds: []
    });
    console.log('Belief system:', beliefSystem);

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 