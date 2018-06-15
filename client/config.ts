const penv = process.env;

const RECORD_SERVICE_HOST = penv.RECORD_SERVICE_HOST || "http://localhost"
const RECORD_SERVICE_PORT = penv.RECORD_SERVICE_PORT || 3000

export const constants = {    
    "RECORD_SERVICE_ENDPOINT":`${RECORD_SERVICE_HOST}:${RECORD_SERVICE_PORT}`
}
