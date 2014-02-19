App.ApplicationController = Ember.ArrayController.extend
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
      @set('isAdding', false)

    showAdd: ->
      alert("isAdding")
      @set('isAdding', true)
  isAdding: false
