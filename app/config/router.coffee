module.exports = App.Router.map ->
  # put your routes here
  @resource "person", { path: '/person/:person_id' }, ->
    @route "edit"
    @route "new"
