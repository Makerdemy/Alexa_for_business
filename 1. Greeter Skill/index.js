"use strict";
var Alexa = require("alexa-sdk");
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event,context);
    alexa.registerHandlers(Handler);
    alexa.execute();
};

var Handler = {
    'LaunchRequest' : function(){
        var Welcome_Message = "Hello, May I know your name?"; 
        this.emit(':ask',Welcome_Message,Welcome_Message);
    },
    'NameIntent' : function(){
        var name = this.event.request.intent.slots.Name.value;
        var timestamp = this.event.request.timestamp;
        var UTCtime = timestamp.substring(timestamp.indexOf("T") + 1,timestamp.indexOf("Z"));
        var hour = parseInt(UTCtime.substring(0,UTCtime.indexOf(':'))) + 5;
        var minutes = parseInt(UTCtime.substring(UTCtime.indexOf(":")+1,UTCtime.indexOf(":")+3)) + 30;
        if (minutes >= 60){
            hour = hour + 1;
        }
        var greet = "";
        if(hour>23){
	        hour = hour -24;
        }
        if ((hour >= 3) && (hour < 12)){
            greet = "Morning";
        } else if((hour >= 12) && (hour < 17)){
            greet = "Afternoon";
        } else if((hour >= 17 && hour < 24) || (hour >= 0 && hour < 3)) {
            greet = "Evening";
        }
        var Greet_Message = 'Good ' + greet + ', ' + name + ". Have a nice day";
        this.emit(':tell',Greet_Message);
    },
    'AMAZON.HelpIntent' : function(){
		var Help_message = 'This is a greeter skill, I will greet you according to the time of the day. May I know your name?'
        this.emit(':ask',Help_message,Help_message);
    },
    'AMAZON.CancelIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    },
    'AMAZON.StopIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    }
};
