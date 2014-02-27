(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("config/app", function(exports, require, module) {
var env, options;

env = require('config/environment');

if (env.get('isDevelopment')) {
  options = {
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: false,
    LOG_STACKTRACE_ON_DEPRECATION: true,
    LOG_BINDINGS: true,
    LOG_VIEW_LOOKUPS: true,
    LOG_ACTIVE_GENERATION: true
  };
  Ember.RSVP.configure('onerror', function(error) {
    var message;
    if (Ember.typeOf(error) === 'object') {
      message = (error != null ? error.message : void 0) || 'No error message';
      Ember.Logger.error("RSVP Error: " + message);
      Ember.Logger.error(error != null ? error.stack : void 0);
      return Ember.Logger.error(error != null ? error.object : void 0);
    } else {
      return Ember.Logger.error('RSVP Error', error);
    }
  });
  Ember.STRUCTURED_PROFILE = true;
  Ember.Logger.debug("Running in the %c" + (env.get('name')) + "%c environment", 'color: red;', '');
} else {
  options = {};
}

module.exports = Ember.Application.create(options);
});

;require.register("config/environment", function(exports, require, module) {
var Environment;

window.require.list().filter(function(module) {
  if (new RegExp("^config/environments/").test(module)) {
    return require(module);
  }
});

Environment = Ember.Object.extend({
  isTest: Ember.computed.equal('name', 'test'),
  isDevelopment: Ember.computed.equal('name', 'development'),
  isProduction: Ember.computed.equal('name', 'production')
});

module.exports = Environment.create(window.TAPAS_ENV);
});

;require.register("config/router", function(exports, require, module) {
module.exports = App.Router.map(function() {
  this.resource("people", {
    path: '/'
  });
  this.resource("person", {
    path: '/person/:person_id'
  });
  return this.resource("currentGame", {
    path: '/game/current'
  });
});
});

;require.register("controllers/application_controller", function(exports, require, module) {
App.ApplicationController = Ember.Controller.extend({
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game'],
  authBinding: "controllers.auth",
  waitList: Ember.computed.alias('controllers.wait'),
  game: Ember.computed.alias('controllers.game'),
  waitingList: (function() {
    var _this = this;
    return this.get('waits').map(function(wait) {
      var auth_id, person;
      wait.set('updatetime', new Date());
      wait.get('person');
      person = wait.get('person');
      auth_id = _this.get('controllers.auth.person.id');
      if (auth_id) {
        if (auth_id === person.get('id')) {
          wait.set('isMe', true);
        }
      } else {
        wait.set('isMe', false);
      }
      return wait;
    });
  }).property('waits.content.@each', 'controllers.person.content', 'controllers.auth.person'),
  actions: {
    login: function() {
      return this.get('controllers.auth').login();
    },
    logout: function() {
      return this.get('controllers.auth').logout();
    },
    acceptGame: function(home, away) {
      this.get('game').addGame(home, away);
      this.get('waitList').removePerson(home);
      home.set('is_waiting', false);
      return home.save();
    },
    acceptChallenge: function(theChallenge) {
      var challenge;
      challenge = this.get('controllers.challenge');
      return challenge.acceptChallenge(theChallenge);
    },
    declineChallenge: function(theChallenge) {
      var challenge;
      challenge = this.get('controllers.challenge');
      return challenge.declineChallenge(theChallenge);
    },
    removeResponse: function(theChallenge) {
      var challenge;
      challenge = this.get('controllers.challenge');
      return challenge.removeResponse(theChallenge);
    }
  }
});
});

;require.register("controllers/auth_controller", function(exports, require, module) {
App.AuthController = Ember.Controller.extend({
  needs: ['people', 'person'],
  isAuthed: false,
  userId: 0,
  isAdmin: false,
  setupAuth: (function() {
    var slRef,
      _this = this;
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com');
    return this.authClient = new FirebaseSimpleLogin(slRef, function(err, user) {
      if (!err && user) {
        return _this.pickUser(user);
      }
    });
  }).on('init'),
  pickUser: function(user) {
    var _this = this;
    return this.get('store').fetch('person', user.id).then((function(person) {
      person.setProperties({
        name: user.name,
        twitter: user.username
      });
      person.save();
      _this.set('isAdmin', person.get('is_admin'));
      return _this.set('person', person);
    }), function(error) {
      var newPerson;
      newPerson = _this.get('store').createRecord("person", {
        id: user.id,
        name: user.name,
        twitter: user.username,
        email: '',
        is_waiting: false,
        is_admin: false,
        created_at: new Date()
      });
      return newPerson.save().then(function() {
        return _this.set('person', person);
      });
    });
  },
  login: function() {
    return this.authClient.login('twitter', {
      rememberMe: true
    });
  },
  logout: function() {
    this.authClient.logout();
    return this.set('person', void 0);
  }
});
});

;require.register("controllers/challenge_controller", function(exports, require, module) {
App.ChallengeController = Ember.ArrayController.extend({
  needs: ['person', 'game'],
  game: Ember.computed.alias('controllers.game'),
  declineChallenge: function(challenge) {
    var awayPerson, homePerson;
    awayPerson = challenge.get('away');
    awayPerson.get('challenges').removeObject(challenge);
    awayPerson.save();
    challenge.setProperties({
      declined: true
    });
    challenge.save();
    homePerson = challenge.get('home');
    homePerson.get('responses').addObject(challenge);
    return homePerson.save();
  },
  removeResponse: function(challenge) {
    var homePerson;
    homePerson = challenge.get('home');
    homePerson.get('responses').removeObject(challenge);
    homePerson.save();
    return challenge["delete"]();
  },
  createChallenge: function(homePerson, awayPerson) {
    var challenge,
      _this = this;
    challenge = this.get('store').createRecord('challenge', {
      home: homePerson,
      away: awayPerson,
      created_at: new Date()
    });
    return challenge.save().then(function(challenge) {
      awayPerson.get('challenges').addObject(challenge);
      return awayPerson.save();
    });
  },
  acceptChallenge: function(challenge) {
    var away, home;
    home = challenge.get('home');
    away = challenge.get('away');
    this.get('game').addGame(home, away);
    away.get('challenges').removeObject(challenge);
    away.save();
    return challenge["delete"]();
  }
});
});

;require.register("controllers/currentGame_controller", function(exports, require, module) {
App.CurrentGameController = Ember.ArrayController.extend({
  needs: ['person']
});
});

;require.register("controllers/game_controller", function(exports, require, module) {
App.GameController = Ember.ObjectController.extend({
  needs: ['person'],
  addGame: function(home, away) {
    var newGame, round;
    console.log("make me a game...");
    newGame = this.get('store').createRecord("pendingGame", {
      home: home,
      away: away,
      created_at: new Date()
    });
    console.log("savin");
    round = this.get('store').createRecord("round", {
      home_score: 0,
      away_score: 0
    });
    newGame.get('rounds').addObject(round);
    newGame.save();
    return this.newGame(newGame);
  },
  removeGame: function(game) {
    return game["delete"]();
  },
  newGame: function(game) {
    var _this = this;
    return this.get('store').fetch('currentGame').then((function(currentGame) {
      console.log("IS THERE A CURRENT GAME?");
      console.log(currentGame);
      if (currentGame.content.length < 1) {
        return _this.setCurrentGame(game);
      }
    }), function(error) {
      console.log(error);
      return console.log("mega fail");
    });
  },
  setCurrentGame: function(pendingGame) {
    var currentGame;
    currentGame = this.get('store').createRecord('currentGame', {
      home: pendingGame.get('home'),
      away: pendingGame.get('away'),
      created_at: pendingGame.get('created_at'),
      started_at: new Date()
    });
    currentGame.save();
    pendingGame["delete"]();
    return this.startGame(currentGame);
  },
  startGame: function(currentGame) {
    var away, home;
    home = currentGame.get('home');
    away = currentGame.get('away');
    console.log(home.get('name'));
    console.log("vs");
    console.log(away.get('name'));
    return console.log("has started");
  },
  gameOver: function(game) {}
});
});

;require.register("controllers/people_controller", function(exports, require, module) {
module.exports = App.PeopleController = Ember.ArrayController.extend({
  needs: ['auth', 'challenge'],
  person: Ember.computed.alias('controllers.auth.person'),
  errors: [],
  personName: null,
  personEmail: null,
  people: (function() {
    var currentPerson,
      _this = this;
    currentPerson = this.get('person');
    return this.get('content').map(function(person) {
      var isMe;
      isMe = person.get('id') === (currentPerson != null ? currentPerson.get('id') : void 0);
      person.set('isMe', isMe);
      return person;
    });
  }).property('content.@each', 'person'),
  isChallenged: function(person) {
    var challenges,
      _this = this;
    challenges = this.get('challenges_away');
    return challenges.map(function(challenge) {
      if (challenge.get('away.id') === person.get('id')) {
        person.set('challengedBy', challenge.get('home'));
        person.set('isChallenged', true);
        return _this.set('person', person);
      }
    });
  },
  actions: {
    addPerson: function() {
      var errors, person, personEmail, personName;
      personName = this.get('personName');
      personEmail = this.get('personEmail');
      errors = this.get('errors');
      errors = [];
      if (personName === void 0 || personName === "" || personName === null) {
        errors.push("Person name empty.");
      }
      if (personEmail === void 0 || personEmail === "" || personEmail === null) {
        errors.push("Person email empty.");
      }
      if (errors.length < 1) {
        person = this.store.createRecord("person", {
          name: personName,
          email: personEmail
        });
        person.save();
        this.set('isAdding', false);
        this.set('personName', null);
        return this.set('personEmail', null);
      } else {
        return this.set('errors', errors);
      }
    },
    showAddPerson: function() {
      return this.set('isAdding', true);
    },
    cancelAddPerson: function() {
      this.set('isAdding', false);
      this.set('errors', []);
      this.set('personName', null);
      return this.set('personEmail', null);
    }
  },
  isAdding: false
});
});

;require.register("controllers/person_controller", function(exports, require, module) {
App.PersonController = Ember.ObjectController.extend({
  wins: (function() {
    return 1;
  }).property('games'),
  needs: ['auth', 'challenge', 'wait'],
  challenge: Ember.computed.alias('controllers.challenge'),
  authedPerson: Ember.computed.alias('controllers.auth.person'),
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin'),
  wait: Ember.computed.alias('controllers.wait'),
  iAmSure: false,
  isEditing: false,
  isChallenged: (function() {
    var away_id, challenge, challenges, person, person_id, request, _i, _len, _ref;
    person = this.get('model');
    challenges = person.get('challenges');
    _ref = challenges.toArray();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      challenge = _ref[_i];
      request = challenge.content;
      if (request === void 0) {
        request = challenge;
      }
      if (request === void 0) {
        return;
      }
      away_id = request.get('away.id');
      person_id = person.get('id');
      if (person_id === away_id) {
        return true;
      }
    }
    return false;
  }).property('content', 'authedPerson.content.challenges.@each', 'challenges.content.@each'),
  challengeDeclined: (function() {
    var challenge, changed, _i, _len, _ref;
    changed = false;
    _ref = this.get('responses');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      challenge = _ref[_i];
      if (challenge.get('declined')) {
        this.get('challenges').removeObject(challenge);
        changed = true;
      }
    }
    if (changed) {
      return this.save();
    }
  }).property('content'),
  isMe: (function() {
    return this.get('id') === this.get('authedPerson.id');
  }).property('content', 'authedPerson'),
  actions: {
    deleteMe: function() {
      var person, yousure;
      yousure = this.get('iAmSure');
      if (!yousure) {
        return alert("Are you sure?");
      } else {
        person = this.get('model');
        person["delete"]();
        this.set('iAmSure', false);
        return this.transitionTo('/');
      }
    },
    editPerson: function() {
      return this.set('isEditing', true);
    },
    doEditPerson: function() {
      return console.log("savin");
    },
    cancelEditPerson: function() {
      return this.set('isEditing', false);
    },
    joinWaitingList: function() {
      var person;
      person = this.get('model');
      if (person.get('is_waiting')) {
        return;
      }
      person.setProperties({
        is_waiting: true,
        waiting_time: new Date()
      });
      person.save();
      return this.get('wait').addPerson(person);
    },
    leaveWaitingList: function() {
      var person;
      person = this.get('model');
      person.setProperties({
        is_waiting: false,
        waiting_time: null
      });
      person.save();
      return this.get('wait').removePerson(person);
    },
    challengeRequest: function() {
      return this.get('controllers.challenge').createChallenge(this.get('authedPerson'), this.get('model'));
    }
  }
});
});

