App.AuthController = Ember.Controller.extend
  isAuthed: false
  user: {}
  init: ->
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com')
    
    @authClient = new FirebaseSimpleLogin(slRef, (err, user) =>
      if !err && user
        @set('isAuthed', true)
        @pickName(user)
        
    )
    
  pickName: (user) ->
    @set('user', user)
    peopleRef = new Firebase('https://glaring-fire-8110.firebaseio.com/people')
    peopleRef.on('value', (snapshot) =>
      people = snapshot.val()
      user = @get('user')
       
      for key,person of people
        if person.twitter == user.username
          console.log "Hello" + person.twitter
          return
      
      newPerson = @store.createRecord("person",
        name: user.name
        twitter: user.username
        email: ''
        create_date: new Date()
      )
      newPerson.save()
    )
    
  login: ->
    @authClient.login('twitter', { rememberMe: true } )
  logout: ->
    @authClient.logout()
    @set('isAuthed', false)
    @set('user', {})