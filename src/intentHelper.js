/**
 * intentHelper
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */
var attributeHelper = require('./attributeHelper').attributeHelper;


var validator = {
    validateAndSetUserInput: function (key, value, ask, context) {
        var status = attributeHelper.setUserInput(key, value, context);
        validator.validate(status, key, value,ask, context);
    },

    validateAndSetNumUserInput: function (key, ask, context) {
        var status = attributeHelper.setNumInput(key, context);
        var value=context.event.request.intent.slots.anyNum.value;
        validator.validate(status, key, value,ask, context);
    },

    validate: function (status, key, value, ask, context) {
        var action = ask ? ':ask' : ':tell';
        switch (status) {
            case 'INVALID_VALUE':
            {
                var invalidMsg = appMessages.instructionMessages.INVALID_VALUE + ' ' + key;
                context.emit(action, invalidMsg, invalidMsg);
                break;
            }
            case 'UNDEFINED_VALUE':
            {
                //to do
                console.log('let us see..');
                break;
            }
            case 'DIFFERENT_VALUE':
            {
                //to do
                console.log('not expected in DIFFERENT_VALUE.');
                break;
            }
            default:
            {
                console.log('do nothing');
                break;
            }
        }
    }
};



var intentHelper = {
    setBuyInputs: function (context) {
        console.log('setting buy inputs');
        var intentSlots = context.event.request.intent.slots;
        console.log(JSON.stringify(intentSlots));
        validator.validateAndSetUserInput(slotKeys.ITEM, intentSlots.item.value, false, context);
        validator.validateAndSetUserInput(slotKeys.QUANTITY, intentSlots.quantity.value, false, context);
        validator.validateAndSetUserInput(slotKeys.USER_ID, intentSlots.userId.value, false, context);
    },

    setUserDueInputs: function (context) {
        console.log('setting user due inputs');
        var intentSlots = context.event.request.intent.slots;
        console.log(JSON.stringify(intentSlots));
        validator.validateAndSetUserInput(slotKeys.USER_CODE, intentSlots.userCode.value,false, context);
    },

    setUserPaymentInputs: function (context) {
        console.log('setting user due inputs');
        var intentSlots = context.event.request.intent.slots;
        console.log(JSON.stringify(intentSlots));
        validator.validateAndSetUserInput(slotKeys.USER_CODE, intentSlots.userCode.value,false, context);
        validator.validateAndSetUserInput(slotKeys.AMOUNT, intentSlots.amount.value,false, context);
    },

    setAuthInputs: function (context) {
        console.log('setting auth inputs');
        console.log(JSON.stringify(context));
        var intentSlots = context.event.request.intent.slots;
        validator.validateAndSetUserInput(slotKeys.USER_ID, intentSlots.userId.value,false, context); //ignore pin if userId is absent
        if (attributeHelper.getUserInput(slotKeys.USER_ID, context)) {
            attributeHelper.setUserInput(slotKeys.PIN, intentSlots.pin.value, context);
        }
        else {
            console.log('setting auth pin is ignored.');
        }
    },

    setAuthPinInputs: function (context) {
        console.log('setting auth pin inputs');
        var intentSlots = context.event.request.intent.slots;
        attributeHelper.setUserInput(slotKeys.PIN, intentSlots.pin.value, context);
    },

    setAmountInputs: function (context) {
        console.log('setting auth pin inputs');
        var intentSlots = context.event.request.intent.slots;
        attributeHelper.setUserInput(slotKeys.AMOUNT, intentSlots.amount.value, context);
    }
};
exports.intentHelper = intentHelper;
exports.validator = validator;
