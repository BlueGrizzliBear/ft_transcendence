const ChatRoom = Backbone.Model.extend({
	initialize: function() {
		this.name = this.get('name');
		if (this.get('room_type') == 'direct_message') {
			this.name = this.get('users')[0].id == window.user_id ? this.get('users')[1].username : this.get('users')[0].username;
		}
	},
	toJSONDecorated: function() {
		const result = this.toJSON();
		if (result.room_type == 'direct_message')
			result.name = this.name;
		const me = result.users.find(user => user.id == window.user_id);
		if (me)
			result.admin = me.admin;
		return result;
	}
});

export default ChatRoom;