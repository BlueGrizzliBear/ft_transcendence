import consumer from "channels/consumer";

import FriendsListView from 'views/friendsList';
import ChatRoomsView from 'views/chatRooms';

import { GuildsView } from 'views/guild/guilds';
import { GuildView } from 'views/guild/guild';
import { GuildNewView } from 'views/guild/guildNew';

import * as GC from 'views/garbage_collector';
import SelectModeView from 'views/selectMode';
import { MatchmakingView, cancelMatchmaking } from 'views/matchmaking';
import GameView from 'views/game';
import * as Pong from 'views/animations/game';

import { User } from 'models/user';
import { UsersView } from 'views/rank/users';
import { MatchesHistoryView } from 'views/rank/matchesHistory';
import { UserShowView } from './views/user/userShow';
import { UserUpdateView } from './views/user/userUpdate';
import { UserCreateView } from './views/user/userCreate';
import { UserTfaView } from './views/user/userTfa';

import RulesView from './views/rules';

window.currentUser = new User({ id: initCurrentUserId });

$(function () {
	connectUserChannel();
	window.friendsListView = new FriendsListView();
	window.chatRoomsView = new ChatRoomsView();
	window.achievmentQueue = [];

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		guildsView: new GuildsView({ el: $main }),
		guildView: new GuildView({ el: $main }),
		guildNewView: new GuildNewView({ el: $main }),
		usersView: new UsersView({ el: $main }),
		matchesHistoryView: new MatchesHistoryView({ el: $main }),
		gameView: new GameView({ el: $main }),
		matchmakingView: new MatchmakingView({ el: $main }),
		selectModeView: new SelectModeView({ el: $main }),
		userShowView: new UserShowView({ el: $main }),
		userUpdateView: new UserUpdateView({ el: $main }),
		userCreateView: new UserCreateView({ el: $main }),
		userTfaView: new UserTfaView({ el: $main }),
		rulesView: new RulesView({el: $main}),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/matchmaking": "matchmaking",
			"game/matchmaking/:id": "matchmaking",
			"game/:id": "game",
			"guilds": "guilds",
			"guilds/new": "newguild",
			"guilds/:id": "displayguild",
			"users": "users",
			"user/:id/matcheshistory": "matcheshistory",
			"user/:id/show": "userShow",
			"user/:id/edit": "updateUser",
			"user/:id/create": "createUser",
			"user/:id/tfa": "tfa",
			"rules": "rules"
		},

		execute: function (callback, args, name) {
			this.clearAnimations();
			$main.empty();
			$('nav > a').removeClass('selected');
			callback.apply(this, args);
		},
		clearAnimations: function () {
			Pong.removeSubscription();
			if (window.waitOpponentInterval)
				cancelMatchmaking();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
		},

		guilds: function () {
			$('#guild_link').addClass('selected');
			this.guildsView.render();
		},

		displayguild: function (id) {
			$('#guild_link').addClass('selected');
			this.guildView.render(parseInt(id));
		},

		newguild: function () {
			$('#guild_link').addClass('selected');
			this.guildNewView.render();
		},
		users: function () {
			$('#rank_link').addClass('selected');
			this.usersView.render();
		},
		matcheshistory: function (id) {
			$('#rank_link').addClass('selected');
			this.matchesHistoryView.render(parseInt(id));
		},
		selectMode: function () {
			$('#game_link').addClass('selected');
			this.selectModeView.render();
		},
		matchmaking: function (match_id) {
			$('#game_link').addClass('selected');
			this.matchmakingView.render(match_id);
		},
		game: function (id) {
			$('#game_link').addClass('selected');
			if (id == null) {
				this.navigate('game/matchmaking', { trigger: true });
				return;
			}
			this.gameView.render(id);
		},

		userShow: function (id) {
			this.userShowView.render(id);
		},

		updateUser: function (id) {
			this.userUpdateView.render(id);
		},

		createUser: function (id) {
			this.userCreateView.render(id);
		},

		tfa: function (id) {
			this.userTfaView.render(id);
		},

		rules: function() {
			this.rulesView.render();
		}

	});
	window.router = new myRouter();
	Backbone.history.start();
});

function connectUserChannel() {
	window.userSubscription = consumer.subscriptions.create({ channel: "UserChannel" },
		{
			connected() { /*console.log('connected to user channel');*/ },
			disconnected() { /*console.log('disconnected from user channel');*/ },
			received(data) {
				//console.log('Received data for user :', data.content);
				if (data.content.chatroom) {
					data.content.chatroom.silent = true;
					window.chatRoomsView.chatRoomsCollection.add(data.content.chatroom);
				}
				else if (data.content.remove_challenge) {
					window.chatRoomsView.chatRoomViews[data.content.chatroom_id].removeChallenge(data.content.message_id);
					stopChallengeMessage(data.content.message_id, data.content.reason);
					if (data.content.reason == 'accepted')
						Backbone.history.navigate("game/matchmaking/" + data.content.match_id, {trigger: true});
				}
				else if (data.content.chat_ban)
					window.chatRoomsView.chatRoomViews[data.content.chat_ban].removeRoom();
				else if (data.content.friend_status
				&& window.friendsListView.friendsCollection.get(data.content.friend_id))
					window.friendsListView.friendsCollection.get(data.content.friend_id).set({
						status: data.content.friend_status,
						match_id: data.content.match_id
					});
				else if (data.content.achievment)
					newAchievment(data.content.achievment);
		}
	});
}

function stopChallengeMessage(message_id, text) {
	const $message = $('#chat_body .challenge[data-message-id="' + message_id + '"]');
	clearInterval($message.data('timeLeftInterval'));
	$message.find('span.time_left').text(text);
	$message.find('.challenge_answers').remove();
}

function newAchievment(description) {
	window.achievmentQueue.push(description);
	if ($('#achievmentPopUp').length == 0)
		displayAchievment(window.achievmentQueue.shift());
}

function displayAchievment(description) {
	const template = _.template($('#achievmentPopUpTemplate').html());
	$(document.body).append(template({description: description}));
	$('#achievmentPopUp').on('click', function() {
		$('#achievmentPopUp').remove();
		if (window.achievmentQueue.length > 0)
			displayAchievment(window.achievmentQueue.shift());
	});

}