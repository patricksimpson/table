module.exports = App.Router.map ->
  # put your routes here
  @resource "people", ->
    @resource "person",
      path: "/:person_id"
    , ->
      @route "edit"
      return

    @route "add"
    return

  return
