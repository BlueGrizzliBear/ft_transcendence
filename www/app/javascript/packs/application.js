// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

import Backbone from 'backbone'

Rails.start()
Turbolinks.start()
ActiveStorage.start()

Backbone._sync = Backbone.sync;
Backbone.sync = function(method, model, options) {
  if (!options.noCSRF) {
    var beforeSend = options.beforeSend;

    // Set X-CSRF-Token HTTP header
    options.beforeSend = function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
      if (beforeSend) { return beforeSend.apply(this, arguments); }
    };
  }
  return Backbone._sync(method, model, options);
};

import { Users } from 'collections/users';
import { UsersView } from 'views/users';

$(function() {
	let userCollection = new Users();
	userCollection.fetch({
		success: function(collection, response) {
			//fetch successful, lets iterate and update the values here
			collection.each(function (item, index, all) {
				item.set("name", item.get("name") + "_"); // lets update all book names here
				item.save();
			});
			console.log(userCollection);
			let usersView = new UsersView({el: $('#UsersView'), model: userCollection});
		}
	});
});