;require.register("controllers/wait_controller", function(exports, require, module) {
App.WaitController = Ember.ArrayController.extend({
  needs: ['person', 'auth'],
  addPerson: function(appendPerson) {
    var newWait;
    newWait = this.get('store').createRecord("wait", {
      person: appendPerson,
      created_at: new Date()
    });
    return newWait.save();
  },
  removePerson: function(person) {
    var _this = this;
    return this.get('store').fetch('wait').then((function(wait) {
      var n, _i, _len, _ref;
      _ref = wait.content;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        if (n.get('person').get('id') === person.get('id')) {
          n["delete"]();
          return true;
        }
      }
      return false;
    }));
  }
});
});

;require.register("initialize", function(exports, require, module) {
var folderOrder;

window.App = require('config/app');

require('config/router');

App.Store = FP.Store.extend({
  firebaseRoot: "https://glaring-fire-8110.firebaseio.com"
});

folderOrder = ['initializers', 'utils', 'mixins', 'adapters', 'serializers', 'routes', 'models', 'views', 'controllers', 'helpers', 'templates', 'components'];

folderOrder.forEach(function(folder) {
  return window.require.list().filter(function(module) {
    return new RegExp("^" + folder + "/").test(module);
  }).forEach(function(module) {
    return require(module);
  });
});
});

