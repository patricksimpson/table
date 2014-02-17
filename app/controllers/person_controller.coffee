App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
    1
  ).property('games')
  add: ->
App.NewpersonController = Ember.ObjectController.extend
  content: ->
    personName: null
    personEmail: null
  actions:
    addPerson: ->
      personName = @get('personName')
      personEmail = @get('personEmail')
      if personName == undefined or personName == ""
        personName = "Nobody"
      if personEmail == undefined or personEmail == ""
        personEmail = "nobody@mail.com"
      person = @store.createRecord("person",
        name: personName
        email: personEmail
      )
      person.save()
      @transitionToRoute('/')
