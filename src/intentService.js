/**
 * validator
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */
var attributeHelper = require('./attributeHelper').attributeHelper;
var phases = {ITEM_CONFIRMED: 'ITEM_CONFIRMED', MY_DUE: 'MY_DUE', USER_DUE: 'USER_DUE', MAKE_PAYMENT: 'MAKE_PAYMENT'};
var clientMobCafe = require('./mobcafe-sdk/mobCafeApi')(mobCafeApiConfig);

var intentService = {
    authenticateUser: function (context) {
        if (!attributeHelper.getUserInput(slotKeys.USER_ID, context)) {
            context.handler.state = states.AUTH_MODE;
            context.emit(':ask', appMessages.instructionMessages.SPECIFY_USER_ID_AND_PIN, appMessages.instructionMessages.SPECIFY_USER_ID_AND_PIN);
        }
        else {
            if (!attributeHelper.getUserInput(slotKeys.PIN, context)) {
                context.handler.state = states.AUTH_PIN_MODE;
                context.emit(':ask', appMessages.instructionMessages.SPECIFY_PIN, appMessages.instructionMessages.SPECIFY_PIN);
            }
            else {
                context.handler.state = states.START_MODE;
                alexaHandler(context);
            }
        }
    },

    buyItem: function (context) {
        console.log('validating buy request');
        //if item not exist ask for both item and quantity and terminate session
        // This condition is never expected to true, because buy intent will not be qualified if item slot value is absent.
        if (!attributeHelper.getUserInput(slotKeys.ITEM, context)) {
            console.log('item not exist: ');
            context.emit(':tell', appMessages.instructionMessages.SPECIFY_ITEM_AND_QUANTITY);
        }
        else {
            console.log('item exist: ' + attributeHelper.getUserInput(slotKeys.ITEM, context));
            //check for quantity
            if (!attributeHelper.getUserInput(slotKeys.QUANTITY, context)) {
                console.log('quantity is absent');
                context.emit(':ask', appMessages.instructionMessages.SPECIFY_QUANTITY);
            }
            else {
                //item gets confirmed.
                attributeHelper.setPhase(phases.ITEM_CONFIRMED, context); //item gets confirmed here
                console.log('item got confirmed');
                intentService.authenticateUser(context);        //start for validating and asking user credentials.
            }
        }
    },
    // does not perform any validation, just follows the pattern.
    getMyDue: function (context) {
        console.log('validating my due request');
        attributeHelper.setPhase(phases.MY_DUE, context);
        console.log('item got confirmed');
        intentService.authenticateUser(context);
    },

    getUserDue: function (context) {
        console.log('validating user due request');
        if (!attributeHelper.getUserInput(slotKeys.USER_CODE, context)) {
            console.log('userCode not provided:');
            context.emit(':tell', appMessages.instructionMessages.INVALID_INPUT_FOR_GET_USER_STATUS);
        }
        attributeHelper.setPhase(phases.USER_DUE, context); //item gets confirmed here
        console.log('user due request confirmed');
        intentService.authenticateUser(context);
    },

    makePayment: function (context) {
        console.log('validating payment request');
        if (!attributeHelper.getUserInput(slotKeys.USER_CODE, context)) {
            console.log('userCode not exist: ');
            context.emit(':tell', appMessages.instructionMessages.INVALID_INPUT_FOR_GET_USER_STATUS);
        }
        else {
            if (!attributeHelper.getUserInput(slotKeys.AMOUNT, context)) {
                console.log('amount not exist: ');
                context.handler.state = states.GET_AMOUNT_MODE;
                context.emit(':ask', appMessages.instructionMessages.SPECIFY_AMOUNT, appMessages.instructionMessages.SPECIFY_AMOUNT);
            }
            else {
                attributeHelper.setPhase(phases.MAKE_PAYMENT, context);
                console.log('user due request confirmed');
                intentService.authenticateUser(context);
            }
        }
    },

    assistUser:function(context){
        var option=attributeHelper.getUserInput(slotKeys.OPTION,context);
        console.log('assist choice: '+option);
        switch (option){
            case '1':{
                context.emit(':tell',appMessages.instructionMessages.CONSUMER_INFO,appMessages.instructionMessages.CONSUMER_INFO);
                break;
            }
            case '2':{
                context.emit(':tell',appMessages.instructionMessages.ADMIN_INFO,appMessages.instructionMessages.ADMIN_INFO);
                break;
            }
            case '3':{
                context.emit(':tell',appMessages.instructionMessages.CLOSE_HELP,appMessages.instructionMessages.CLOSE_HELP);
                break;
            }
            default:{
                context.emit(':tell',appMessages.instructionMessages.INVALID_CHOICE,appMessages.instructionMessages.INVALID_CHOICE);
            }
        }
    }

};

function alexaHandler(context) {
    //MY_DUE
    switch (attributeHelper.getPhase(context)) {
        case 'ITEM_CONFIRMED':
        {
            console.log('calling mobCafe api for buy item');
            clientMobCafe.buyItem(attributeHelper.getUserInput(slotKeys.USER_ID, context),
                attributeHelper.getUserInput(slotKeys.PIN, context),
                attributeHelper.getUserInput(slotKeys.ITEM, context),
                attributeHelper.getUserInput(slotKeys.QUANTITY, context),
                alexaResponse);
            break;
        }
        case 'MY_DUE':
        {
            console.log('calling mobCafe api for get my due');
            clientMobCafe.getMyDue(attributeHelper.getUserInput(slotKeys.USER_ID, context),
                attributeHelper.getUserInput(slotKeys.PIN, context),
                alexaResponse);
            break;
        }

        case 'USER_DUE':
        {
            console.log('calling mobCafe api for get user due');
            clientMobCafe.getUserDue(attributeHelper.getUserInput(slotKeys.USER_ID, context),
                attributeHelper.getUserInput(slotKeys.PIN, context),
                attributeHelper.getUserInput(slotKeys.USER_CODE, context),
                alexaResponse);
            break;
        }

        case 'MAKE_PAYMENT':
        {
            console.log('calling mobCafe api for make payment');
            context.emit(':tell', 'This feature is under progress, sorry for inconvenience');
            break;
        }

        default:
        {
            console.log('not expected default case in alexaHandler');
            break;
        }
    }

    function alexaResponse(err, data) {
        console.log('before final response by alexa')
        context.handler.state = states.START_MODE;
        if (err) {
            console.log('error on calling mobCafe api: ' + JSON.stringify(err));
            context.emit(':tell', 'Sorry, could not proceed the request, Kindly report to the admin.');
        }
        else {
            if (data) {
                console.log('data received successfully on calling mobCafe api: ' + JSON.stringify(data));
                var msg = data.message || data.errorMessage;
                if (msg) {
                    context.emit(':tell', msg);
                }
                else {
                    context.emit(':tell', 'Sorry, could not proceed the request successfully, Kindly report to the admin.');
                }
            }
            else {
                console.log('received blank response on calling mobCafe api: ');
                context.emit(':tell', 'Sorry, could not complete the request successfully, Kindly report to the admin.');
            }
        }
    }

}
exports.intentService = intentService;