module.exports = App.IndexRoute = Ember.Route.extend
  setupController: (controller, model) ->
    controller.set('people', @get('store').findAll('person'))
