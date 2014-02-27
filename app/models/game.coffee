App.Game = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  created_at: FP.attr 'date'
  completed_at: FP.attr('date')
  started_at: FP.attr('date')
  rounds: FP.hasMany("rounds")
