import ChatRooms from '../collections/chatRooms';
import ChatRoomView from './chatRoom';
import MessageView from "./message";

const ChatRoomsView = Backbone.View.extend({
	chatRoomsCollection: new ChatRooms(),
	chatRoomViews: {},
	activeRoomId: null,

	initialize: function() {
		this.setElement($('#chat #chat_rooms'));
		this.chatRoomsCollection.fetch({context: this, success: function() {
			this.render();
			//this.chatRoomsCollection.on('add', this.reload, this);
			//this.chatRoomsCollection.on('change', this.reload, this);
			if (this.chatRoomsCollection.length) {
				this.activeRoomId = this.chatRoomsCollection.at(0).id;
				this.chatRoomViews[this.activeRoomId].selectRoomAndRenderMessages();
			}
		}});
		$('#chat #chat_body_container input').on('keypress', this, this.submitMessage);
	},

	render: function() {
		this.chatRoomsCollection.each(function(room) {
			let chatRoomView = new ChatRoomView({model: room});
			this.$el.append(chatRoomView.$el);
			this.chatRoomViews[room.id] = chatRoomView;
			chatRoomView.on('selectRoom', this.selectRoom, this);
			chatRoomView.messages.on('add', this.addMessage, this);
		}, this);
	},
	reload: function() {
		this.chatRoomsCollection.sort();
		this.$el.empty();
		this.render();
	},

	selectRoom: function(chatRoomId) {
		this.activeRoomId = chatRoomId;
		this.$el.children('div').removeClass('active');
		this.scrollBottom();
	},

	submitMessage: function(e) {
		if (e.keyCode == 13 && this.value) {
			e.data.chatRoomViews[e.data.activeRoomId].trigger('sendMessage', this.value);
			this.value = '';
		}
	},
	addMessage: function(message) {
		if (message.get('chat_room_id') == this.activeRoomId) {
			const messageView = new MessageView({model: message});
			$('#chat_body').append(messageView.$el);
			this.scrollBottom();
		}
	},
	scrollBottom: function() {
		$('#chat_body_container').scrollTop($('#chat_body_container').prop('scrollHeight'));
	}
});

export default ChatRoomsView;