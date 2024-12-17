import { EpistemicMeClient } from '../src/client/grpcClient';
import { createConnectTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock both connect-web and connect
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