App.Challenge = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  created_at: FP.attr 'date'
  message: FP.attr 'string'
