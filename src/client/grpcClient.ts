// External dependencies
import { createClient } from '@connectrpc/connect';
import type { Interceptor } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';

// Generated proto imports
import { EpistemicMeService } from '../generated/proto/epistemic_me_connect';
import {
  CreateBeliefRequest,
  CreateDialecticRequest,
  CreateDialecticResponse,
  ListBeliefsRequest,
  ListBeliefsResponse,
  ListDialecticsRequest,
  ListDialecticsResponse,
  UpdateDialecticRequest,
  UpdateDialecticResponse,
  GetBeliefSystemRequest,
  GetBeliefSystemResponse,
  CreateDeveloperRequest,
  CreateDeveloperResponse,
  GetDeveloperRequest,
  GetDeveloperResponse,
  CreateSelfModelRequest,
  CreateSelfModelResponse,
  GetSelfModelRequest,
  GetSelfModelResponse,
  AddPhilosophyRequest,
  AddPhilosophyResponse,
  PreprocessQuestionAnswerRequest,
  PreprocessQuestionAnswerResponse,
  CreatePhilosophyRequest,
  CreatePhilosophyResponse,
  UpdatePhilosophyRequest,
  UpdatePhilosophyResponse,
} from '../generated/proto/epistemic_me_pb';
import { 
  DialecticType, 
  UserAnswer,
  LearningObjective 
} from '../generated/proto/models/dialectic_pb';

function apiKeyInterceptor(apiKey?: string): Interceptor {
  return (next) => async (req) => {
    if (apiKey) {
      req.header.set("x-api-key", apiKey);
    }
    return await next(req);
  };
}

export interface ClientConfig {
  baseUrl: string;
  useBinaryFormat?: boolean;
  credentials?: RequestCredentials;
  defaultTimeoutMs?: number;
  apiKey?: string;
  origin?: string;
}

export interface IEpistemicMeClient {
  createDeveloper(request: { name: string; email: string }): Promise<CreateDeveloperResponse>;
  getDeveloper(request: { id: string }): Promise<GetDeveloperResponse>;
  setApiKey(apiKey: string): void;
  createSelfModel(request: { 
    id: string; 
    philosophies?: string[] 
  }): Promise<CreateSelfModelResponse>;
  getSelfModel(request: { id: string }): Promise<GetSelfModelResponse>;
  listDialectics(request: { selfModelId: string }): Promise<ListDialecticsResponse>;
  addPhilosophy(request: {
    selfModelId: string;
    philosophyId: string;
  }): Promise<AddPhilosophyResponse>;
  preprocessQuestionAnswer(questionBlob: string, answerBlob: string): Promise<PreprocessQuestionAnswerResponse>;
  createPhilosophy(params: {
    description: string;
    extrapolateContexts?: boolean;
  }): Promise<CreatePhilosophyResponse>;
  updatePhilosophy(params: {
    philosophyId: string;
    description: string;
    extrapolateContexts?: boolean;
  }): Promise<UpdatePhilosophyResponse>;
}

export class EpistemicMeClient implements IEpistemicMeClient {
  private client: ReturnType<typeof createClient<typeof EpistemicMeService>>;
  private readonly baseUrl: string;
  private apiKey?: string;
  private readonly origin: string;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.origin = config.origin || 'http://localhost:3000';
    
    console.debug('Initializing EpistemicMeClient with config:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    });

    const transport = createConnectTransport({
      baseUrl: this.baseUrl,
      useBinaryFormat: config.useBinaryFormat || false,
      defaultTimeoutMs: config.defaultTimeoutMs || 5000,
      credentials: config.credentials || "include",
      interceptors: [
        apiKeyInterceptor(this.apiKey),
        (next) => async (req) => {
          req.header.set('Origin', this.origin);
          return await next(req);
        }
      ]
    });

    this.client = createClient(EpistemicMeService, transport);
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    const transport = createConnectTransport({
      baseUrl: this.baseUrl,
      useBinaryFormat: false,
      defaultTimeoutMs: 5000,
      credentials: "include",
      interceptors: [
        apiKeyInterceptor(this.apiKey),
        (next) => async (req) => {
          req.header.set('Origin', this.origin);
          return await next(req);
        }
      ]
    });
    this.client = createClient(EpistemicMeService, transport);
  }

  private validateApiKey() {
    if (!this.apiKey) {
      throw new Error('API key is required. Please provide an API key in the client configuration. See documentation at /Docs for more information.');
    }
  }

  async createBelief(params: { userId: string; beliefContent: string }) {
    const request = new CreateBeliefRequest({
      selfModelId: params.userId,
      beliefContent: params.beliefContent
    });

    try {
      const response = await this.client.createBelief(request);
      return response;
    } catch (error) {
      console.error("Error creating belief:", error);
      throw error;
    }
  }

  async listBeliefs(params: { userId: string }): Promise<ListBeliefsResponse> {
    const request = new ListBeliefsRequest({
      selfModelId: params.userId
    });

    try {
      return await this.client.listBeliefs(request);
    } catch (error) {
      console.error("Error listing beliefs:", error);
      throw error;
    }
  }

  async listDialectics(params: { selfModelId: string }): Promise<ListDialecticsResponse> {
    const request = new ListDialecticsRequest({
      selfModelId: params.selfModelId
    });

    try {
      return await this.client.listDialectics(request);
    } catch (error) {
      console.error("Error listing dialectics:", error);
      throw error;
    }
  }

