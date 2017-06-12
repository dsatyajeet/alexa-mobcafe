/**
 * cafeIndex
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */

var Alexa = require('alexa-sdk');

global.appError = require('./errorCodes').appError;
global.states = {
    BUY_ITEM_MODE: 'BUY_ITEM_MODE',
    START_MODE: 'START_MODE',
    AUTH_MODE: 'AUTH_MODE',
    GET_AMOUNT_MODE: 'GET_AMOUNT_MODE',
    AUTH_PIN_MODE: 'AUTH_PIN_MODE',
    ASK_GUIDE_MODE: 'ASK_GUIDE_MODE',
    GUIDE_MENU_MODE: 'GUIDE_MENU_MODE',
    ADMIN_GUIDE_MODE:'ADMIN_GUIDE_MODE',
    CONSUMER_GUIDE_MODE:'CONSUMER_GUIDE_MODE'
};

global.propertyState = {
    SET: 'SET',
    INVALID_VALUE: 'INVALID_VALUE',
    DIFFERENT_VALUE: 'INVALID_VALUE',
    UNDEFINED_VALUE: 'UNDEFINED_VALUE'
};

global.slotKeys = {
    USER_ID: 'userId',
    USER_CODE: 'userCode',
    AMOUNT: 'amount',
    PIN: 'pin',
    ITEM: 'item',
    QUANTITY: 'quantity',
    OPTION: 'option'
};

global.appMessages = {
    instructionMessages: {
        SPECIFY_USER_ID_AND_PIN: 'Kindly specify user id and password., for example, my id is two and password is 12563.',
        SPECIFY_PIN: 'Kindly specify password., for example, my password is 678543.',
        SPECIFY_ITEM_AND_QUANTITY: 'Please specify the name of food item and quantity, you want to buy.',
        SPECIFY_QUANTITY: 'How many items you want to buy ?',
        SPECIFY_AMOUNT: 'What amount you wants to credit ?',
        INVALID_INPUT_FOR_GET_USER_STATUS: 'user code is not provided to get user due status.',
        INVALID_INPUTS: 'You have specified different values for',
        INVALID_VALUE: 'You have specified invalid value for',
        HELP_MENU:'Say 1 to know consumer\'s voice commands. Say 2 to know admin\'s voice commands',
        CLOSE_HELP:'Thank you, you can still ask me for help, if required.',
        CONSUMER_INFO:'You can ask me to buy food items by saying, Alexa, buy 2 coke for me. Or you could know the due status by asking, Alexa get my due status. Thank you',
        ADMIN_INFO:'You can ask me to know consumer\'s due charges by saying, Alexa, get me the due status of 123. Or if you could make user\'s payment by saying Alexa, make the payment 123. Thank you',
        INVALID_CHOICE:'You have specified invalid choice, see you next time.'
    },
    promptMessages: {
        SPECIFY_USER_ID_AND_PIN: 'Kindly specify valid user code and pin., for example, my user code and pin are 123 and 678543 respectively.',
        SPECIFY_PIN: 'Kindly specify valid pin., for example, my pin is 123765.',
        SPECIFY_VALID_AMOUNT: 'Kindly specify valid amount., for example, amount is 340.',
        ASK_HELP:"Found something wrong in your command. Let me know if you want to know about Mob Cafe's voice commands. Please answer in yes or no.",
        ASK_YES_NO_CHOICE:'Kindly answer in yes or no.'
    }
};
global.mobCafeApiConfig = {
    hostname: '34.201.136.187',
    port: 4000
}


var attributeHelper = require('./attributeHelper').attributeHelper;
var intentHelper = require('./intentHelper').intentHelper;
var intentValidator = require('./intentHelper').validator;

var intentService = require('./intentService').intentService;

// This is the intial welcome message
var welcomeMessage = "Welcome to decision tree, are you ready to play?";

// This is the message that is repeated if the response to the initial welcome message is not heard
var repeatWelcomeMessage = "Say yes to start the game or no to quit.";


// set state to start up and  welcome the user
var newSessionHandler = {
    'LaunchRequest': function () {
        this.handler.state = states.START_MODE;
        console.log('in launch request: ' + this.handler.state);
        this.emit(':tell', welcomeMessage, repeatWelcomeMessage);
    },
    'AMAZON.HelpIntent': function () {
        this.handler.state = states.GUIDE_MENU_MODE;
        console.log('in help intent : ' + this.handler.state);
        this.emit(':ask', appMessages.instructionMessages.HELP_MENU, appMessages.instructionMessages.HELP_MENU);
    },
    'BuyIntent': function () {
        console.log('in buy intent 2');
        attributeHelper.initUserInput(this);
        intentHelper.setBuyInputs(this);
        intentService.buyItem(this);
    },
    'GetMyDueIntent': function () {
        console.log('in GetMyDueIntent');
        attributeHelper.initUserInput(this);
        intentService.getMyDue(this);
    },
    'GetUserDueIntent': function () {
        console.log('in GetUserDueIntent');
        attributeHelper.initUserInput(this);
        intentHelper.setUserDueInputs(this);
        intentService.getUserDue(this);
    },
    'MakePaymentIntent': function () {
        console.log('in MakePaymentIntent');
        attributeHelper.initUserInput(this);
        intentHelper.setUserPaymentInputs(this);
        intentService.makePayment(this);
    },
    'Unhandled': function () {
        console.log('newSession unhandled state: ' + this.handler.state);
        this.handler.state = states.ASK_GUIDE_MODE;
        this.emit(':ask', appMessages.promptMessages.ASK_HELP, appMessages.promptMessages.ASK_HELP);
    }
};


