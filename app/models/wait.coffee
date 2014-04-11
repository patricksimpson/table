App.Wait = FP.Model.extend
  person: FP.hasOne("person", {embedded:false})
  twitter: FP.attr 'string'
  createdAt: FP.attr 'date'
