class ApiResponse {
  constructor(statusCode, message = "success", data) {
    this.statusCode = statusCode < 400;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
