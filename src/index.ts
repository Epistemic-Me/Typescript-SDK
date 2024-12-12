export { EpistemicMeClient } from './client/grpcClient';
export type { ClientConfig } from './client/grpcClient';

// Re-export generated types that users might need
export {
  DialecticType,
  UserAnswer,
  STATUS as DialecticStatus,
  InteractionType,
  ActionType,
} from './generated/proto/models/dialectic_pb';

export {
  BeliefType,
  EpistemicEmotion,
} from './generated/proto/models/beliefs_pb'; 