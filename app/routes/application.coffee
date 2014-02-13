module.exports = App.ApplicationRoute = Ember.Route.extend
  setupController: (controller, model) ->
    @_super(arguments...)
    controller.set('people', @get('store').findAll('person'))
