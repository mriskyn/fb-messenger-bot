const { User, Message } = require('../models');

async function getMessages(req, res) {
  try {
    const messages = await Message.findAll();

    res.send(messages);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function getMessage(req, res) {
  const { id } = req.params;

  try {
    const message = await Message.findOne({ where: { id } });

    res.send(message);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function summary(req, res) {
  try {
    let users = await User.findAll();
    let messages = await Message.findAll({attributes: ['id','chat','UserId']});

    const result = users.map(user => {
      return {
        user: user.id,
        name: user.name,
        messages: messages.filter(message => message.UserId == user.id)
      }
    })
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { getMessage, getMessages, summary };
