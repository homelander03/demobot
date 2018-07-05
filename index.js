'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

let port = process.env.PORT || 1299;
let host = '0.0.0.0';
//ALLOWS TO PROCESS THE DATA
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json())

//ROUTES
app.get('/',function(req,res)
{
	console.log("in get");
	res.send("Hi Iam a chatbot")
})

//INITIALIZING FACEBOOK TOKEN
let token = "EAADusqcRJA8BAHpj11nEGm7hZAJN1VDB1skwN4hInLEVFjcAKtYQn9UOi1WVvhrvnxcdEMAkQa6giByzucUnWOydl1jf0ZCPQZCqdZCZAQly0a5fi0fhspSeWDBdT7aCTWNxGWdsFVc9KzwWbG3okFd2MtZCWpoBO04BVgjAtaKAZDZD";

//VERIFIYING FACEBOOK TOKEN
app.get('/webhook/',function(req,res) {
	if(req.query['hub.verify_token'] === "Msrapp")
	{
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong Token")
})
app.post('/webhook/',function(req,res)
{
	console.log("Success");
	let messaging_events = req.body.entry[0].messaging;
	for(let i=0 ; i<messaging_events.length ; i++)
	{
		let event = messaging_events[i];
		let sender = event.sender.id;
		console.log(event);
		if(event.message && event.message.text)
		{
			let text = event.message.text;
			//sendText(sender, "Text echo: " + text.substring(0,100));
			decideMessage(sender,text);
		}
		//POSTBACK EVENT
		if(event.postback())
		{
			let text = JSON.stringify(event.postback);
			decideMessage(sender,text);
			continue;
		}
	}
	res.sendStatus(200)
})

//CONVERTING THE MESSAGE TO LOWER CASE
function decideMessage(sender,text1){
	let text = text1.toLowerCase();
	if(text.includes("postpaid")){
		sendImageMessages(sender);
	}
	else if(text.includes("prepaid")){
		sendGenericMessages(sender);
	}
	else{
		sendText(sender,"We help you to choose best plan");
		sendMessageButton(sender,"Please select your respective plan");
	}
}

function sendText(sender,text)
{
	let messageData = {text:text};
	sendRequest(sender,messageData);
}
//FUNCTION FOR MESSAGE BUTTONS
function sendMessageButton(sender,text){
	let messageData = {
		"message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": text,
        "buttons":[
          {
            "type":"postback",
            "title":"Prepaid",
            "payload":"prepaid"
          },
          {
            "type":"postback",
            "title":"Postpaid",
            "payload":"postpaid"
          },
        ]
      }
    }
  }
	}
	sendRequest(sender,messageData);
}
//SENDING IMAGE MESSAGES
function sendImageMessages(sender){
	let messageData={
			"attachment":{
				"type":"image",
				"payload":{
					"url":"https://i.ndtvimg.com/i/2017-12/airtel-prepaid-recharge-plan_650x400_71513785511.jpg"
				}
			}
	}
	sendRequest(sender,messageData);
}
//SENDING GENERIC MESSAGES
function sendGenericMessages(sender,text){

	messageData = {
		"message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Postpaid",
            "image_url":"http://4.bp.blogspot.com/-aUzek5bGxfY/UIDbQvU682I/AAAAAAAAKBg/FB4SejlAFYg/s1600/airtel-4G-tariffs-pune-postpaid+users.jpg",
            "subtitle":"Here is the Best plan for you", 
            "default_action": {
              "type": "web_url",
              "url": "https://petersfancybrownhats.com/view?item=103",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://www.airtel.in/4g/",
                "title":"Airtel For you"
              }              
            ]      
          }
        ]
      }
    }
  }
	}
	sendRequest(sender,messageData);
}
function sendRequest(sender,messageData){
	request({
		url:"https://graph.facebook.com/me/messages",
		qs : {access_token:token},
		method : "POST",
		json:{
			recipient : {id: sender},
			message : messageData
		}
	}, function(error , response ,body){
		if(error){
			console.log("sending error");
		}
		else if(response.body.error)
		{
			console.log("response body error");
		}
	})	
}
//LISTENING THE REQUESTS
app.listen( process.env.PORT || 1299,function(){
	console.log("running");
});
