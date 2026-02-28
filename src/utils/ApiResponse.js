class ApiResponse {
    constructor(statusCode, success = true , message = "success",data){
        this.statusCode = statusCode;
        this.success = success;
        this.message = message
        this.data = data;
    }
}