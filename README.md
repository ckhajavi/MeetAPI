# API server

The Meet backend API using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) ,[MongoDB](https://www.mongodb.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed. 

```sh
$ git clone https://github.com/joelbandi/MeetAPI.git # or clone your own fork
$ cd MeetAPI
$ npm install
$ heroku local
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

Visit [Routes section](http://localhost:5000/api/routes) for more info on the routes available to you.

## Deploying to Heroku


```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
