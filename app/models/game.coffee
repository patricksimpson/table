App.Game = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  createdAt: FP.attr 'date'
  completedAt: FP.attr 'date'
  startedAt: FP.attr 'date'
  rounds: FP.attr 'hash'
