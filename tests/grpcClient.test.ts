import { createConnectTransport } from '@connectrpc/connect-web';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { EpistemicMeClient } from '../src/client/grpcClient';

// Keep existing mocks
jest.mock('@connectrpc/connect-web', () => ({
  createConnectTransport: jest.fn()
}));

jest.mock('@connectrpc/connect', () => ({
  createClient: jest.fn()
}));

describe('EpistemicMeClient', () => {
  let client: EpistemicMeClient;
  
  beforeEach(() => {
    client = new EpistemicMeClient({
      baseUrl: 'http://localhost:8080',
      origin: 'http://localhost:3000'
    });
  });

  // Keep existing tests
  it('configures transport for CORS', () => {
    expect(createConnectTransport).toHaveBeenCalledWith(expect.objectContaining({
      baseUrl: 'http://localhost:8080',
      useBinaryFormat: false,
      defaultTimeoutMs: 5000,
      credentials: "include",
      interceptors: expect.arrayContaining([expect.any(Function)])
    }));
  });

  it('adds API key to headers when provided', () => {
    const clientWithKey = new EpistemicMeClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-api-key'
    });
    
    expect(createConnectTransport).toHaveBeenLastCalledWith(
      expect.objectContaining({
        interceptors: expect.arrayContaining([expect.any(Function)])
      })
    );
  });
}); 