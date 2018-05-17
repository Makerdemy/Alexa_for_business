exports.handler = function(event, context,callback) {
	if(event.mainText){
	  Upload_S3(event.mainText, function (message){
		callback(null, message);
	});
	}
	else if(event.streamUrl){
	  Upload_Audio_S3(event.streamUrl, function (message){
		callback(null, message);
	}); 
	}
};

function Upload_S3(mainText, callback){
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    var updateDate = new Date();
    var parameters = {  Bucket: 'organizational.news.feed', 
                        Key: 'TextFeed.json', 
                        ACL : "public-read", 
                        Body: JSON.stringify({
                        	"uid": "urn:uuid:9022aee1-a25a-4b99-8e28-5fe271a94834",
                        	"updateDate": updateDate,
                        	"titleText": "Organizational News",
                        	"mainText": mainText
                        })
                     };
    s3.upload(parameters, function(error, data) {
        if (error){
          console.log(error);  
        }  
        else{
          console.log(data);           
          callback("successfully uploaded");  
        } 
    });
}

function Upload_Audio_S3(streamUrl, callback){
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    var updateDate = new Date();
    var parameters = {  Bucket: 'organizational.news.feed', 
                        Key: 'AudioFeed.json', 
                        ACL : "public-read", 
                        Body: JSON.stringify({
                            "uid":"urn:uuid:3a3ad5d4-e472-45d8-a858-f756f755bfb7",
                            "updateDate":updateDate,
                            "titleText":"Organizational News",
                            "mainText":"",
                            "streamUrl":streamUrl
                        })
                     };
    s3.upload(parameters, function(error, data) {
        if (error){
          console.log(error);  
        }  
        else{
          console.log(data);           
          callback("successfully uploaded");  
        } 
    });
}