;require.register("initializers/environment", function(exports, require, module) {
var env;

env = require('config/environment');

module.exports = Ember.Application.initializer({
  name: 'environment',
  initialize: function(container, application) {
    application.register('environment:main', env, {
      instantiate: false,
      singleton: true
    });
    return application.inject('controller', 'env', 'environment:main');
  }
});
});

;require.register("models/challenge", function(exports, require, module) {
App.Challenge = FP.Model.extend({
  home: FP.hasOne("person", {
    embedded: false
  }),
  away: FP.hasOne("person", {
    embedded: false
  }),
  created_at: FP.attr('date'),
  message: FP.attr('string'),
  declined: FP.attr('boolean')
});
});

;require.register("models/challengeRequest", function(exports, require, module) {
App.ChallengeRequest = FP.Model.extend({
  home: FP.attr('string'),
  away: FP.attr('string')
});
});

;require.register("models/completedGame", function(exports, require, module) {
require('models/game');

App.CompletedGame = App.Game.extend();
});

;require.register("models/currentGame", function(exports, require, module) {
require('models/game');

App.CurrentGame = App.Game.extend();
});

;require.register("models/game", function(exports, require, module) {
App.Game = FP.Model.extend({
  home: FP.hasOne("person", {
    embedded: false
  }),
  away: FP.hasOne("person", {
    embedded: false
  }),
  created_at: FP.attr('date'),
  completed_at: FP.attr('date'),
  started_at: FP.attr('date'),
  rounds: FP.hasMany("rounds")
});
});

