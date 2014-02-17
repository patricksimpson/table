module.exports = App.ApplicationRoute = Ember.Route.extend
  setupController: (controller, model) ->
    controller.set('people', @get('store').findAll('person'))
