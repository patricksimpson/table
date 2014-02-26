App.GameCurrent = FP.Model.extend
  game: FP.hasOne("game", {embedded: false})