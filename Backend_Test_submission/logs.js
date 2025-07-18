const fetch = require('node-fetch');
async function Log(stack, level, pkg, message) {
  const payload = {
    stack:stack,
    level:level,
    pkg:pkg,
    message:message,
  };

  try{
    const response = await fetch('http://20.244.56.144/evaluation-service/logs',{
        method: 'POST',
        header: {
            'Content-type': 'application/json'
        },
        body:JSON.stringify(payload)
    });

    if(!response.ok){
        console.log('Logging failed', await response.text())
    }
  }catch(error){
    console.log("Error: ",error)
  }
}

module.exports = Log;
