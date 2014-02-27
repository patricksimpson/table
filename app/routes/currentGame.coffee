module.exports = App.CurrentGameRoute = Ember.Route.extend
  model: ->
    @store.fetch('currentGame')
