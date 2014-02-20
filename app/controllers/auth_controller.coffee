App.AuthController = Ember.Controller.extend
  needs: ['people']
  needs: ['person']
  isAuthed: false
  authId: 0
  setupAuth:( ->
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com')
    @authClient = new FirebaseSimpleLogin(slRef, (err, user) =>
      if !err && user
        @pickUser(user)
    )
  ).on('init')
  pickUser: (user) ->
    @set('user', user)
    @set('authId', user.id)
    @get('store').fetch('person', user.id).then ((person) =>
      person.setProperties(
        name: user.name
        twitter: user.username
      )
      person.save()
      @set('person', person)
      @set('isAuthed', true)
      @set('controllers.person.loggedIn', true)
    ), (error) =>
      newPerson = @get('store').createRecord("person",
        id: user.id
        name: user.name
        twitter: user.username
        email: ''
        is_admin: false
        created_at: new Date()
      )
      newPerson.save().then =>
        @set('person', person)
      @set('isAuthed', true)
      @set('controllers.person.loggedIn', true)

  login: ->
    @authClient.login('twitter', { rememberMe: true } )
    
  logout: ->
    @authClient.logout()
    @set('isAuthed', false)
    @set('person', undefined)
