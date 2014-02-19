App.AuthController = Ember.Controller.extend
  needs: ['people']
  isAuthed: false
  setupAuth:( ->
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com')
    @authClient = new FirebaseSimpleLogin(slRef, (err, user) =>
      if !err && user
        @set('isAuthed', true)
        @pickUser(user)
    )
  ).on('init')
  pickUser: (user) ->
    @set('user', user)
    @get('store').fetch('person', user.id).then ((person) =>
      person.setProperties(
        name: user.name
        twitter: user.username
      )
      person.save()
      @set('person', person)
      
    ), (error) =>
      console.log user
      newPerson = @get('store').createRecord("person",
        id: user.id
        name: user.name
        twitter: user.username
        email: ''
        create_date: new Date()
      )
      newPerson.save().then =>
        @set('person', person)
    
  login: ->
    @authClient.login('twitter', { rememberMe: true } )
    
  logout: ->
    @authClient.logout()
    @set('isAuthed', false)
    @set('person', undefined)