;require.register("models/pendingGame", function(exports, require, module) {
require('models/game');

App.PendingGame = App.Game.extend();
});

;require.register("models/person", function(exports, require, module) {
App.Person = FP.Model.extend({
  name: FP.attr('string'),
  twitter: FP.attr('string'),
  email: FP.attr('string'),
  created_at: FP.attr('date'),
  is_admin: FP.attr('boolean'),
  is_waiting: FP.attr('boolean'),
  waiting_time: FP.attr('date'),
  wins: FP.attr('number'),
  losses: FP.attr('number'),
  challenges: FP.hasMany('challenge', {
    embedded: false
  }),
  responses: FP.hasMany('challenge', {
    embedded: false
  })
});
});

;require.register("models/round", function(exports, require, module) {
App.Round = FP.Model.extend({
  home_score: FP.attr('number'),
  away_score: FP.attr('number')
});
});

;require.register("models/wait", function(exports, require, module) {
App.Wait = FP.Model.extend({
  person: FP.hasOne("person", {
    embedded: false
  }),
  created_at: FP.attr('date')
});
});

;require.register("routes/application", function(exports, require, module) {
module.exports = App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('people', this.get('store').findAll('person'));
    controller.set('waits', this.get('store').findAll('wait'));
    controller.set('currentGame', this.get('store').findAll('currentGame'));
    return controller.set('pendingGames', this.get('store').findAll('pendingGame'));
  }
});
});

