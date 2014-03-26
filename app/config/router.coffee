module.exports = App.Router.map ->
  # put your routes here
  @resource "people", path: '/'
  @resource "person", path: '/person/:person_id'
  @resource "currentGame", path: '/current'
  @resource "completedGames", path: '/games'
  @resource "moderator", path: '/moderator'
