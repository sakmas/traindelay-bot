'use strict'

const client = require('cheerio-httpcli');
const Slack = require('slack-node');
const settings = require('./settings.json');

const slack = new Slack(settings.slack.token);

const sendMessage = message => {
  slack.api('chat.postMessage', {
    channel: settings.slack.channel,
    text: message,
    username: settings.slack.username,
    icon_emoji: settings.slack.icon_emoji
  }, (err, res) => {
    if (err) { console.log('Error:', err); }
  });
}

const buildMessage = params => {
  var status = params.status.replace('[!]', '');
  return `*${params.name} :warning: ${status}* \n>>>${params.info} \n <${params.url}|${params.name}の運行情報 - Yahoo!路線情報>`;

}

settings.trains.forEach(url => {
  client.fetch(url, (err, $, res, body) => {
    const $status = $('#mdServiceStatus');
    const $message = $status.find('dd');
    if ($message.hasClass('trouble')) {
      sendMessage(buildMessage({
        name: $('h1.title').text().trim(),
        status: $status.find('dt').text().trim(),
        info: $message.text().trim(),
        url: url
      }));
    }
  });
});
