App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
    1
  ).property('games')
  iAmSure: false
  actions:
    deleteMe: ->
      yousure = @get('iAmSure')
      if !yousure
        alert("Go if you must... but you must be sure.")
      else
        person = @get('model')
        person.delete()
        @set('iAmSure', false)
        @transitionTo('/')