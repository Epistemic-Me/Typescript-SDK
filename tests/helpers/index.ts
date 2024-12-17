export function createGrpcResponse<T>(data: T) {
  return {
    status: 200,
    data
  };
}

export function createGrpcError(message: string, code = 500) {
  return {
    status: code,
    message
  };
} 