;require.register("routes/challenge", function(exports, require, module) {
module.exports = App.ChallengeRoute = Ember.Route.extend({
  model: function() {
    return this.store.fetch('challenge');
  }
});
});

;require.register("routes/currentGame", function(exports, require, module) {
module.exports = App.CurrentGameRoute = Ember.Route.extend({
  model: function() {
    return this.store.fetch('currentGame');
  }
});
});

;require.register("routes/game", function(exports, require, module) {
module.exports = App.GameRoute = Ember.Route.extend;
});

;require.register("routes/index", function(exports, require, module) {

});

;require.register("routes/people", function(exports, require, module) {
module.exports = App.PeopleRoute = Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('person');
  }
});
});

;require.register("routes/person", function(exports, require, module) {
module.exports = App.PersonRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.fetch('person', params.person_id);
  }
});
});

;require.register("routes/wait", function(exports, require, module) {
module.exports = App.WaitRoute = Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('wait');
  }
});
});

;require.register("templates/application", function(exports, require, module) {
module.exports = Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            Logged in as ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "auth.person.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Logout</button>\n          ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "login", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Login or Signup</button>\n          ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"game\">\n        <span class=\"player home\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        <span class=\"vs\">vs</span>\n        <span class=\"player away\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "game", options) : helperMissing.call(depth0, "link-to", "game", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program6(depth0,data) {
  
  
  data.buffer.push("View game");
  }

function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <div class=\"game\">\n        <span class=\"player home\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        <span class=\"vs\">vs</span>\n        <span class=\"player away\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n   <li> \n    You're challenged by ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "acceptChallenge", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Accept</button>\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "declineChallenge", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Decline</button>\n    </li>\n  ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n   <li> \n    Challenge declined by ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeResponse", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Ok</button>\n    </li>\n  ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "wait.person.is_waiting", {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program15(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      <p>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "wait.isMe", {hash:{},inverse:self.program(19, program19, data),fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </p>\n    ");
  return buffer;
  }
function program16(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "wait.person.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" is looking to play. \n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.person.name", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push(" \n          <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "acceptGame", "wait.person", "auth.person", {hash:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button green\">Join</button>\n        ");
  return buffer;
  }

function program19(depth0,data) {
  
  
  data.buffer.push("\n        Waiting for challenges...\n      ");
  }

  data.buffer.push("<header class=\"hero\">\n  <h1 class=\"hero--text\">Table</h1>\n</header>\n<div class=\"main\">\n  <header class=\"banner\">\n    <nav>\n      <ul class=\"banner--navigation\">\n        <li class=\"banner--navigation--item\"><a href=\"#/\">Table Listing</a></li>\n        <li class=\"banner--navigation--item\"><a href=\"#/games\">Game History</a></li>\n        <li class=\"banner--navigation--item banner--navigation--login\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.person", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </li>\n      </ul>\n    </nav>\n  </header>\n  <h2>SparkTable (");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "people.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")</h2>\n  <div class=\"currentGame\">\n    <h3>Current Game</h3>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "game", "in", "currentGame", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n  <div class=\"pendingGames\">\n    <h3>Pending Games</h3>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "game", "in", "pendingGames", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <h3>Challenges</h3>\n  <ul>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "auth.person.challenges", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "auth.person.responses", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </ul>\n  <h3>Waiting for players (ping?)</h3>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "wait", "in", "waitingList", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <div class=\"content\">\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n</div>\n<footer class=\"footer\">\nTable - 2014 - by Patrick Simpson \n</footer>\n");
  return buffer;
  
});
});

;require.register("templates/components/people-list", function(exports, require, module) {
module.exports = Ember.TEMPLATES['components/people-list'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n  <li>\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "person", "", options) : helperMissing.call(depth0, "link-to", "person", "", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isMe", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </li>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n      (you)\n    ");
  }

function program6(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <!--<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "challenge", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Challenge</button>-->\n    ");
  return buffer;
  }

  data.buffer.push("<ul>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "people", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
});
});

