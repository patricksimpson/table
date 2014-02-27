module.exports = App.Router.map ->
  # put your routes here
  @resource "people", { path: '/' }
  @resource "person", { path: '/person/:person_id' }
  #@resource "completedGame", {path: '/games'}
  #@resource "pendingGame", {path: '/games/pending'}
  @resource "currentGame", { path: '/game/current' }
