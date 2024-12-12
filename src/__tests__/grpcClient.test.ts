import { EpistemicMeClient } from '../client/grpcClient.js';
import { DialecticType } from '../generated/proto/models/dialectic_pb.js';
import { createGrpcResponse, createGrpcError } from './helpers';

describe('EpistemicMeClient', () => {
  const client = new EpistemicMeClient({
    baseUrl: 'http://localhost:8080',
  });

  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createBelief', () => {
    it('should create a belief successfully', async () => {
      const mockResponse = {
        belief: {
          id: '1',
          content: [],
          selfModelId: '',
          type: 'BELIEF_TYPE_INVALID',
          version: 0
        },
        beliefSystem: {
          beliefs: [],
          beliefContexts: [],
          observationContexts: [],
          metrics: {
            clarificationScore: 0.8,
            totalBeliefs: 0,
            totalBeliefStatements: 0,
            totalCausalBeliefs: 0,
            totalFalsifiableBeliefs: 0
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(createGrpcResponse(mockResponse));

      const response = await client.createBelief({
        userId: mockUserId,
        beliefContent: 'Test belief',
      });

      expect(JSON.parse(JSON.stringify(response))).toEqual(JSON.parse(JSON.stringify(mockResponse)));
    });
  });

  describe('listBeliefs', () => {
    it('should list beliefs successfully', async () => {
      const mockResponse = {
        beliefs: [
          {
            id: '1',
            content: [],
            selfModelId: '',
            type: 'BELIEF_TYPE_INVALID',
            version: 0
          },
          {
            id: '2',
            content: [],
            selfModelId: '',
            type: 'BELIEF_TYPE_INVALID',
            version: 0
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue(createGrpcResponse(mockResponse));

      const beliefs = await client.listBeliefs({ userId: mockUserId });
      expect(JSON.parse(JSON.stringify(beliefs))).toEqual(JSON.parse(JSON.stringify(mockResponse.beliefs)));
    });
  });

  describe('getBeliefSystemDetail', () => {
    it('should get belief system detail successfully', async () => {
      const mockResponse = {
        beliefSystem: {
          beliefs: [],
          beliefContexts: [],
          observationContexts: [],
          metrics: {
            clarificationScore: 0.8,
            totalBeliefs: 0,
            totalBeliefStatements: 0,
            totalCausalBeliefs: 0,
            totalFalsifiableBeliefs: 0
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(createGrpcResponse(mockResponse));

      const response = await client.getBeliefSystemDetail({
        userId: mockUserId,
        currentObservationContextIds: []
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API Error';
      const consoleSpy = jest.spyOn(console, 'error');
      (global.fetch as jest.Mock).mockRejectedValue(createGrpcError(errorMessage));

      await expect(client.createBelief({
        userId: mockUserId,
        beliefContent: 'Test belief'
      })).rejects.toThrow(errorMessage);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating belief:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('createDialectic', () => {
    it('should create a dialectic successfully', async () => {
      const mockResponse = {
        dialectic: {
          id: '1',
          selfModelId: mockUserId,
          userInteractions: []
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(createGrpcResponse(mockResponse));

      const response = await client.createDialectic({
        userId: mockUserId,
        dialecticType: DialecticType.DEFAULT,
      });

      expect(response).toEqual(mockResponse);
    });
  });
}); 