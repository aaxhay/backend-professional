class ApiError extends Error{
    constructor(
        statusCode,
        message = "something went wrong",
        success = false,
        errors = [],
        errorStack = ""
    ){
        super(message);
        this.message = message;
        this.errors = errors;
        this.statusCode = statusCode;
        this.success = false;
    }
}

export {ApiError}