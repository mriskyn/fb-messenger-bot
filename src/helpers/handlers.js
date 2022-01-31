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

  Input.find().sort({date: 'desc'}).then(res => {
    console.log(res)
    if (entityChosen === 'wit$greetings') {
      callSendAPI(
        sender_psid,
        'Hi there! I am Ryz Chat Bot, a message app that can reply automatically'
      );
      callSendAPI(sender_psid, 'Please insert your name');
      inputUser(sender_psid, null);z
    } else {
  
    }
  })

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

const inputUser = async (sender_psid, text, flow) => {
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
          await Input.create();
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
