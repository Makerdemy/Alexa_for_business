"use strict";
var Alexa = require("alexa-sdk");
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var Room1skillID = "amzn1.ask.skill.cc5ab3cd-d301-4a6e-8c45-1530eed7898d";
var Room2skillID = "amzn1.ask.skill.54b30bcc-9213-418c-b51d-a403149c2888";


exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    initialise(event, function() {
        alexa.execute();
    });
    
};

function initialise(event,callback){
    if(event.session.attributes.direction === undefined){
        event.session.attributes.direction = {};
    }
    callback();
}

var handlers = {
    'LaunchRequest': function () {
        var self = this;
        if(this.event.session.application.applicationId === Room1skillID){
            this.attributes.direction.SetRoom = "room 1";
            var otherplaces = "Room 2, Room 3 and Room 4";
        }else if(this.event.session.application.applicationId === Room2skillID){
            this.attributes.direction.SetRoom = "room 2";
            var otherplaces = "Room 1, Room 3 and Room 4";
        }
        var Welcome_Message = 'Welcome to ' + this.attributes.direction.SetRoom;
        getDescription(this.attributes.direction.SetRoom, function(message){
                    if(message){
                        Welcome_Message += `, ${message}. I can guide you to ${otherplaces} , where do you want to go? `;
                        self.emit(':ask', Welcome_Message, Welcome_Message);
                    }else{
                        self.emit(':tell',"An error occurred while retrieving data");
                    }            
        });
    },
    'DirectionIntent':function(){
        delegateSlot.call(this);
        var destination = this.event.request.intent.slots.room.value;
        this.attributes.direction.Setdestination = destination; 
        var self = this;
        var convention = "The directions that I am going to say is considering that you are facing me";
        getDescription(destination, function(message){
                    if(message){
                        getDirection(self.attributes.direction.SetRoom, destination, function(direction){
                            if(direction){
                                var Intent_Message = `${destination}, ${message}. ${convention}. ${direction}. Do you want me to repeat the direction ?`;
                                self.emit(':ask', Intent_Message, Intent_Message);
                            }else{
                                self.emit(':tell',"An error occurred while retrieving data");
                            }
                        });
                        
                    }else{
                        self.emit(':tell',"An error occurred while retrieving data");
                    }            
        });
    },
    'AMAZON.YesIntent' : function(){
        var destination = this.attributes.direction.Setdestination;
        var convention = "The directions that I am going to say is considering that you are facing me";
        var self = this;
        getDirection(this.attributes.direction.SetRoom, destination, function(direction){
                            if(direction){
                                var Intent_Message = `${convention}. ${direction}. Do you want me to repeat the direction ?`;
                                self.emit(':ask', Intent_Message, Intent_Message);
                            }else{
                                self.emit(':tell',"An error occurred while retrieving data");
                            }
                        });
    },
    'AMAZON.NoIntent' : function(){
        var destination = this.attributes.direction.Setdestination;
        this.emit(':tell',`Have a nice time in ${destination}. Good bye`);
    },
    'AMAZON.CancelIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    },
    'AMAZON.StopIntent' : function(){
        this.emit(':tell','Thank you, See you again');
    },
    'AMAZON.HelpIntent' : function(){
        var Help_Message = "I can guide you to Room 2, Room 3 and Room 4, where do you want to go?";
        this.emit(':ask',Help_Message,Help_Message);
    }
};

function getDescription(room, callback){
    var params = {
    TableName : "Description",
    KeyConditionExpression: "room = :room1",
    ExpressionAttributeValues: {
        ":room1":room
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error(err);
    } else {
        data.Items.forEach(function(item) {
            callback(item.description);
        });
    }
});
}


function getDirection(room, destination, callback){
    var params = {
    TableName : "Direction",
    KeyConditionExpression: "room = :room1 and destination = :destination1",
    ExpressionAttributeValues: {
        ":room1":room,
        ":destination1": destination
    }
};

docClient.query(params, function(err, data) {
    if (err) {
		console.error(err);
    } else {
        data.Items.forEach(function(item) {
            callback(item.direction);
        });
    }
});
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
