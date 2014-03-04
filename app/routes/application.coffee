module.exports = App.ApplicationRoute = Ember.Route.extend
  setupController: (controller, model) ->
    controller.set('people', @get('store').findAll('person'))
    controller.set('waits', @get('store').findAll('wait'))
    controller.set('currentGame', @get('store').findAll('currentGame'))
    controller.set('pendingGames', @get('store').findAll('pendingGame'))
    controller.set('challengeData', @get('store').findAll('challenge'))
    
