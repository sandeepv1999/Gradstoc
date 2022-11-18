module.exports.validateBodyRequest = async (data , schema)=>{
    let result = schema.validate(data);
    if(result && result.error){
        let error ={
            message: result.error.details[0].message 
        }   
        throw error;
    }
}