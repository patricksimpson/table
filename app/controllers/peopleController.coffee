App.PeopleController = Ember.ArrayController.extend(
  sortProperties: ['name']
  sortAscending: true
  peopleCount: ->
    {
      return @get('model.length')
    }.property('@each')
)
