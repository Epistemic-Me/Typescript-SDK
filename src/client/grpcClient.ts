import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { EpistemicMeService } from "../generated/proto/epistemic_me_connect";
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
} from "../generated/proto/epistemic_me_pb";
import { DialecticType, UserAnswer } from "../generated/proto/models/dialectic_pb";
import { Interceptor } from "@connectrpc/connect";
import { SelfModel } from "../generated/proto/models/self_model_pb";

function apiKeyInterceptor(apiKey?: string): Interceptor {
  return (next) => async (req) => {
    if (apiKey) {
      req.header.set("x-api-key", apiKey);
    }
    return await next(req);
  };
}

function getOriginFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return 'http://localhost:3000'; // Fallback
  }
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
}

export class EpistemicMeClient implements IEpistemicMeClient {
  private client: any;
  private baseUrl: string;
  private apiKey?: string;
  private origin: string;

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
  }): Promise<CreateDialecticResponse> {
    this.validateApiKey();
    
    const request = new CreateDialecticRequest({
      selfModelId: params.userId,
      dialecticType: params.dialecticType
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

  async updateDialectic(params: {
    userId: string;
    dialecticId: string;
    answer: UserAnswer;
  }): Promise<UpdateDialecticResponse> {
    const request = new UpdateDialecticRequest({
      id: params.dialecticId,
      answer: params.answer,
      selfModelId: params.userId
    });

    try {
      return await this.client.updateDialectic(request);
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
} 