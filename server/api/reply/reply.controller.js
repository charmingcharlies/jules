'use strict';
var mongoConfig = require('../../config/environment')
var mongo = require('mongodb').MongoClient
var DB;
var _ = require('lodash');
var accountSid = 'AC0d4f667900e2a6fea95046313f539958'; 
var authToken = '8dd9c7e404b9b17113030ae34db27443'; 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
var watson = require('watson-developer-cloud');

var question_and_answer_healthcare = watson.question_and_answer({
  username: '8a2c0b68-8e22-4ed4-931f-7f10c7e3b339',
  password: 'fyMSE9bnwewL',
  version: 'v1',
  dataset: 'healthcare'
});

var responses = ['I must admit, I really prefer questions that start with "what"','You can ask a better question than that!', "Who is Jules? I'll take potent potables for 500, Alex",'Please rephrase the nature of the medical emergency',"I'm sorry. My responses are limited. You must ask the right questions."]

 
// Get list of replys
exports.index = function(req, res){
  //req.body should contain all of the information from the incoming messages
  var question = req.body.Body
  var city = req.body.FromCity
  var state = req.body.FromState
  var zipcode = req.body.FromZip
  question_and_answer_healthcare.ask({text: question}, function (err, response) {
    var answer = response[0].question.evidencelist[0].text
    if(response[0].question.evidencelist[0].value > .3){
      client.messages.create({
        to: "+15105990762",
        from: "+14153196727",
        body: answer
      }, function(err, message){
        console.log(err);
        DB.collection('requests').insert({question : question, answer: answer, channel: 'sms', city: city, state: state, zipcode: zipcode})
        res.status(200);
        res.end();
      })
    } else if(response[0].question.evidencelist[0].value < .3){
      answer = responses[Math.floor(Math.random() * 4)]
      client.messages.create({
        to: "+15105990762",
        from: "+14153196727",
        body: answer
      }, function(err, message){
        console.log(err);
        res.status(200);
        res.end();
      })
      }
  });


};