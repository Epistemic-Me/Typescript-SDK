import { jest, beforeEach } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

// Mock console.error to be silent during tests
jest.spyOn(console, 'error').mockImplementation(() => {});

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock Response class
class MockResponse {
  constructor(
    public body: any = null,
    public init: ResponseInit = {}
  ) {}

  ok = true;
  status = 200;
  statusText = 'OK';
  headers = new Headers();
  bodyUsed = false;

  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  blob() {
    return Promise.resolve(new Blob());
  }

  formData() {
    return Promise.resolve(new FormData());
  }

  clone() {
    return new MockResponse(this.body, this.init);
  }
}

// Mock fetch globally
const mockFetch = jest.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> => 
    new MockResponse() as unknown as Response
);
global.fetch = mockFetch as unknown as typeof fetch;

global.Headers = Headers;

const mockRequest = jest.fn(
  (_input: RequestInfo | URL, _init?: RequestInit): Request => ({
    url: typeof _input === 'string' ? _input : _input.toString(),
    method: _init?.method || 'GET',
    headers: new Headers(_init?.headers),
  } as unknown as Request)
);
global.Request = mockRequest as unknown as typeof Request;

global.Response = MockResponse as unknown as typeof Response;

// Reset mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
});

export {}; 