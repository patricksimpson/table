App.Challenge = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  createdAt: FP.attr 'date'
  message: FP.attr 'string'
  declined: FP.attr 'boolean'
