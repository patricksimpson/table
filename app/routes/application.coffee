module.exports = App.ApplicationRoute = Ember.Route.extend
  setupController: (controller, model) ->
    controller.set('people', @get('store').findAll('person'))
    #controller.set('table', @get('store').find('tablename'))
