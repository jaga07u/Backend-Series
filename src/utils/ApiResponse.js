// class ApiResponse{
//     constructor(statuseCode,data,message="Success"){
//         this.statuseCode=statuseCode;
//         this.data=data
//         this.message=message
//         this.success=statuseCode <400
//     }
// }

class ApiResponse{
    constructor(
        statuscode,
        data,
        message="Success"
    ){
        this.statuscode=statuscode;
        this.data=data;
        this.message=message;
        this.success=statuscode <400
    }
}