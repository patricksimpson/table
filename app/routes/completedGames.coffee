module.exports = App.CompletedGamesRoute = Ember.Route.extend
  model: ->
    @store.fetch('completedGame')
