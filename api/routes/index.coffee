fs = require("fs")
module.exports = (app) ->
  fs.readdirSync(__dirname).forEach (file) ->
    return  if file is "index.coffee" or file.substr(file.lastIndexOf(".") + 1) isnt "coffee"
    name = file.substr(0, file.indexOf("."))
    require("./" + name) app
    return

  return
