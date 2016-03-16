var cheerio = require('cheerio');
var request = require('request');

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

getMessage("", function(image, message){
  console.log(message, image);
});
