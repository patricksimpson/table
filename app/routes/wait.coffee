module.exports = App.WaitRoute = Ember.Route.extend
  model: ->
    @get('store').findAll('wait')
