import Friend from "../models/friend";

const Friends = Backbone.Collection.extend({
	model: Friend,
	url: "/friends",

	comparator: function(f1, f2) {
		if (f1.get('status') == 'offline' && f2.get('status') != 'offline')
			return (1);
		if (f1.get('status') != 'offline' && f2.get('status') == 'offline')
			return (-1);
		return (f1.get('username').toLowerCase() < f2.get('username').toLowerCase() ? -1 : 1);
	}
});

export default Friends;