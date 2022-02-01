const request = require('request');
const moment = require('moment');
const { LocalStorage } = require('node-localstorage');

const localStorage = new LocalStorage('./scratch');

const { User, Message } = require('../models');
const Input = require('../mongoDB/input');
const { firstTrait, isValidDate } = require('./validate');

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

const handleMessage = (sender_psid, message) => {
  let entitiesArr = ['wit$greetings', 'wit$thanks', 'wit$bye'];
  let entityChosen = '';
  entitiesArr.forEach((name) => {
    let entity = firstTrait(message.nlp, name);
    if (entity && entity.confidence > 0.8) {
      entityChosen = name;
    }
  });

  const yesAnswer = ['yes', 'yup', 'yeah', 'ya'];
  const noAnswer = ['no', 'nope', 'nah'];

  inputUser(sender_psid, message);

  // Input.find().sort({date: 'desc'}).then(res => {
  //   console.log(res)
  //   if (entityChosen === 'wit$greetings') {
  //     callSendAPI(
  //       sender_psid,
  //       'Hi there! I am Ryz Chat Bot, a message app that can reply automatically'
  //     );
  //     callSendAPI(sender_psid, 'Please insert your name');
  //     inputUser(sender_psid, null);
  //   } else {

  //   }
  // })

  // if (entityChosen === 'wit$greetings') {
  //   //send greetings message
  //   callSendAPI(
  //     sender_psid,
  //     'Hi there! I am Ryz Chat Bot, a message app that can reply automatically'
  //   );
  //   callSendAPI(sender_psid, 'Please insert your name');
  //   // inputUser(null, 'intro')
  // } else if (isValidDate(message.text)) {
  //   localStorage.setItem('birthdate', message.text);
  //   inputUser(message.text, 'birthdate');
  //   callSendAPI(
  //     sender_psid,
  //     'Do you want to know how many days till his next birthday?'
  //   );
  // } else if (yesAnswer.includes(message.text.toLowerCase())) {
  //   const birthdate = localStorage.getItem('birthdate');

  //   let [year, month, date] = birthdate.split('-');
  //   year = moment().get('year').toString();

  //   const fullDate = `${year}-${month}-${date}`,
  //     currDate = moment(new Date()).format('YYYY-MM-DD'),
  //     countdown = moment(fullDate).diff(moment(currDate), 'day');

  //   callSendAPI(
  //     sender_psid,
  //     `There are ${countdown} days left until your next birthday`
  //   );
  // } else if (noAnswer.includes(message.text.toLowerCase())) {
  //   callSendAPI(sender_psid, 'Goodbye 👋');
  // } else {
  //   localStorage.setItem('name', message.text);
  //   inputUser(message.text, 'name');
  //   callSendAPI(sender_psid, 'Please insert your birth date. (YYYY-MM-DD)');
  // }

  // inputUser()

  createMessenger(sender_psid, message.text);
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

const createMessenger = (sender_psid, text) => {
  request(
    `https://graph.facebook.com/${sender_psid}`,
    {
      qs: {
        fields: 'first_name,last_name',
        access_token: process.env.FB_PAGE_TOKEN,
      },
      method: 'GET',
    },
    async (err, res, body) => {
      if (!err) {
        const data = JSON.parse(res.body);
        if (!data?.id) {
          throw new Error('Wrong PSID');
        }

        try {
          // Check (Create if not exist) / Get User from Database
          // console.log('fb id', data.id);
          let user = await User.findOne({ where: { fbId: data.id } });

          if (!user) {
            user = await User.create({
              name: `${data.first_name} ${data.last_name}`,
              fbId: data.id,
            });
          }

          await Message.create({ UserId: user.id, chat: text });
        } catch (err) {
          console.log('err:', err);
        }
      } else {
        console.error('Error get user:' + err);
      }
    }
  );
};

const inputUser = async (sender_psid, message) => {
  request(
    `https://graph.facebook.com/${sender_psid}`,
    {
      qs: {
        fields: 'first_name,last_name',
        access_token: process.env.FB_PAGE_TOKEN,
      },
      method: 'GET',
    },
    async (err, res, body) => {
      if (!err) {
        const data = JSON.parse(res.body);
        if (!data?.id) {
          throw new Error('Wrong PSID');
        }

        try {
          let text = message.text;
          let input = await Input.findOne({
            facebook_id: sender_psid,
            isActivate: true,
          });

          let entitiesArr = [
            'wit$greetings',
            'wit$thanks',
            'wit$bye',
            'wit$datetime:$datetime',
          ];
          let entityChosen = '';
          entitiesArr.forEach((name) => {
            let entity = firstTrait(message.nlp, name);
            if (entity && entity.confidence > 0.8) {
              entityChosen = name;
            }
          });

          console.log('entity choosen', entityChosen);
          console.log('text:', text);

          if (!input) {
            if (
              entityChosen === 'wit$greetings' ||
              text.toLowerCase() === 'hi'
            ) {
              callSendAPI(
                sender_psid,
                'Hi there! I am Ryz Chat Bot, a message app that can reply automatically'
              );
              callSendAPI(sender_psid, 'Please insert your name');
              input = await Input.create({ facebook_id: sender_psid });
              return;
            } else {
              callSendAPI(sender_psid, 'Say "Hi" to start the conversation');
              return;
            }
          } else {
            if (input.flow === 'name') {
              if (
                entityChosen === 'wit$greetings' ||
                entityChosen === 'wit$bye' ||
                entityChosen === 'wit$thanks'
              ) {
                callSendAPI(sender_psid, 'Please input valid name');
                return;
              } else {
                callSendAPI(
                  sender_psid,
                  'Please insert your birth date. (YYYY-MM-DD)'
                );
                input.name = text;
                input.flow = 'birthdate';
                await input.save();
                return;
              }
            } else if (input.flow === 'birthdate') {
              if (isValidDate(text)) {
                callSendAPI(
                  sender_psid,
                  'Do you want to know how many days till his next birthday?'
                );
                input.birthdate = text;
                input.flow = 'done';
                await input.save();
                return;
              } else {
                callSendAPI('Please input valid date');
                return;
              }
            } else {
              if (input.flow === 'done' && text === 'no') {
                callSendAPI(sender_psid, 'Goodbye 👋');
                input.isActivate = false;
                await input.save();
                return;
              }

              if (input.flow === 'done' && text === 'yes') {
                let birthdate = input.birthdate;
                let [year, month, date] = birthdate.split('-');
                year = moment().get('year').toString();

                const fullDate = `${year}-${month}-${date}`,
                  currDate = moment(new Date()).format('YYYY-MM-DD');

                let countdown = moment(fullDate).diff(moment(currDate), 'day');

                if (countdown < 0) {
                  countdown = countdown + 365;
                }

                if (countdown === 0) {
                  callSendAPI(sender_psid, 'Happy Birthday!!!');
                } else {
                  callSendAPI(
                    sender_psid,
                    `There are ${
                      countdown ? countdown : 'n'
                    } days left until your next birthday`
                  );
                }

                input.isActivate = false;
                await input.save();
                return;
              }
            }
          }
        } catch (err) {
          console.log('err:', err);
        }
      } else {
        console.error('Error get user:' + err);
      }
    }
  );
};

module.exports = { handleMessage, handlePostback };
