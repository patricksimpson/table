module.exports = App.ChallengeRoute = Ember.Route.extend
  model: ->
    @store.fetch('challenge')
