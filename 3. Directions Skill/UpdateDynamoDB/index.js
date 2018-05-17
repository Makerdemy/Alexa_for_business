var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback){
    if(event.create){
		var createArray = event.create;
		createArray.forEach(function(element){
			CreateItem(element.room, element.destination, element.direction, function(message){
				callback(null, message);    
			});
		});
	}else if(event.createDescription){
		var createArray = event.createDescription;
		createArray.forEach(function(element){
			CreateDescription(element.room, element.description, function(message){
				callback(null, message);    
			});
		});
	}
};

function CreateItem(room, destination, direction, callback){
    var params = {
        TableName:"Direction",
        Item:{
            "room": room,
            "destination": destination,
            "direction": direction
        }
    };
    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
			console.error(err);
            callback("Error occurred" );
        } else {
            console.log(data);
            callback("Added item(s)");
        }
    });    
}

function CreateDescription(room, description, callback){
    var params = {
        TableName:"Description",
        Item:{
            "room": room,
            "description": description
        }
    };
    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
			console.error(err);
            callback("Error occurred" );
        } else {
            console.log(data);
            callback("Added item(s)");
        }
    });    
}
