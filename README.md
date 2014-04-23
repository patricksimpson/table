# The Table

A Ping pong tracking application. 

## Features:
  * Office Rankings
  * Challenge others
  * Keep score
  * View match
  * Record matches
  * Schedule matches
  * API
  
## Dependacies

The table is written on Ember and makes use of Tapas With Ember.

The Table also uses the following libraries:
  * moment.js
  * firebase
  * fireplace (for firebase)
  * Sass/Scss
  * Compass

## Setup

This applicaton requires and depends on firebase. You must go to firebase.com and setup an acount to obtain your firebase base URL.

      bundle install

next, you will need to install the node dependancies:

      npm install

Update your configuration files. (firebase base URL).

In app/config/enviornments

      window.TAPAS_ENV =
        name: 'development'
          db: 'https://<YOURFIREBASE>.firebaseio.com'

You will want a a development, test, and production version. Replace <YOURFIREBASE> with your firebase instance. 

## Running the app

After you updated your firebase base URL, you can run the application.

      cake server

This will compile the server files, and host the site locally at http://localhost:3333



