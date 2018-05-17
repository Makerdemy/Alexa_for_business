"use strict";
var Alexa = require("alexa-sdk");
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event,context);
    alexa.registerHandlers(Handler);
      initialise(event, function() {
        alexa.execute();
    });
};
function initialise(event,callback){
    if(event.session.attributes.maintenance === undefined){
        event.session.attributes.maintenance = {};
    }
    callback();
}
var Handler = {
    'LaunchRequest' : function(){
		var Welcome_message = ' Welcome to maintenance skill, does your Laptop or Air conditioner or Furniture need maintenance?  if the issue was not listed please tell, other issue ';
        this.emit(':askWithCard',Welcome_message,Welcome_message,'Maintenance Skill',Welcome_message);
    },
    'IssueIntent' : function(){
        delegateSlot.call(this);
        var issue = this.event.request.intent.slots.issue.value;
        this.attributes.maintenance.issue = issue;
        if(issue != "other"){
            var Intent_message = `We are sorry to hear that you are facing ${issue} issues, please tell us your name so that the maintenance team can address your issue `;
        }
        else{
            var Intent_message = `We are sorry to hear that you are facing an issue that was not listed, you can report about the issue in detail when you meet the maintenance team, please tell us your name so that the maintenance team can address your issue `;
        }
        this.emit(':ask',Intent_message,Intent_message);
    },
    'DetailsIntent' : function(){
      delegateSlot.call(this);
      var issue = this.attributes.maintenance.issue;
      var name = this.event.request.intent.slots.name.value;
      var place = this.event.request.intent.slots.place.value;
      this.attributes.maintenance.name = name;
      this.attributes.maintenance.place = place;
      var Intent_message = `Hello ${name}, a report regarding your ${issue} issue at ${place} is ready, shall I send it ? `;
      this.emit(':ask',Intent_message,Intent_message);
    },
    'AMAZON.YesIntent': function(){
      var self = this;
      var name = this.attributes.maintenance.name;
      var place = this.attributes.maintenance.place;
      var issue = this.attributes.maintenance.issue;
      var report_message = `Dear Maintenance team,\n ${name} is reporting a ${issue} issue at ${place}, please address this issue ASAP. \n Thanks. `;

	  var timestamp = this.event.request.timestamp;
      var UTCtime = timestamp.substring(timestamp.indexOf("T") + 1,timestamp.indexOf("Z"));
      var hour = parseInt(UTCtime.substring(0,UTCtime.indexOf(':'))) + 5;
      var minutes = parseInt(UTCtime.substring(UTCtime.indexOf(":")+1,UTCtime.indexOf(":")+3)) + 30;
      if (minutes >= 60){
          hour = hour + 1;
      }
      if(hour>23){
	        hour = hour -24;
      }
	  
	  var Slack_Success = "";
	  var SMS_Success = "";
	  
	  if(hour<15 || hour> 16){
        publishSNS(report_message,function(){
            SMS_Success += "and SMS alert"; 
      });
      PostSlack(report_message, function(){
            Slack_Success += "Slack message";
      });
      }
	  
      setTimeout(function() {
          var Intent_message = `Thanks ${name} for reporting your issue, we have sent ${Slack_Success} ${SMS_Success}, our maintenance team will get back to you. Have a nice day`;
          self.emit(':tell',Intent_message);}, 1000);
    },
    'AMAZON.NoIntent' : function(){
		var Cancel_message = 'I will not be reporting your maintenance issues to the team. Thanks for using the maintenance alert skill.';
        this.emit(':tell',Cancel_message);
    },
    'AMAZON.HelpIntent' : function(){
		var Help_message = 'This is a maintenance skill, I will help you to report your maintenance issues to the maintenance team. May I know your name?';
        this.emit(':ask',Help_message,Help_message);
    },
    'AMAZON.CancelIntent' : function(){
		var Cancel_message = 'I will not be reporting your maintenance issues to the team. Thanks for using the maintenance alert skill.';
        this.emit(':tell',Cancel_message);
    },
    'AMAZON.StopIntent' : function(){
        var Cancel_message = 'I will not be reporting your maintenance issues to the team. Thanks for using the maintenance alert skill.';
        this.emit(':tell',Cancel_message);
    }
};

    
function PostSlack(message, callback){
    var https = require('https');
    var url = require('url');
    var webhook_url = 'https://hooks.slack.com/services/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';
    var request_object = url.parse(webhook_url);
    request_object.method = 'POST';
    request_object.headers = {'Content-Type': 'application/json'};

    var request_instance = https.request(request_object, function (response) {
        if (response.statusCode === 200) {
          callback();
        } else {
          console.log('status code: ' + response.statusCode);
        }
        });
    request_instance.write(JSON.stringify({text: message})); 
    request_instance.end();
}

function delegateSlot(){
    if (this.event.request.dialogState === "STARTED") {
      var updatedIntent=this.event.request.intent;
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      this.emit(":delegate");
    } else {
      return this.event.request.intent;
    }
}


function publishSNS(message, callback){
	var AWS = require("aws-sdk");
    var sns = new AWS.SNS();
    var parameters = {
        Message: message , 
        TopicArn: "arn:aws:sns:us-east-1:585221204035:Maintenance"
    };
    sns.publish(parameters, function(error, data) {
        if (error) {
            console.log(error);
        }else{
            callback();
        }
    });
}