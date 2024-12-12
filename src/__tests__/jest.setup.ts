import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();
global.Headers = jest.fn();
global.Request = jest.fn();

// Create a proper Response mock
const mockResponse = jest.fn().mockImplementation((_body?: BodyInit | null, _init?: ResponseInit) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  json: () => Promise.resolve({}),
  error: () => new Response(null, { status: 400 }),
  redirect: (url: string | URL, status = 302) => new Response(null, {
    status,
    headers: { Location: url.toString() }
  }),
  body: null,
  bodyUsed: false,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
  text: () => Promise.resolve(''),
  clone: function() { return this; }
}));

global.Response = mockResponse as unknown as typeof Response;

beforeEach(() => {
  jest.resetAllMocks();
}); 