import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { EpistemicMeService } from "../generated/proto/epistemic_me_connect.js";
import {
  CreateBeliefRequest,
  CreateDialecticRequest,
  CreateDialecticResponse,
  ListBeliefsRequest,
  ListDialecticsRequest,
  UpdateDialecticRequest,
  UpdateDialecticResponse,
  GetBeliefSystemRequest,
  GetBeliefSystemResponse,
} from "../generated/proto/epistemic_me_pb.js";
import { DialecticType, UserAnswer } from "../generated/proto/models/dialectic_pb.js";

export interface ClientConfig {
  baseUrl: string;
  useBinaryFormat?: boolean;
  credentials?: RequestCredentials;
}

export class EpistemicMeClient {
  private client: ReturnType<typeof createClient<typeof EpistemicMeService>>;

  constructor(config: ClientConfig) {
    const transport = createConnectTransport({
      baseUrl: config.baseUrl,
      useBinaryFormat: config.useBinaryFormat ?? false,
      credentials: config.credentials ?? "same-origin",
    });

    this.client = createClient(EpistemicMeService, transport);
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

  async listBeliefs(params: { userId: string }) {
    const request = new ListBeliefsRequest({
      selfModelId: params.userId
    });

    try {
      const response = await this.client.listBeliefs(request);
      return response.beliefs;
    } catch (error) {
      console.error("Error listing beliefs:", error);
      throw error;
    }
  }

  async listDialectics(params: { userId: string }) {
    const request = new ListDialecticsRequest({
      selfModelId: params.userId
    });

    try {
      const response = await this.client.listDialectics(request);
      return response.dialectics;
    } catch (error) {
      console.error("Error listing dialectics:", error);
      throw error;
    }
  }

  async createDialectic(params: {
    userId: string;
    dialecticType: DialecticType;
  }): Promise<CreateDialecticResponse> {
    const request = new CreateDialecticRequest({
      selfModelId: params.userId,
      dialecticType: params.dialecticType
    });

    try {
      return await this.client.createDialectic(request);
    } catch (error) {
      console.error("Error creating dialectic:", error);
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
} 