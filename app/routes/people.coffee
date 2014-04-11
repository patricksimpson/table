module.exports = App.PeopleRoute = Ember.Route.extend
  model: ->
    @modelFor("application")[0]
