import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock console.error to be silent during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

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
global.fetch = jest.fn();
global.Headers = Headers;
global.Request = jest.fn();
global.Response = MockResponse as unknown as typeof Response;

beforeEach(() => {
  jest.resetAllMocks();
});

export {}; 