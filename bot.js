var botkit = require('botkit');
var request = require('request');
var cheerio = require('cheerio');

// Parse Pollen info
var baseUrl = 'http://www.tenki.jp/pollen/3/16/';
function getMessage(command, callback){
  request(baseUrl + '/', function(_, res) {
    var $ = cheerio.load(res.body);
    var today = $('#AreaWeathersToday').text();
    $('#AreaWeathers tr').each(function(i, element) {
      if (i>=3 && i<=3){ // 東京都(千代田区)
        $('td', element).each(function(i, e){
          if (i==0){
            var image = $('img', e).attr("src");
            var alt = $('img', e).attr("alt");
            return callback(today, image, alt);
          }
        })
      }
    });
  });
}

// Redis
var redisStorage = require('botkit-storage-redis')({
  url: process.env.REDISTOGO_URL
});

var controller = botkit.slackbot({
  debug: false,
  storage: redisStorage
}).configureSlackApp({
  clientId: process.env.BOTKIT_SLACK_CLIENT_ID,
  clientSecret: process.env.BOTKIT_SLACK_CLIENT_SECRET,
  scopes: ['commands']
});

// Bot Server
controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('Error: ' + JSON.stringify(err));
    } else {
      res.send('Success');
    }
  });
});

// Slash command
controller.on('slash_command', function(bot, message) {
  switch (message.command) {
  case '/pollen':
    getMessage(message.text, (today, image, alt) => {
      var t = new Date().getTime();
      bot.replyPublic(message, '<@' + message.user + '> ' + '\n' + today + ' 東京都(千代田区)の花粉\n' + image+'?' + t + '\n' + '*' + alt + '*' );
    });
    break;
  }
});
