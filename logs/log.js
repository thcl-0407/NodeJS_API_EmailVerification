const LogAction = (message, status)=>{
    let DateNow = new Date(Date.now()).toUTCString()
    let statusMessage = ""
    
    if(status){
        statusMessage = "Successfully"
    }else{
        statusMessage = "Failed"
    }  

    console.log(DateNow + ": " + message + " - " + statusMessage)
}

module.exports = {
    LogAction
}