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
  return this.resource("person", {
    path: '/person/:person_id'
  }, function() {
    return this.route("edit");
  });
});
});

;require.register("controllers/application_controller", function(exports, require, module) {
App.ApplicationController = Ember.Controller.extend({
  needs: ['auth'],
  authBinding: "controllers.auth",
  actions: {
    login: function() {
      return this.get('controllers.auth').login();
    },
    logout: function() {
      return this.get('controllers.auth').logout();
    }
  }
});
});

;require.register("controllers/auth_controller", function(exports, require, module) {
App.AuthController = Ember.Controller.extend({
  isAuthed: false,
  user: {},
  init: function() {
    var slRef,
      _this = this;
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com');
    return this.authClient = new FirebaseSimpleLogin(slRef, function(err, user) {
      if (!err && user) {
        _this.set('isAuthed', true);
        return _this.pickName(user);
      }
    });
  },
  pickName: function(user) {
    var peopleRef,
      _this = this;
    this.set('user', user);
    peopleRef = new Firebase('https://glaring-fire-8110.firebaseio.com/people');
    return peopleRef.on('value', function(snapshot) {
      var key, newPerson, people, person;
      people = snapshot.val();
      user = _this.get('user');
      for (key in people) {
        person = people[key];
        if (person.twitter === user.username) {
          console.log("Hello" + person.twitter);
          return;
        }
      }
      newPerson = _this.store.createRecord("person", {
        name: user.name,
        twitter: user.username,
        email: '',
        create_date: new Date()
      });
      return newPerson.save();
    });
  },
  login: function() {
    return this.authClient.login('twitter', {
      rememberMe: true
    });
  },
  logout: function() {
    this.authClient.logout();
    this.set('isAuthed', false);
    return this.set('user', {});
  }
});
});

;require.register("controllers/people_controller", function(exports, require, module) {
App.PeopleController = Ember.ArrayController.extend({
  errors: [],
  personName: null,
  personEmail: null,
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

;require.register("controllers/person/edit", function(exports, require, module) {
module.exports = App.PersonEditController = Ember.ObjectController.extend();
});

;require.register("controllers/person_controller", function(exports, require, module) {
App.PersonController = Ember.ObjectController.extend({
  wins: (function() {
    return 1;
  }).property('games'),
  iAmSure: false,
  actions: {
    deleteMe: function() {
      var person, yousure;
      yousure = this.get('iAmSure');
      if (!yousure) {
        return alert("Go if you must... but you must be sure.");
      } else {
        person = this.get('model');
        person["delete"]();
        this.set('iAmSure', false);
        return this.transitionTo('/');
      }
    }
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

;require.register("models/person", function(exports, require, module) {
App.Person = FP.Model.extend({
  name: FP.attr('string'),
  twitter: FP.attr('string'),
  email: FP.attr('string'),
  create_date: FP.attr('date'),
  games: FP.hasMany("games", {
    embedded: false,
    as: "games"
  }),
  user: FP.hasOne("user", {
    embedded: false
  })
});
});

;require.register("models/user", function(exports, require, module) {
App.User = FP.Model.extend({
  timestamp: FP.attr('date')
});
});

;require.register("routes/application", function(exports, require, module) {
module.exports = App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    return controller.set('people', this.get('store').findAll('person'));
  }
});
});

;require.register("routes/index", function(exports, require, module) {

});

;require.register("routes/people", function(exports, require, module) {
module.exports = App.PeopleRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    return controller.set('people', this.get('store').findAll('person'));
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

;require.register("templates/application", function(exports, require, module) {
module.exports = Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          Logged in as ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "auth.user.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logout", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Logout</button>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "login", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button grey\">Login or Signup</button>\n        ");
  return buffer;
  }

  data.buffer.push("<header class=\"hero\">\n  <h1 class=\"hero--text\">Table</h1>\n</header>\n<header class=\"banner\">\n  <nav>\n    <ul class=\"banner--navigation\">\n      <li class=\"banner--navigation--item\"><a href=\"/\">Table Listing</a></li>\n      <li class=\"banner--navigation--item\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "auth.isAuthed", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </li>\n    </ul>\n  </nav>\n</header>\n<div class=\"main\">\n  People on table: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "people.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  <div class=\"content\">\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n</div>\n<footer class=\"footer\">\nTable - 2014 - by Patrick Simpson \n</footer>");
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
  data.buffer.push("\n</li>\n");
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

  data.buffer.push("<h2>Leaderboard</h2>\n<ul>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "people", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
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
  var stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n<h2>Add Person</h2>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "errors", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
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
function program2(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("<p class=\"error\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  ");
  hashContexts = {'people': depth0};
  hashTypes = {'people': "ID"};
  options = {hash:{
    'people': ("people")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['people-list'] || (depth0 && depth0['people-list'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "people-list", options))));
  data.buffer.push("\n  <div class=\"button--container\"><button class=\"button--add\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "showAddPerson", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></button></div>\n");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isAdding", {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});
});

;require.register("templates/person", function(exports, require, module) {
module.exports = Ember.TEMPLATES['person'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "game.score", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"profile\">\n  <h2>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h2>\n  <a href=\"#\">Challenge</a>\n  <div class=\"stats\">\n    Wins: <span class=\"wins\">");
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
  stack1 = helpers.each.call(depth0, "games", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n<div class=\"deleteme\">\n  <label for=\"iamsure\">I have decided that I am not a fun person, therefore I wish to be deleted: </label>\n  ");
  hashContexts = {'type': depth0,'checked': depth0,'id': depth0};
  hashTypes = {'type': "STRING",'checked': "ID",'id': "STRING"};
  options = {hash:{
    'type': ("checkbox"),
    'checked': ("iAmSure"),
    'id': ("iamsure")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <button ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteMe", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" class=\"button black\">Delete Me</button>\n</div>");
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