  async createDialectic(params: {
    userId: string;
    dialecticType: DialecticType;
    learningObjective?: LearningObjective;
  }): Promise<CreateDialecticResponse> {
    this.validateApiKey();
    
    const request = new CreateDialecticRequest({
      selfModelId: params.userId,
      dialecticType: params.dialecticType,
      learningObjective: params.learningObjective
    });

    try {
      return await this.client.createDialectic(request);
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('missing API key')) {
        throw new Error('Invalid or missing API key. Please check your API key configuration.');
      }
      console.error("Error creating dialectic:", {
        error,
        request: params,
        url: `${this.baseUrl}/epistemic.EpistemicMeService/CreateDialectic`,
        method: 'POST'
      });
      throw error;
    }
  }

  async updateDialectic(request: {
    dialecticId: string,
    userId: string,
    answer: UserAnswer,
    customQuestion?: string,
    questionBlob?: string,
    answerBlob?: string
  }): Promise<UpdateDialecticResponse> {
    const req = new UpdateDialecticRequest({
      id: request.dialecticId,
      selfModelId: request.userId,
      answer: request.answer,
      customQuestion: request.customQuestion,
      questionBlob: request.questionBlob,
      answerBlob: request.answerBlob
    });

    try {
      return await this.client.updateDialectic(req);
    } catch (error) {
      console.error("Error updating dialectic:", error);
      throw error;
    }
  }

  async getBeliefSystemDetail(params: {
    userId: string;
    currentObservationContextIds: string[];
  }): Promise<GetBeliefSystemResponse> {
    const request = new GetBeliefSystemRequest({
      selfModelId: params.userId,
      includeMetrics: true,
      conceptualize: true
    });

    try {
      return await this.client.getBeliefSystem(request);
    } catch (error) {
      console.error("Error getting belief system:", error);
      throw error;
    }
  }

  async createDeveloper(params: { name: string; email: string }): Promise<CreateDeveloperResponse> {
    const request = new CreateDeveloperRequest({
      name: params.name,
      email: params.email
    });

    try {
      return await this.client.createDeveloper(request);
    } catch (error) {
      console.error("Error creating developer:", error);
      throw error;
    }
  }

  async getDeveloper(params: { id: string }): Promise<GetDeveloperResponse> {
    const request = new GetDeveloperRequest({
      id: params.id
    });

    try {
      return await this.client.getDeveloper(request);
    } catch (error) {
      console.error("Error getting developer:", error);
      throw error;
    }
  }

  async createSelfModel(params: { 
    id: string; 
    philosophies?: string[] 
  }): Promise<CreateSelfModelResponse> {
    const request = new CreateSelfModelRequest({
      id: params.id,
      philosophies: params.philosophies
    });

    try {
      return await this.client.createSelfModel(request);
    } catch (error) {
      console.error("Error creating self model:", error);
      throw error;
    }
  }

  async getSelfModel(params: { id: string }): Promise<GetSelfModelResponse> {
    const request = new GetSelfModelRequest({
      selfModelId: params.id
    });

    try {
      return await this.client.getSelfModel(request);
    } catch (error) {
      console.error("Error getting self model:", error);
      throw error;
    }
  }

  async addPhilosophy(params: {
    selfModelId: string;
    philosophyId: string;
  }): Promise<AddPhilosophyResponse> {
    const request = new AddPhilosophyRequest({
      selfModelId: params.selfModelId,
      philosophyId: params.philosophyId
    });

    try {
      return await this.client.addPhilosophy(request);
    } catch (error) {
      console.error("Error adding philosophy:", error);
      throw error;
    }
  }

  /**
   * Preprocesses question-answer pairs from raw text
   * @param questionBlob - The raw text containing questions
   * @param answerBlob - The raw text containing answers
   * @returns Promise containing processed question-answer pairs
   */
  public async preprocessQuestionAnswer(questionBlob: string, answerBlob: string): Promise<PreprocessQuestionAnswerResponse> {
    if (!questionBlob || !answerBlob) {
      throw new Error('Question blob and answer blob are required');
    }

    const request = new PreprocessQuestionAnswerRequest({
      questionBlobs: [questionBlob.trim()],
      answerBlobs: [answerBlob.trim()]
    });

    try {
      return await this.client.preprocessQuestionAnswer(request);
    } catch (error) {
      console.error("Error preprocessing Q&A:", error);
      throw error;
    }
  }

  async createPhilosophy(params: {
    description: string;
    extrapolateContexts?: boolean;
  }): Promise<CreatePhilosophyResponse> {
    this.validateApiKey();
    const request = new CreatePhilosophyRequest({
      description: params.description,
      extrapolateContexts: params.extrapolateContexts ?? false,
    });
    try {
      return await this.client.createPhilosophy(request);
    } catch (error) {
      console.error('Error creating philosophy:', error);
      throw error;
    }
  }

  async updatePhilosophy(params: {
    philosophyId: string;
    description: string;
    extrapolateContexts?: boolean;
  }): Promise<UpdatePhilosophyResponse> {
    this.validateApiKey();
    const request = new UpdatePhilosophyRequest({
      philosophyId: params.philosophyId,
      description: params.description,
      extrapolateContexts: params.extrapolateContexts ?? false,
    });
    try {
      return await this.client.updatePhilosophy(request);
    } catch (error) {
      console.error('Error updating philosophy:', error);
      throw error;
    }
  }
} 