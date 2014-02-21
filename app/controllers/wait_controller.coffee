App.WaitController = Ember.ArrayController.extend
  needs: ['person']
  addPerson: (appendPerson) ->
    if @isWait(appendPerson)
      @doAddPerson(appendPerson)
  isWait: (person) ->
    @get('store').fetch('wait').then ((wait) =>
      for n in wait.content
        if n.get('person').get('id') == person.get('id')
          @set('controllers.person.isWaiting', true)
          return true
      return false
    )
  removePerson: (person) ->
    @get('store').fetch('wait').then ((wait) =>
      for n in wait.content
        if n.get('person').get('id') == person.get('id')
          n.delete()
          return true
      return false
    )
  doAddPerson: (appendPerson) ->
    newWait = @get('store').createRecord("wait",
      person: appendPerson
    )
    newWait.save()
