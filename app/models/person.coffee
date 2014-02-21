App.Person = FP.Model.extend
  name: FP.attr 'string'
  twitter: FP.attr 'string'
  email: FP.attr 'string'
  created_at: FP.attr 'date'
  is_admin: FP.attr 'boolean'
  wins: FP.attr 'number'
  losses: FP.attr 'number'
