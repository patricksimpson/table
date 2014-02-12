App.PeopleController = Ember.ArrayController.extend(
  sortProperties: ['name']
  sortAscending: true
  peopleCount: (->
      @get('model.length')
  ).property('@each')
)
