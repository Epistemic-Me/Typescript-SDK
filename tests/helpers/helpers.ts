import { ConnectError, Code } from "@connectrpc/connect";

export function createGrpcResponse(data: any) {
  const headers = new Headers({
    'content-type': 'application/json',
    'connect-protocol-version': '1'
  });

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    get: (name: string) => headers.get(name),
    clone: function() { return this; }
  };
}

export function createGrpcError(message: string) {
  return new ConnectError(message, Code.Unknown);
}