// --------------- Handlers -----------------------

var authHandler = Alexa.CreateStateHandler(states.AUTH_MODE, {

    'AuthIntent': function () {
        console.log('in auth intent 2');
        intentHelper.setAuthInputs(this);// sets userId and pin
        intentService.authenticateUser(this);
    },
    'GetNumIntent': function () {
        console.log('in GetNumIntent of state GET_AMOUNT_MODE');
        intentValidator.validateAndSetNumUserInput(slotKeys.USER_ID, true, this);//sets userId only
        intentService.authenticateUser(this);
    },

    'Unhandled': function () {
        console.log('unhandled AuthIntent');
        this.emit(':ask', appMessages.instructionMessages.SPECIFY_USER_ID_AND_PIN, appMessages.instructionMessages.SPECIFY_USER_ID_AND_PIN);
    }
});

var getAmountHandler = Alexa.CreateStateHandler(states.GET_AMOUNT_MODE, {

    'GetAmountIntent': function () {
        console.log('in GetAmountIntent');
        intentHelper.setAmountInputs(this);// sets userId and pin
        intentService.makePayment(this);
    },

    'GetNumIntent': function () {
        console.log('in GetNumIntent of state GET_AMOUNT_MODE');
        intentValidator.validateAndSetNumUserInput(slotKeys.AMOUNT, true, this);
        intentService.makePayment(this);
    },

    'Unhandled': function () {
        console.log('unhandled GetAmountIntent');
        this.emit(':ask', appMessages.promptMessages.SPECIFY_VALID_AMOUNT, appMessages.promptMessages.SPECIFY_VALID_AMOUNT);
    }
});

var authPinHandler = Alexa.CreateStateHandler(states.AUTH_PIN_MODE, {

    'AuthPinIntent': function () {
        console.log('in auth pin intent 2');
        intentHelper.setAuthPinInputs(this);
        intentService.authenticateUser(this);
    },

    'GetNumIntent': function () {
        console.log('in GetNumIntent of state AUTH_PIN_MODE');
        intentValidator.validateAndSetNumUserInput(slotKeys.PIN, true, this);
        intentService.authenticateUser(this);
    },

    'Unhandled': function () {
        console.log('unhandled AuthPinIntent');
        this.emit(':ask', appMessages.promptMessages.SPECIFY_PIN, appMessages.promptMessages.SPECIFY_PIN);
    }
});


var askHelpHandler = Alexa.CreateStateHandler(states.ASK_GUIDE_MODE, {

    'AMAZON.YesIntent': function () {
        console.log('in ask help yes intent');
        this.handler.state=states.GUIDE_MENU_MODE;
        this.emit(':ask', appMessages.instructionMessages.HELP_MENU, appMessages.instructionMessages.HELP_MENU);
    },

    'AMAZON.NoIntent': function () {
        console.log('in ask help no intent');
        this.handler.state=states.START_MODE;
        this.emit(':ask', appMessages.instructionMessages.CLOSE_HELP, appMessages.instructionMessages.CLOSE_HELP);
    },

    'Unhandled': function () {
        console.log('unhandled AuthIntent');
        this.emit(':ask', appMessages.promptMessages.ASK_YES_NO_CHOICE, appMessages.instructionMessages.ASK_YES_NO_CHOICE);
    }
});

var guideMenuHandler = Alexa.CreateStateHandler(states.GUIDE_MENU_MODE, {

    'GetNumIntent': function () {
        console.log('in GetNumIntent of state GUIDE_MENU_MODE');
        attributeHelper.initUserInput(this);
        this.handler.state=states.START_MODE;
        intentValidator.validateAndSetNumUserInput(slotKeys.OPTION, false, this);
        intentService.assistUser(this);
    },

    'Unhandled': function () {
        console.log('unhandled guide menu');
        this.handler.state=states.START_MODE;
        this.emit(':tell', appMessages.instructionMessages.INVALID_CHOICE, appMessages.instructionMessages.INVALID_CHOICE);
    }
});



// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, authHandler, authPinHandler, getAmountHandler,askHelpHandler, guideMenuHandler);
    alexa.execute();
};