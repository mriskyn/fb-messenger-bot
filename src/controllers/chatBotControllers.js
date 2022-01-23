require('dotenv').config();
const request = require('request');

const { User } = require('../models');

const postWebHook = (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log('webhook_event:', webhook_event.message);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

const getWebHook = (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

const handlePostback = (sender_psid, received_postback) => {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { text: 'Thanks!' };
  } else if (payload === 'no') {
    response = { text: 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: { text: response },
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v7.0/me/messages',
      qs: { access_token: process.env.FB_PAGE_TOKEN },
      method: 'POST',
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error('Unable to send message:' + err);
      }
    }
  );
};

const handleMessage = (sender_psid, message) => {
  //handle message for react, like press like button
  // id like button: sticker_id 369239263222822

  if (message && message.attachments && message.attachments[0].payload) {
    callSendAPI(sender_psid, 'Thank you for watching my video !!!');
    callSendAPIWithTemplate(sender_psid);
    return;
  }

  let entitiesArr = ['wit$greetings', 'wit$thanks', 'wit$bye'];
  let entityChosen = '';
  entitiesArr.forEach((name) => {
    let entity = firstTrait(message.nlp, name);
    if (entity && entity.confidence > 0.8) {
      entityChosen = name;
    }
  });

  if (entityChosen === '') {
    //default
    callSendAPI(
      sender_psid,
      `The bot is needed more training, try to say "thanks a lot" or "hi" to the bot`
    );
  } else {
    if (entityChosen === 'wit$greetings') {
      //send greetings message
      callSendAPI(
        sender_psid,
        'Hi there! This bot is created by Risky Nugraha'
      );
      getProfileUser(sender_psid);
    }
    if (entityChosen === 'wit$thanks') {
      //send thanks message
      callSendAPI(sender_psid, `You're welcome!`);
    }
    if (entityChosen === 'wit$bye') {
      //send bye message
      callSendAPI(sender_psid, 'bye-bye!');
    }
  }
};

const firstTrait = (nlp, name) => {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
};

const callSendAPIWithTemplate = (sender_psid) => {
  // document fb message template
  // https://developers.facebook.com/docs/messenger-platform/send-messages/templates
  let body = {
    recipient: {
      id: sender_psid,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Want to build sth awesome?',
              image_url:
                'https://www.nexmo.com/wp-content/uploads/2018/10/build-bot-messages-api-768x384.png',
              subtitle: 'Watch more videos on my youtube channel ^^',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://bit.ly/subscribe-haryphamdev',
                  title: 'Watch now',
                },
              ],
            },
          ],
        },
      },
    },
  };

  request(
    {
      uri: 'https://graph.facebook.com/v6.0/me/messages',
      qs: { access_token: process.env.FB_PAGE_TOKEN },
      method: 'POST',
      json: body,
    },
    (err, res, body) => {
      if (!err) {
        // console.log('message sent!')
      } else {
        console.error('Unable to send message:' + err);
      }
    }
  );
};

const getProfileUser = (sender_psid) => {
  request(
    `https://graph.facebook.com/4976999425685983`,
    {
      qs: {
        fields: 'first_name,last_name',
        access_token: process.env.FB_PAGE_TOKEN,
      },
      method: 'GET',
    },
    async (err, res, body) => {
      if (!err) {
        console.log('res.body:', res.body);
        // res.on('data', function(data) {
        //   // compressed data as it is received
        //   console.log('received ' + data.length + ' bytes of compressed data')
        // })
        const data = res.body;
        User.findOne({ where: { fbId: data.id } })
          .then((user) => {
            if (!user) {
              return User.create({
                name: `${data.first_name} ${data.last_name}`,
                fbId: data.id,
              });
            }
          })
          .then(() => {
            console.log('user:', user);
          })
          .catch((err) => {
            console.log('err:', err);
          });
        // try {
        //   const user = await User.findOne({ where: { fbId: data.id } });

        //   if(!user){
        //     await User.create({
        //       name: `${data.first_name} ${data.last_name}`,
        //       fbId: data.id
        //     })
        //   }
        //   console.log('user:', user)
        // } catch (err) {
        //   console.log('err:', err);
        // }
      } else {
        console.error('Error get user:' + err);
      }
    }
  );
};

module.exports = { postWebHook, getWebHook };
