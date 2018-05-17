"use strict";
var Alexa = require("alexa-sdk");
var AWS = require('aws-sdk');    
var ses = new AWS.SES();
const mailId = {'haresh':'haresh@makerdemy.com','kevin':'kevin@makerdemy.com','vignesh':'vigneshwar@makerdemy.com'};
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event,context);
    alexa.registerHandlers(Handler);
    initialise(event, function() {
        alexa.execute();
    });
};
function initialise(event,callback){
    if(event.session.attributes.mail === undefined){
        event.session.attributes.mail = {};
    }
    callback();
}
var Handler = {
    'LaunchRequest' : function(){
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

		var Welcome_message = ' Good ' + greet + ', may I know your name? ';
        this.emit(':askWithCard',Welcome_message,Welcome_message,'Mail Skill',Welcome_message);
    },
    'PrimaryDetailsIntent' : function(){
        delegateSlot.call(this);
        var name = this.event.request.intent.slots.Name.value;
        var recipient = this.event.request.intent.slots.Recipient.value;
        this.attributes.mail.From = name.toLowerCase();
        this.attributes.mail.To = recipient.toLowerCase();
        var speech = 'Choose the purpose of the mail to '+ recipient + ', leave or meeting';
        this.emit(':askWithCard',speech,speech,'Mail Skill', speech);
    },
    'LeaveIntent' :function(){
        delegateSlot.call(this);
        var parameters = {
            from : this.attributes.mail.From,
            to : this.attributes.mail.To,
            days : this.event.request.intent.slots.days.value,
            fromdate : this.event.request.intent.slots.fromdate.value,
            todate : this.event.request.intent.slots.todate.value,
            reason : this.event.request.intent.slots.reason.value,
        };
        
        if((parameters.fromdate != undefined) && (parameters.days != undefined)&&(parameters.reason != undefined)&&(parameters.todate)!=undefined){
                this.attributes.mail.parameters = parameters;
                var confirmation_message = `Are you sure you want to send an email to ${parameters.to}, regarding a leave for ${parameters.days} days from ${parameters.fromdate} to ${parameters.todate} for ${parameters.reason} reasons?`;
                this.emit(":ask",confirmation_message,confirmation_message);
        }
    },
    'AMAZON.YesIntent' : function(){
        var self = this;
        sendEmail(this.attributes.mail.parameters);
        function sendEmail(parameters){
            var eParams = {
		        Destination: {                                          
			        ToAddresses: [mailId[parameters.to]]                               
		        },
		        Message: {                                            
			        Body: {
				        Text: {
					        Data: `I would like to take ${parameters.days} days leave from ${parameters.fromdate} to ${parameters.todate} \n Reason: ${parameters.reason}`      
				        }
			        },
			        Subject: {                                       
				        Data: "Applying for leave"  
			            }                                               
		            },
		            Source: mailId[parameters.from]                    
	        };
	        ses.sendEmail(eParams, function(err, data){            
    		    if(err){
    		      console.log(err);
    		      self.emit(':tell','There was an error while requesting the mail service');
    		    } 
    		    else {
    			    self.emit(':tell',`A leave mail has been sent from ${parameters.from} to ${parameters.to}, Happy holidays`);
    		   }
	       });
        }
        
    },
    'AMAZON.NoIntent' : function(){
        this.emit(':tell','I am cancelling everything, to start over please invoke the skill again, Thank you');
    },
    'AMAZON.CancelIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    },
    'AMAZON.StopIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    },
    'AMAZON.HelpIntent' : function(){
        var Help_Message = 'This is a Mail Skill that will allow you to send mail with in your organization, can you please tell your name ?'; 
        this.emit(':ask', Help_Message, Help_Message);
    }
};

function delegateSlot(){
    if (this.event.request.dialogState === "STARTED") {
      var updatedIntent=this.event.request.intent;
      this.emit(":delegate",updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(":delegate");
    } else {
      return this.event.request.intent;
    }
}

