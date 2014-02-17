App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
    1
  ).property('games')
  add: ->
