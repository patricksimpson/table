module.exports = App.ChallengeRoute = Ember.Route.extend
  model: ->
    @get('store').findAll('challenge')
