/**
 * mobCafeApi
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */
var http = require('http');
var mobConfig={};

module.exports=function(config){
    mobConfig=config;
    console.log('mobcafe config initialised: '+JSON.stringify(config));
    return mobCafeRest;
}
var mobCafeRest = function (reqData, callback) {
    if(reqData.options){
        reqData.options.hostname=mobConfig.hostname;
        reqData.options.port=mobConfig.port;
    }
    else{
        reqData.options={
            hostname:mobConfig.hostname,
            port:mobConfig.port
        }
    }

    var req = http.request(reqData.options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data = data + chunk;
        });
        res.on('end', function () {

            var obj = tryParseJSON(data);

            console.log('mobcafe response: '+JSON.stringify(obj));

            return callback(null, obj);

        });
    });

    req.on('error', function (err) {
        return callback(err);
    });

    if (reqData.payload) {
        req.write(JSON.stringify(reqData.payload));
    }
    req.end();
}


function tryParseJSON (string){
    try {
        var o = JSON.parse(string);

        return o;

    }
    catch (e) {
        return string;
    }
};