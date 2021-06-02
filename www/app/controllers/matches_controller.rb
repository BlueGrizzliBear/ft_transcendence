class MatchesController < ApplicationController

	def matchmaking
		if session[:user_id].blank? then return render json: {}, status: :unauthorized end
		matches = Match.order(:created_at).where('left_player is null or right_player is null').limit(1)
		if matches.blank?
			match = Match.new(left_player: session[:user_id])
		else
			match = matches.first
			if match["left_player"].nil? and match["right_player"] != session[:user_id]
				match["left_player"] = session[:user_id]
			elsif match["right_player"].nil? and match["left_player"] != session[:user_id]
				match["right_player"] = session[:user_id]
			end
		end
		match.save
		render json: match
	end

	def show
		match = Match.find(params[:id])
		render json: match
	end

	def side
		match = Match.find(params[:id])
		if match["left_player"] == session[:user_id]
			render json: {side: "left"}
		elsif match["right_player"] == session[:user_id]
			render json: {side: "right"}
		else
			render json: {side: "unknown"}
		end
	end
end