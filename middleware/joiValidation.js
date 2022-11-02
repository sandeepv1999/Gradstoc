module.exports.validateBodyRequest = async (data , schema)=>{
    let result = schema.validate(data);
    console.log('result',result);
    console.log('result 111111',result.error);
    if(result && result.error){
        let error ={
            message: result.error.details[0].message 
        }   
        throw error;
    }
}