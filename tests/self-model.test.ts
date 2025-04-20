// Group 1: External imports
import { describe, test, expect, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// Group 2: Internal client imports
import { EpistemicMeClient } from '../src/client/grpcClient';

describe('SelfModel Integration Tests', () => {
  let client: EpistemicMeClient;
  let selfModelId: string;

  beforeAll(async () => {
    // Create client
    client = new EpistemicMeClient({
      baseUrl: 'http://localhost:8080'
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

  test('full self model integration flow', async () => {
    // Test CreateSelfModel
    selfModelId = uuidv4();
    const createResponse = await client.createSelfModel({
      id: selfModelId,
      philosophies: ['default']
    });
    
    if (!createResponse.selfModel) {
      throw new Error('Failed to create self model');
    }
    
    expect(createResponse.selfModel.id).toBe(selfModelId);
    expect(createResponse.selfModel.philosophies).toEqual(['default']);

    // Test GetSelfModel
    const getResponse = await client.getSelfModel({
      id: selfModelId
    });
    
    if (!getResponse.selfModel) {
      throw new Error('Failed to get self model');
    }
    
    expect(getResponse.selfModel.id).toBe(selfModelId);
    expect(getResponse.selfModel.philosophies).toEqual(['default']);

    // Test ListDialectics
    const listResponse = await client.listDialectics({
      selfModelId: selfModelId
    });
    
    expect(listResponse).toBeDefined();
    expect(Array.isArray(listResponse.dialectics)).toBe(true);
  });

  test('create self model', async () => {
    const selfModelId = uuidv4();
    const response = await client.createSelfModel({
      id: selfModelId,
      philosophies: ['default']
    });
    
    if (!response.selfModel) {
      throw new Error('Failed to create self model');
    }
    
    // Match Python test validations
    expect(response.selfModel.id).toBeDefined();
    expect(response.selfModel.philosophies).toBeDefined();
    expect(response.selfModel.beliefSystem).toBeDefined();
    expect(response.selfModel.dialectics).toBeDefined();
  });

  test('get self model', async () => {
    const selfModelId = uuidv4();
    
    await client.createSelfModel({
      id: selfModelId,
      philosophies: ['default']
    });
    
    const response = await client.getSelfModel({
      id: selfModelId
    });
    
    if (!response.selfModel) {
      throw new Error('Failed to get self model');
    }
    
    expect(response.selfModel.id).toBe(selfModelId);
    expect(response.selfModel.philosophies).toEqual(['default']);
  });

  test('list dialectics', async () => {
    const selfModelId = uuidv4();
    
    await client.createSelfModel({
      id: selfModelId,
      philosophies: ['default']
    });
    
    const response = await client.listDialectics({
      selfModelId: selfModelId
    });
    
    expect(response).toBeDefined();
    expect(Array.isArray(response.dialectics)).toBe(true);
  });

  test('add philosophy', async () => {
    // First create a self model
    const selfModelId = uuidv4();
    await client.createSelfModel({
      id: selfModelId,
      philosophies: ['default']
    });

    // Then add a philosophy
    const response = await client.addPhilosophy({
      selfModelId: selfModelId,
      philosophyId: 'phil_105'
    });

    if (!response.updatedSelfModel) {
      throw new Error('Failed to get updated self model');
    }

    expect(response.updatedSelfModel.philosophies).toContain('phil_105');
  });

  test('create philosophy', async () => {
    // Create a philosophy
    const createResponse = await client.createPhilosophy({
      description: '# Test Philosophy\n\n## Narrative\n[[C: Context1]] [[S: state1]] → [[S: state2]]',
      extrapolateContexts: true
    });

    expect(createResponse).toBeDefined();
    expect(createResponse.philosophy).toBeDefined();
    expect(createResponse.philosophy?.description).toBe('# Test Philosophy\n\n## Narrative\n[[C: Context1]] [[S: state1]] → [[S: state2]]');
    // New assertions for observation contexts
    expect(createResponse.extrapolatedObservationContexts).toBeDefined();
    expect(Array.isArray(createResponse.extrapolatedObservationContexts)).toBe(true);
    expect(createResponse.extrapolatedObservationContexts.length).toBeGreaterThan(0);
    const contextNames = createResponse.extrapolatedObservationContexts.map((ctx: any) => ctx.name);
    expect(contextNames).toEqual(expect.arrayContaining(['Context1', 'state1', 'state2']));
  });

  test('update philosophy', async () => {
    // First create a philosophy
    const createResponse = await client.createPhilosophy({
      description: '# UpdateMe\n\n## Narrative\n[[C: ContextA]] [[S: stateA]] → [[S: stateB]]',
      extrapolateContexts: false
    });
    const philosophyId = createResponse.philosophy?.id;
    expect(philosophyId).toBeDefined();

    // Now update the philosophy
    const updateResponse = await client.updatePhilosophy({
      philosophyId: philosophyId!,
      description: '# Updated Philosophy\n\n## Narrative\n[[C: Context2]] [[S: state3]] → [[S: state4]]',
      extrapolateContexts: true
    });

    expect(updateResponse).toBeDefined();
    expect(updateResponse.philosophy).toBeDefined();
    expect(updateResponse.philosophy?.description).toBe('# Updated Philosophy\n\n## Narrative\n[[C: Context2]] [[S: state3]] → [[S: state4]]');
    expect(updateResponse.philosophy?.id).toBe(philosophyId);
    // New assertions for observation contexts
    expect(updateResponse.extrapolatedObservationContexts).toBeDefined();
    expect(Array.isArray(updateResponse.extrapolatedObservationContexts)).toBe(true);
    expect(updateResponse.extrapolatedObservationContexts.length).toBeGreaterThan(0);
    const updateContextNames = updateResponse.extrapolatedObservationContexts.map((ctx: any) => ctx.name);
    expect(updateContextNames).toEqual(expect.arrayContaining(['Context2', 'state3', 'state4']));
  });
}); 