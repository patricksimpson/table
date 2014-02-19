module.exports = App.PeopleRoute = Ember.Route.extend
  model: ->
    @get('store').findAll('person')
