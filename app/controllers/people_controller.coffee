App.PeopleController = Ember.ArrayController.extend  
  errors: []
  personName: null
  personEmail: null
  actions:
    addPerson: ->
      personName = @get('personName')
      personEmail = @get('personEmail')
      errors = @get('errors')
      errors = [] 
      if personName == undefined or personName == "" or personName == null
        errors.push "Person name empty."
      if personEmail == undefined or personEmail == "" or personEmail== null
        errors.push "Person email empty."
      if errors.length < 1
        person = @store.createRecord("person",
          name: personName
          email: personEmail
        )
        person.save()
        @set('isAdding', false)
        @set('personName', null)
        @set('personEmail', null)
      else
        @set('errors', errors)

    showAddPerson: ->
      @set('isAdding', true)
    cancelAddPerson: ->
      @set('isAdding', false)
      @set('errors', [])
      @set('personName', null)
      @set('personEmail', null)
      
  isAdding: false