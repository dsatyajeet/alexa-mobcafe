/**
 * helper
 *
 * @description:
 * @author: Satyajeet Deshmukh <sdeshmukh@mobiquityinc.com>
 */



var attributeHelper = {
    getUserInput: function (key, context) {
        return context.attributes.userInputs[key];
    },

    setUserInput: function (key, value, context) {
        function getKeyValString() {
            return '(' + key + ':' + value + ')';
        }

        console.log('Going to set user inputs for' + key + ' value:' + value);
        if (context.attributes.userInputs[key]) {// if property already exist in user inputs
            if (context.attributes.userInputs[key] != value) {
                console.log('invalid input values while setting user inputs for' + getKeyValString());
                return propertyState.DIFFERENT_VALUE;
            }
            else {
                console.log('no need to set user input for' + getKeyValString());
                return propertyState.SET;
            }
        }
        else {
            console.log('user input set successfully for' + getKeyValString());
            if(value) {
                if (value == '?') {
                    return propertyState.INVALID_VALUE;
                }
                else {
                    context.attributes.userInputs[key] = value;
                    return propertyState.SET;
                }
            }
            else{
                return propertyState.UNDEFINED_VALUE;
            }
        }
    },

    initUserInput: function (context) {
        if (!context.attributes.userInputs) {
            console.log('initialising user input block');
            context.attributes.userInputs = {};
        }
    },

    getPhase: function (context) {
        return context.attributes.phase;
    },

    setPhase: function (phase, context) {
        console.log('Going to replace phase' + context.attributes.phase + ' by ' + phase);
        context.attributes.phase = phase;
        console.log('phase set successfully: ' + phase);
    },
    setNumInput: function (key,context) {
        console.log('setting num input for :'+key);
        var intentSlots = context.event.request.intent.slots;
        return attributeHelper.setUserInput(key, intentSlots.anyNum.value, context);
    }
};

exports.attributeHelper=attributeHelper;