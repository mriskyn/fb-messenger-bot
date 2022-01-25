# Ryz Chat Bot

- A simple Facebook Messenger Chatbot using Mesenger Platform (Node.js)
- Test this bot (this project) now : https://ryz-fb-messenger-bot.herokuapp.com/
- Make sure you'are using your facebook account to test the bot

## How to run this project ?

You can set up this project by following these steps below or an easier way.

### 1. Clone this project

- Copy file .env.example -> create a .env file at the root folder -> fill all app variables in the .env file
- Run the "npm install" to test project at the localhost

### 2. Create a Heroku app, a Facebook Page, a Facebook App.

#### 2.1 Create a Heroku app

- Download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line)
- If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.

```bash
$ heroku login
```
- Create / Generate your app
```bash
$ heroku create your-app-name

# Creating ⬢ your-app-name... done
# https://your-app-name.herokuapp.com/ | https://git.heroku.com/your-app-name.git
```
- Remote source code to Heroku

```bash
$ heroku git:remote -a <YOUR_HEROKU_APP_NAME>
```

- Deploy app to Heroku
  - need to setup dev dependencies:

  ```bash
  $ heroku config:set NPM_CONFIG_PRODUCTION=false
  ```
  - push app to heroku
  ```bash
  $ git push origin heroku
  ```

- Config env variables (setup dev dependencies)
- You can set Environment variable in Heroku via Dashboard or Heroku CLI

```bash
$ heroku config:set MY_VERIFY_FB_TOKEN=<YOUR_VERUFY_TOKEN>
$ heroku config:set FB_PAGE_TOKEN=<YOUR_FB_PAGE_TOKEN>
# etc
```

#### 2.2 Facebook Page

- Create a [Facebook Page](https://www.facebook.com/pages/creation/)
- Config Whitelisted Domains (add the Heroku app domain)

#### 2.3 Facebook App

- Create a Facebook App
- Config [webhook](https://developers.facebook.com/docs/messenger-platform)

## API Documentation

To Access the documentation => `localhost:8888/api-docs`