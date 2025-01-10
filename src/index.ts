export { EpistemicMeClient } from './client/grpcClient';
export type { ClientConfig } from './client/grpcClient';

// Re-export generated types that users might need
export {
  DialecticType,
  UserAnswer,
  STATUS as DialecticStatus,
  InteractionType,
  QuestionAnswerInteraction,
} from './generated/proto/models/dialectic_pb';

export {
  Belief,
  BeliefType,
} from './generated/proto/models/beliefs_pb'; 

export {
  ActionType,
  ObservationContext,
  ConfidenceRating,
  EpistemicEmotion,
} from './generated/proto/models/predictive_processing_pb';