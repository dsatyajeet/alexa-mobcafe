/**
 * mobCafeApi
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */

var mobCafeService;

module.exports = function (config) {
    mobCafeService = require('./mobCafe')(config);
    return api;
}

var api = {

    buyItem: function (userId, authPin, item, quantity, callback) {

        var headers = getHeaders(userId, authPin, 'application/json');

        var paylaod = {
            item: item,
            quantity: quantity
        }

        var reqData = {
            options: {
                path: '/alexa/buyItem',
                method: 'POST'
            }
        };
        reqData.options.headers = headers;
        reqData.payload = paylaod;
        mobCafeService(reqData, callback);
    },

    getMyDue: function (userId, authPin, callback) {

        var headers = getHeaders(userId, authPin);


        var reqData = {
            options: {
                path: '/alexa/myDue',
                method: 'GET'
            }
        };
        reqData.options.headers = headers;
        mobCafeService(reqData, callback);
    },

    getUserDue: function (userId, authPin,userCode, callback) {

        var headers = getHeaders(userId, authPin);
        var path='/alexa/userDue/'+userCode;

        var reqData = {
            options: {
                path: path,
                method: 'GET'
            }
        };
        reqData.options.headers = headers;
        mobCafeService(reqData, callback);
    }



};


function getHeaders(userId, authPin, contentType) {

    var authString = 'Bearer ' + userId + ':' + authPin;
    var headers = {
        'Authorization': authString
    }
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}