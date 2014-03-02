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
require.register("components/clock", function(exports, require, module) {
var ONE_SECOND;

ONE_SECOND = 1000;

module.exports = App.Clock = Ember.Object.extend({
  second: null,
  minute: null,
  hour: null,
  init: function() {
    this.tick();
  },
  tick: function() {
    var now, self;
    now = new Date();
    this.setProperties({
      second: now.getSeconds(),
      minute: now.getMinutes(),
      hour: now.getHours()
    });
    self = this;
    setTimeout((function() {
      self.tick();
    }), ONE_SECOND);
  }
});
});

;require.register("config/app", function(exports, require, module) {
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
  this.resource("currentGame", {
    path: '/current'
  });
  return this.resource("completedGames", {
    path: '/games'
  });
});
});

;require.register("controllers/application_controller", function(exports, require, module) {
App.ApplicationController = Ember.Controller.extend({
  clock: 'components/clock',
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game'],
  authBinding: "controllers.auth",
  waitList: Ember.computed.alias('controllers.wait'),
  game: Ember.computed.alias('controllers.game'),
  currentGames: (function() {
    var _this = this;
    return this.get('currentGame').map(function(game) {
      var startedAt;
      startedAt = game.get('startedAt');
      game.set('time', moment(startedAt).fromNow());
      return game;
    });
  }).property('currentGame.content.@each', 'clock.minute'),
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
      home.set('isWaiting', false);
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
    console.log(user);
    console.log(user.photos[0]);
    console.log(user.photos[0].value);
    return this.get('store').fetch('person', user.id).then((function(person) {
      person.setProperties({
        name: user.name,
        twitter: user.username,
        avatar: user.photos[0].value.replace("_normal", "")
      });
      person.save();
      _this.set('isAdmin', person.get('isAdmin'));
      return _this.set('person', person);
    }), function(error) {
      var newPerson;
      newPerson = _this.get('store').createRecord("person", {
        id: user.id,
        name: user.name,
        twitter: user.username,
        email: '',
        isWaiting: false,
        isAdmin: false,
        createdAt: new Date(),
        wins: 0,
        losses: 0,
        avatar: user.photos[0].value
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
      createdAt: new Date()
    });
    return challenge.save().then(function(challenge) {
      awayPerson.get('challenges').addObject(challenge);
      return awayPerson.save();
    });
  },
  acceptChallenge: function(challenge) {
    var away, game, home;
    home = challenge.get('home');
    away = challenge.get('away');
    game = this.get('game');
    game.addGame(home, away);
    away.get('challenges').removeObject(challenge);
    away.save();
    return challenge["delete"]();
  }
});
});

;require.register("controllers/completedGames_controller", function(exports, require, module) {
module.exports = App.CompletedGamesController = Ember.ArrayController.extend({
  needs: ['game'],
  games: (function() {
    return this.get('content').map(function(game) {
      var as, completed, hs;
      hs = game.get('homeScore');
      as = game.get('awayScore');
      game.set('homeWinner', hs > as);
      game.set('awayWinner', as > hs);
      completed = game.get('completedAt');
      console.log(moment(completed).fromNow());
      game.set('date', moment(completed).fromNow());
      return game;
    }).reverse();
  }).property('content.@each')
});
});

;require.register("controllers/currentGame_controller", function(exports, require, module) {
App.CurrentGameController = Ember.ObjectController.extend({
  needs: ['person', 'people'],
  currentRound: 1,
  confirmEndMatch: false,
  roundsWithIndex: (function() {
    var currentRound, rounds,
      _this = this;
    rounds = this.get('rounds');
    currentRound = this.get('currentRound');
    this.set('currentRound', rounds.length);
    return this.get('rounds').map(function(round, index) {
      return {
        round: {
          homeWon: round.homeScore > round.awayScore,
          awayWon: round.homeScore < round.awayScore,
          homeScore: round.homeScore,
          awayScore: round.awayScore,
          isComplete: round.isComplete,
          isCurrent: (index + 1) === currentRound
        },
        index: index + 1
      };
    }).reverse();
  }).property('rounds'),
  gameOver: function() {
    var completedGame, game;
    game = this.get('model');
    completedGame = this.get('store').createRecord("completedGame", {
      home: game.get('home'),
      away: game.get('away'),
      createdAt: game.get('createdAt'),
      startedAt: game.get('startedAt'),
      homeScore: game.get('homeScore'),
      awayScore: game.get('awayScore'),
      rounds: game.get('rounds'),
      completedAt: new Date()
    });
    completedGame.save();
    game["delete"]();
    return this.transitionTo('/');
  },
  actions: {
    addPointHome: function() {
      var currentRound, currentRoundIndex, game, round, rounds, score, updatedRounds;
      game = this.get('model');
      currentRound = this.get('currentRound');
      currentRoundIndex = currentRound - 1;
      rounds = game.get('rounds');
      this.set('currentRound', rounds.length);
      round = rounds[currentRoundIndex];
      score = round.homeScore;
      score = score + 1;
      updatedRounds = {
        homeScore: score,
        awayScore: round.awayScore,
        isComplete: false,
        isCurrent: true
      };
      rounds[currentRoundIndex] = updatedRounds;
      game.set('rounds', rounds.toArray());
      return game.save();
    },
    subtractPointHome: function() {
      var currentRound, currentRoundIndex, game, round, rounds, score, updatedRounds;
      game = this.get('model');
      currentRound = this.get('currentRound');
      currentRoundIndex = currentRound - 1;
      rounds = game.get('rounds');
      this.set('currentRound', rounds.length);
      round = rounds[currentRoundIndex];
      score = round.homeScore;
      score = score - 1;
      if (score < 0) {
        return;
      }
      updatedRounds = {
        homeScore: score,
        awayScore: round.awayScore,
        isComplete: false,
        isCurrent: true
      };
      rounds[currentRoundIndex] = updatedRounds;
      game.set('rounds', rounds.toArray());
      return game.save();
    },
    addPointAway: function() {
      var currentRound, currentRoundIndex, game, round, rounds, score, updatedRounds;
      game = this.get('model');
      currentRound = this.get('currentRound');
      currentRoundIndex = currentRound - 1;
      rounds = game.get('rounds');
      this.set('currentRound', rounds.length);
      round = rounds[currentRoundIndex];
      score = round.awayScore;
      score = score + 1;
      updatedRounds = {
        homeScore: round.homeScore,
        awayScore: score,
        isComplete: false,
        isCurrent: true
      };
      rounds[currentRoundIndex] = updatedRounds;
      game.set('rounds', rounds.toArray());
      return game.save();
    },
    subtractPointAway: function() {
      var currentRound, currentRoundIndex, game, round, rounds, score, updatedRounds;
      game = this.get('model');
      currentRound = this.get('currentRound');
      currentRoundIndex = currentRound - 1;
      rounds = game.get('rounds');
      this.set('currentRound', rounds.length);
      round = rounds[currentRoundIndex];
      score = round.awayScore;
      score = score - 1;
      if (score < 0) {
        return;
      }
      updatedRounds = {
        homeScore: round.homeScore,
        awayScore: score,
        isComplete: false,
        isCurrent: true
      };
      rounds[currentRoundIndex] = updatedRounds;
      game.set('rounds', rounds.toArray());
      return game.save();
    },
    endRound: function(round) {
      var currentRound, currentRoundIndex, game, rounds, score, updatedRounds;
      game = this.get('model');
      currentRound = this.get('currentRound');
      currentRoundIndex = currentRound - 1;
      if (round.homeScore > round.awayScore + 1) {
        score = game.get('homeScore');
        score = score + 1;
        rounds = game.get('rounds');
        this.set('currentRound', rounds.length);
        currentRound = rounds[currentRoundIndex];
        updatedRounds = {
          homeScore: currentRound.homeScore,
          awayScore: currentRound.awayScore,
          isComplete: true
        };
        rounds[currentRoundIndex] = updatedRounds;
        game.set('rounds', rounds.toArray());
        game.set('homeScore', score);
        game.save();
        return;
      }
      if (round.awayScore > round.homeScore + 1) {
        score = game.get('awayScore');
        score = score + 1;
        rounds = game.get('rounds');
        this.set('currentRound', rounds.length);
        currentRound = rounds[currentRoundIndex];
        updatedRounds = {
          homeScore: currentRound.homeScore,
          awayScore: currentRound.awayScore,
          isComplete: true
        };
        rounds[currentRoundIndex] = updatedRounds;
        game.set('rounds', rounds.toArray());
        game.set('awayScore', score);
        game.save();
        return;
      }
      console.log("Must win by 2, cannot be a tie/draw");
      return false;
    },
    newRound: function() {
      var game, new_round, rounds;
      game = this.get('model');
      rounds = game.get('rounds').toArray();
      new_round = {
        homeScore: 0,
        awayScore: 0,
        isComplete: false
      };
      rounds.push(new_round);
      game.set('rounds', rounds);
      return game.save();
    },
    confirmEndGame: function() {
      return this.set('confirmEndMatch', true);
    },
    undoEndGame: function() {
      return this.set('confirmEndMatch', false);
    },
    endGame: function() {
      var awayPerson, game, homePerson, l, loss, w, wins;
      game = this.get('model');
      homePerson = game.get('home');
      awayPerson = game.get('away');
      if (game.get('homeScore') > game.get('awayScore')) {
        wins = homePerson.get('wins');
        if ((wins == null) || wins === NaN) {
          wins = 0;
        }
        loss = awayPerson.get('losses');
        if ((loss == null) || loss === NaN) {
          loss = 0;
        }
        w = wins + 1;
        l = loss + 1;
        homePerson.set('wins', w);
        awayPerson.set('losses', l);
        homePerson.save();
        awayPerson.save();
        this.gameOver();
      }
      if (game.get('homeScore') < game.get('awayScore')) {
        wins = awayPerson.get('wins');
        if ((wins == null) || wins === NaN) {
          wins = 0;
        }
        loss = homePerson.get('losses');
        if ((loss == null) || loss === NaN) {
          loss = 0;
        }
        w = wins + 1;
        l = loss + 1;
        awayPerson.set('wins', w);
        homePerson.set('losses', l);
        homePerson.save();
        awayPerson.save();
        this.gameOver();
      }
    }
  }
});
});

;require.register("controllers/game_controller", function(exports, require, module) {
App.GameController = Ember.ObjectController.extend({
  needs: ['person'],
  addGame: function(home, away) {
    var newGame;
    newGame = this.get('store').createRecord("pendingGame", {
      home: home,
      away: away,
      createdAt: new Date()
    });
    newGame.save();
    return this.newGame(newGame);
  },
  removeGame: function(game) {
    return game["delete"]();
  },
  newGame: function(game) {
    var _this = this;
    return this.get('store').fetch('currentGame').then((function(currentGame) {
      if (currentGame.content.length < 1) {
        return _this.setCurrentGame(game);
      }
    }), function(error) {
      return console.log(error);
    });
  },
  setCurrentGame: function(pendingGame) {
    var currentGame, newRounds;
    newRounds = [
      {
        homeScore: 0,
        awayScore: 0
      }
    ];
    currentGame = this.get('store').createRecord('currentGame', {
      home: pendingGame.get('home'),
      away: pendingGame.get('away'),
      createdAt: pendingGame.get('createdAt'),
      startedAt: new Date(),
      homeScore: 0,
      awayScore: 0,
      rounds: newRounds
    });
    currentGame.save();
    pendingGame["delete"]();
    return this.startGame(currentGame);
  },
  startGame: function(currentGame) {
    var away, home;
    home = currentGame.get('home');
    return away = currentGame.get('away');
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
    var currentPerson, people,
      _this = this;
    currentPerson = this.get('person');
    people = this.get('content').map(function(person) {
      var isMe;
      isMe = person.get('id') === (currentPerson != null ? currentPerson.get('id') : void 0);
      person.set('isMe', isMe);
      return person;
    });
    return Em.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      content: people,
      sortProperties: ['wins'],
      sortAscending: false
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
      if (person.get('isWaiting')) {
        return;
      }
      person.setProperties({
        isWaiting: true,
        waiting_time: new Date()
      });
      person.save();
      return this.get('wait').addPerson(person);
    },
    leaveWaitingList: function() {
      var person;
      person = this.get('model');
      person.setProperties({
        isWaiting: false,
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
      createdAt: new Date()
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

;require.register("initializers/clock", function(exports, require, module) {
var clock;

clock = require('components/clock');

module.exports = Ember.Application.initializer({
  name: 'clock',
  initialize: function(container, application) {
    application.register('clock:main', clock, {
      instantiate: true,
      singleton: true
    });
    return application.inject('controller', 'clock', 'clock:main');
  }
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
  createdAt: FP.attr('date'),
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
  createdAt: FP.attr('date'),
  completedAt: FP.attr('date'),
  startedAt: FP.attr('date'),
  rounds: FP.attr('hash'),
  homeScore: FP.attr('number'),
  awayScore: FP.attr('number')
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
  createdAt: FP.attr('date'),
  isAdmin: FP.attr('boolean'),
  isWaiting: FP.attr('boolean'),
  waiting_time: FP.attr('date'),
  wins: FP.attr('number'),
  losses: FP.attr('number'),
  challenges: FP.hasMany('challenge', {
    embedded: false
  }),
  responses: FP.hasMany('challenge', {
    embedded: false
  }),
  avatar: FP.attr('string')
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
  createdAt: FP.attr('date')
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

;require.register("routes/completedGames", function(exports, require, module) {
module.exports = App.CompletedGamesRoute = Ember.Route.extend({
  model: function() {
    return this.store.fetch('completedGame');
  }
});
});

;require.register("routes/currentGames", function(exports, require, module) {
module.exports = App.CurrentGameRoute = Ember.Route.extend({
  model: function(params) {
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      return _this.store.fetch('currentGame', {
        limit: 1
      }).then(function(currentGames) {
        return resolve(currentGames.get('firstObject'));
      });
    });
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
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div class=\"currentGame\">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "game", "in", "currentGames", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n        <div class=\"game\">\n          Current Match:\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "currentGame", options) : helperMissing.call(depth0, "link-to", "currentGame", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          <span class=\"time\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.time", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        </div>\n      ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          <span class=\"player home\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          <span class=\"vs\">vs</span>\n          <span class=\"player away\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div class=\"pendingGames\">\n      <h3>Pending Games</h3>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "game", "in", "pendingGames", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <div class=\"game\">\n          <span class=\"player home\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          <span class=\"vs\">vs</span>\n          <span class=\"player away\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <ul class=\"action--list\">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "auth.person.challenges", {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "auth.person.responses", {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n  ");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <li> \n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "acceptChallenge", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Accept</button>\n      <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "declineChallenge", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Decline</button>\n      </li>\n    ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <li> \n      Challenge declined by ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeResponse", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Ok</button>\n      </li>\n    ");
  return buffer;
  }

function program17(depth0,data) {
  
  
  data.buffer.push("\n    No challenges.\n  ");
  }

function program19(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "wait", "in", "waitingList", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program20(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "wait.person.isWaiting", {hash:{},inverse:self.noop,fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program21(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <p>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "wait.isMe", {hash:{},inverse:self.program(25, program25, data),fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </p>\n      ");
  return buffer;
  }
function program22(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "wait.person.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(": Ping?\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.person.name", {hash:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program23(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push(" \n            <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "acceptGame", "wait.person", "auth.person", {hash:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Pong!</button>\n          ");
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "auth.person.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(": Ping?\n        ");
  return buffer;
  }

function program27(depth0,data) {
  
  
  data.buffer.push("\n  No one is waiting.\n  ");
  }

  data.buffer.push("<header class=\"hero\">\n  <h1 class=\"hero--text\">Table</h1>\n</header>\n<div class=\"main\">\n  <header class=\"banner\">\n    <nav>\n      <ul class=\"banner--navigation\">\n        <li class=\"banner--navigation--item\"><a href=\"#/\">Table Listing</a></li>\n        <li class=\"banner--navigation--item\"><a href=\"#/games\">Game History</a></li>\n        <li class=\"banner--navigation--item banner--navigation--login\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.person", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </li>\n      </ul>\n    </nav>\n  </header>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "currentGames.length", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  <div class=\"content--other\">\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "pendingGames.length", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h3 class=\"action--header\">Challenges</h3>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.person.challenges.length", {hash:{},inverse:self.program(17, program17, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h3 class=\"action--header\">Waiting List</h3>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "waitingList.length", {hash:{},inverse:self.program(27, program27, data),fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n</div>\n<footer class=\"clearfix footer\">\nTable - 2014 - by Patrick Simpson \n</footer>\n");
  return buffer;
  
});
});

;require.register("templates/completedGames", function(exports, require, module) {
module.exports = Ember.TEMPLATES['completedGames'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n<li>\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n(");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "awayScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "awayWinner", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n, \n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n(");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "homeScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(")\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "homeWinner", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "date", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</li>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\nW\n");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\nL\n");
  }

  data.buffer.push("<div class=\"content--container\">\n<h2>Game History</h2>\n<ul>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "games", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n</div>\n");
  return buffer;
  
});
});

;require.register("templates/components/people-list", function(exports, require, module) {
module.exports = Ember.TEMPLATES['components/people-list'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <li class=\"leaderboard--person\">\n  <span class=\"effect--person\">\n    ");
  hashContexts = {'classNames': depth0};
  hashTypes = {'classNames': "STRING"};
  options = {hash:{
    'classNames': ("link--person--avatar")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "person", "", options) : helperMissing.call(depth0, "link-to", "person", "", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    <span class=\"leaderboard--person--name\">\n    ");
  hashContexts = {'classNames': depth0};
  hashTypes = {'classNames': "STRING"};
  options = {hash:{
    'classNames': ("link--person")
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "person", "", options) : helperMissing.call(depth0, "link-to", "person", "", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </span>\n  </span>\n  <span class=\"leaderboard--stats\">\n    <span class=\"leaderboard--stat stat--win\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "wins", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </span>\n    <span class=\"leaderboard--stat stat--loss\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "losses", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </span>\n  </span>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isMe", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </li>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n      <img ");
  hashContexts = {'src': depth0,'alt': depth0,'title': depth0};
  hashTypes = {'src': "ID",'alt': "ID",'title': "ID"};
  options = {hash:{
    'src': ("avatar"),
    'alt': ("name"),
    'title': ("name")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" class=\"leaderboard--person--avatar\"> \n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push(" <span class=\"you\">&#8592 You</span>\n\n    ");
  }

function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      <!--<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "challenge", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Challenge</button>-->\n    ");
  return buffer;
  }

  data.buffer.push("<ol class=\"leaderboard\">\n  <li class=\"leaderboard--person leaderboard--header\">\n    <span class=\"leaderboard--person--name\">\n    Person\n    </span>\n    <span class=\"leaderboard--stats\">\n      <span class=\"leaderboard--stat stat--win\">\n      W\n      </span>\n      <span class=\"leaderboard--stat stat--loss\">\n      L\n      </span>\n    </span>\n  </li> \n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "people", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ol>\n");
  return buffer;
  
});
});

;require.register("templates/currentGame", function(exports, require, module) {
module.exports = Ember.TEMPLATES['currentGame'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['with'].call(depth0, "round", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h3 class=\"gameview--header clearfix\">Game ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "index", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h3>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['with'].call(depth0, "round", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("Game Active");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <div class=\"match--action\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "controller.confirmEndMatch", {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("          \n        </div>\n        ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newRound", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">New Game</button>\n            <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirmEndGame", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">End Match</button>\n          ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <p>Please check game scores and press ok to confirm:</p>\n          <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "endGame", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Ok</button>\n          <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "undoEndGame", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Cancel</button>\n          ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div class=\"gameview--content clearfix\">\n      <div class=\"actions actions--home\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" <span class=\"score\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "homeScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div> \n      <div class=\"actions actions--away\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <span class=\"score\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "awayScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.noop,fn:self.program(27, program27, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n      <div class=\"gameview--end\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isComplete", {hash:{},inverse:self.program(33, program33, data),fn:self.program(30, program30, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n    </div>\n    ");
  return buffer;
  }
function program13(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program14(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addPointHome", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button green\">+</button>");
  return buffer;
  }

function program16(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "homeWon", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program17(depth0,data) {
  
  
  data.buffer.push("W");
  }

function program19(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program20(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "subtractPointHome", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button red\">-</button>");
  return buffer;
  }

function program22(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program23(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "subtractPointAway", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button red\">-</button>");
  return buffer;
  }

function program25(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "awayWon", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program27(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program28(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addPointAway", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button green\">+</button>");
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(31, program31, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program31(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "endRound", "", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"endround button blue\">End Round</button>");
  return buffer;
  }

function program33(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCurrent", {hash:{},inverse:self.noop,fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program34(depth0,data) {
  
  
  data.buffer.push(" \n          Game Over!\n          ");
  }

  data.buffer.push("<div class=\"content--container--game gameview\">\n  <h2 class=\"gameview--main\">Current Match</h2>\n  <div class=\"gameview--current\">\n  <div class=\"player--content player--home\">\n    <span class=\"player--name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "home.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    <span class=\"overall--score\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "homeScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n  </div>\n  <div class=\"player--content player--away\">\n    <span class=\"overall--score\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "awayScore", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    <span class=\"player--name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "away.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n  </div>\n  <div class=\"gameview--actions\">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "roundsWithIndex", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n  </div>\n</div>\n");
  return buffer;
  
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

  data.buffer.push("<div class=\"content--container\">\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "challenges", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isAdding", {hash:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
});

;require.register("templates/person", function(exports, require, module) {
module.exports = Ember.TEMPLATES['person'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("<span class=\"you\">&#8592 You</span>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editPerson", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Edit</button>");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isChallenged", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      You challenged ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "authedPerson", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "challengeRequest", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button blue\">Challenge!</button>\n      ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "authedPerson", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program12(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "isWaiting", {hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "joinWaitingList", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button green\">Ping?</button>\n      ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "leaveWaitingList", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Cancel Ping</button>\n      ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.score", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n  ");
  return buffer;
  }

function program19(depth0,data) {
  
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

function program21(depth0,data) {
  
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

  data.buffer.push("<div class=\"content--container\">\n<div class=\"profile\">\n  <h2>\n    <img ");
  hashContexts = {'src': depth0,'alt': depth0,'title': depth0};
  hashTypes = {'src': "ID",'alt': "ID",'title': "ID"};
  options = {hash:{
    'src': ("avatar"),
    'alt': ("name"),
    'title': ("name")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || (depth0 && depth0['bind-attr'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" class=\"person--avatar\">\n    <span class=\"person--name\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isMe", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </h2>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isMe", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "isMe", {hash:{},inverse:self.program(11, program11, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  <div class=\"person--stats\">\n    <p>\n      <span class=\"person--stat\">Wins:</span><span class=\"stat-wins\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "wins", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    </p>\n    <p>\n      <span class=\"person--stat\">Losses:</span><span class=\"person--stat stat-losses\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "losses", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n    </p>\n  </div>\n  <h3>Recent Games</h3>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "games", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isEditing", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isAuthAdmin", {hash:{},inverse:self.noop,fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n");
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