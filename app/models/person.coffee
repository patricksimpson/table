App.Person = FP.Model.extend
  name: FP.attr 'string'
  twitter: FP.attr 'string'
  email: FP.attr 'string'
  createdAt: FP.attr 'date'
  isAdmin: FP.attr 'boolean'
  isWaiting: FP.attr 'boolean'
  waiting_time: FP.attr 'date'
  wins: FP.attr 'number'
  losses: FP.attr 'number'
  challenges: FP.hasMany('challenge', {embedded: false})
  responses: FP.hasMany('challenge', {embedded: false})
  avatar: FP.attr 'string'
