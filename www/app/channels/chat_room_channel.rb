class ChatRoomChannel < ApplicationCable::Channel
	def subscribed
		@roomId = params["room_id"]
		@chatRoom = ChatRoom.find_by_id(@roomId)
		if @chatRoom and defined?(current_user)
			stream_for @chatRoom

			ChatRoomChannel.broadcast_to @chatRoom, content: {
				newMember: {
					id: current_user.id,
					username: current_user.username,
					status: current_user.status == 'offline' ? 'online' : current_user.status,
					admin: @chatRoom.chat_memberships.find_by_user_id(current_user.id).admin
				}
			}
		else
			reject
		end
	end

	def unsubscribed
		if defined?(current_user)
			ChatRoomChannel.broadcast_to @chatRoom, content: {
				memberLeaving: current_user.id
			}
		end
		stop_stream_for @chatRoom
	end

	def receive(data)
		if data['content'].present?
			membership = current_user.chat_memberships.find_by_chat_room_id(@roomId)
			if not membership or membership.muted then return end

			message = ActionController::Base.helpers.strip_tags(data['content'])
			message_record = Message.new(user_id: current_user.id, content: message)
			@chatRoom.messages << message_record
			@chatRoom.save
			ChatRoomChannel.broadcast_to @chatRoom, content: {
				message: message_record.complete_infos
			}
			if @chatRoom.room_type == 'direct_message'
				membership = @chatRoom.chat_memberships.where.not(user_id: current_user.id).first
				if membership.hidden
					membership.update_attribute(:hidden, false)
					UserChannel.broadcast_to membership.user, content: {
						chatroom: @chatRoom.complete_infos(current_user)
					}
				end
			end
		end

		current_user.chat_memberships.find_by_chat_room_id(@roomId).touch
	end
end