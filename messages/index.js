/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var StringBuilder = require('stringbuilder');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Welcome Dialog
const MainOptions = {
    Shop: 'CheckOut',
    Confirm: 'Confirm'
};

bot.dialog('/', [
    function (session) {
    
    if(session.message.text.trim().toUpperCase() === MainOptions.Shop.toUpperCase()){
        session.beginDialog('/start');
    }
    else {
    
    var welcomeCard = new builder.HeroCard(session)
        .title('Welcome to the Hotel')
        .subtitle('Please select an option!')
        .images([
            new builder.CardImage(session)
                .url('http://www.todayupfeed.com/wp-content/uploads/2016/03/mbs-facts-fun-660x330.jpg')
                .alt('Hotel')
        ])
        .buttons([
            builder.CardAction.imBack(session, MainOptions.Shop, MainOptions.Shop), 
        ]);

    session.send(new builder.Message(session)
        .addAttachment(welcomeCard));
    }
    }
    
]);

bot.dialog('/start', [
    function (session) {
        // builder.Prompts.number(session, "Please enter your room number :");
        builder.Prompts.text(session,"May I know your name ?");
    },
    function (session, results) {
        // session.userData.RoomNumber = results.response;
        session.userData.GuessName = results.response;
        // builder.Prompts.text(session, "Hi Please enter your name :"); 
        builder.Prompts.number(session,"Hi " + session.userData.GuessName + ", please enter your room number for verification :" )
    },
    function (session, results) {
        session.userData.RoomNumber = results.response;
        builder.Prompts.choice(session, "... and which Tower was the room?", ["Tower 1", "Tower 2", "Tower 3"]);
    },
    function (session, results) {
        session.userData.tower = results.response.entity;
        session.send("Thank for the information " + session.userData.GuessName + ". Please wait while we retriving your bill");
        session.beginDialog('/bill');
    }
    ]);
    
bot.dialog('/bill', [
    function (session) {
    
    if(session.message.text.trim().toUpperCase() === MainOptions.Confirm.toUpperCase()){
        session.send("Thanks for staying with us! Hope to see you soon");
        session.endDialog();
    }
    else {
        
    var BillCard = new builder.ReceiptCard(session)
        .title('Invoice')
        .facts([
            builder.Fact.create(session, '1234', 'Invoice No'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method'),
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 800.00', '2 Day Premier Room stay')
                .quantity(1)
                .image(builder.CardImage.create(session, 'http://www.marinabaysands.com/content/dam/singapore/marinabaysands/master/main/home/hotel/web%20redesign%20room%20images/Premier%20Room/premier-room-twin-city-500x454.jpg')),
            builder.ReceiptItem.create(session, '$ 200.00', 'Telephony charges')
                .quantity(720)
                .image(builder.CardImage.create(session, 'http://designtospec.com/wp-content/uploads/2015/05/Phone.png'))
        ])
        .tax('SGD $ 70.00')
        .total('SGD $ 1070.00')
        .buttons([
            builder.CardAction.imBack(session, MainOptions.Confirm, MainOptions.Confirm),  
        ]);

    session.send(new builder.Message(session)
        .addAttachment(BillCard));
    }
    }
    
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer(); 
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