;require.register("templates/currentGame", function(exports, require, module) {
module.exports = Ember.TEMPLATES['currentGame'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<h2>CURRENT GAME!</h2>\n\nSCORE\n");
  
});
});

;require.register("templates/index", function(exports, require, module) {
module.exports = Ember.TEMPLATES['index'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  return buffer;
  
});
});

;require.register("templates/people", function(exports, require, module) {
module.exports = Ember.TEMPLATES['people'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n  <p>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" has challenged ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" \n  </p>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n<h2>Add Person</h2>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "errors", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <form ");
  hashContexts = {'on': depth0};
  hashTypes = {'on': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addPerson", {hash:{
    'on': ("submit")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  <label for=\"personName\">Name</label>\n  ");
  hashContexts = {'type': depth0,'valueBinding': depth0,'placeholder': depth0,'required': depth0};
  hashTypes = {'type': "STRING",'valueBinding': "STRING",'placeholder': "STRING",'required': "STRING"};
  options = {hash:{
    'type': ("text"),
    'valueBinding': ("personName"),
    'placeholder': ("Happy Panda"),
    'required': ("true")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <label for=\"personEmail\">Email</label>\n  ");
  hashContexts = {'type': depth0,'valueBinding': depth0,'placeholder': depth0,'required': depth0};
  hashTypes = {'type': "STRING",'valueBinding': "STRING",'placeholder': "STRING",'required': "STRING"};
  options = {hash:{
    'type': ("email"),
    'valueBinding': ("personEmail"),
    'placeholder': ("your@email.com"),
    'required': ("true")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <div class=\"button--container\">\n    <button class=\"button blue\">Add</button>\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelAddPerson", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Nevermind</button>\n  </div>\n  </form>\n  \n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<p class=\"error\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <h2>Leaderboard</h2>\n  ");
  hashContexts = {'people': depth0};
  hashTypes = {'people': "ID"};
  options = {hash:{
    'people': ("people")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['people-list'] || (depth0 && depth0['people-list'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "people-list", options))));
  data.buffer.push("\n");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "challenges", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isAdding", {hash:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
});

;require.register("templates/person", function(exports, require, module) {
module.exports = Ember.TEMPLATES['person'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editPerson", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Edit</button>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isChallenged", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      You challenged ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "authedPerson", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "challengeRequest", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Challenge!</button>\n      ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "authedPerson", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "is_waiting", {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "joinWaitingList", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button green\">Join Queue</button>\n      ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "leaveWaitingList", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button red\">Leave Queue</button>\n      ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.score", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n  ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <h3>Edit User</h3>\n  ");
  hashContexts = {'type': depth0,'value': depth0};
  hashTypes = {'type': "STRING",'value': "ID"};
  options = {hash:{
    'type': ("text"),
    'value': ("name")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <label for=\"email\">Email:</label>\n  ");
  hashContexts = {'type': depth0,'value': depth0};
  hashTypes = {'type': "STRING",'value': "ID"};
  options = {hash:{
    'type': ("email"),
    'value': ("email")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <p>\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "doEditPerson", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Save</button>\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelEditPerson", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Nevermind</button>\n  </p>\n");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <h3>Administrator Options</h3>\n  <div class=\"adminarea deleteme\">\n    ");
  hashContexts = {'type': depth0,'checked': depth0,'id': depth0};
  hashTypes = {'type': "STRING",'checked': "ID",'id': "STRING"};
  options = {hash:{
    'type': ("checkbox"),
    'checked': ("iAmSure"),
    'id': ("iamsure")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n    <label for=\"iamsure\">Delete this user?</label>\n    <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteMe", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Delete</button>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("<div class=\"profile\">\n  <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isMe", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isMe", {hash:{},inverse:self.program(9, program9, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  <div class=\"stats\">\n    Wins: <span class=\"wins\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "wins", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    Losses: <span class=\"losses\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "losses", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n  </div>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "games", {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isEditing", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isAuthAdmin", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
});

;require.register("views/add_person_view", function(exports, require, module) {

});

;require.register("config/environments/development", function(exports, require, module) {
window.TAPAS_ENV = {
  name: 'development'
};
});

;
//# sourceMappingURL=app.js.map