class InvitesController < ApplicationController
  before_action :set_invite, only: %i[ show edit update accept refuse destroy ]
  # before_action :set_invite, only: %i[ update accept refuse destroy ]

  # GET /invites or /invites.json
  def index
    # LE TEMPS DE ...
    if self.admin?
      @invites = Invite.all
    elsif self.check_user && self.check_no_guild
      @invites = Invite.where(:user_id => session[:user_id])
    elsif self.check_user && self.check_is_guild_owner
      @invites = Invite.where(:guild_id => @guild[:id])
    end
  end

  # GET /invites/1 or /invites/1.json
  def show
    if self.admin? || (self.check_user && session[:user_id] == Invite.find(params[:id])[:user_id]) \
      || (self.check_user && self.check_is_guild_owner && @guild[:id] == Invite.find(params[:id])[:guild_id])
      @invite = Invite.find(params[:id])
    end
  end

  # POST /invites or /invites.json
  def create
    @invite = Invite.new(invite_params)

    if (self.admin? || (self.check_user && self.check_no_guild && self.check_own_invite)) && @invite.save
      render json: @invite, status: :created
    else
      render json: @invite.errors, status: :unprocessable_entity
    end
  end

  # Accept action and DELETE /invites/1/accept or /invites/1.json/accept
  def accept
    if self.check_user && self.check_owner_user

      @user = User.find(@invite[:user_id])
      @user[:guild_id] = @guild[:id]

      Invite.all.where(:user_id => @user[:id]).destroy_all
      @user.save

      head :no_content
    else
      render json: { }, status: :unprocessable_entity
    end
  end

    # Refuse action and DELETE /invites/1/refuse or /invites/1.json/refuse
  def refuse
    if self.check_user && self.check_owner_user
      @invite.destroy
      head :no_content
    else
      render json: { }, status: :unprocessable_entity
    end
  end

  # DELETE /invites/1 or /invites/1.json
  def destroy
    if self.admin? || (self.check_user && self.check_own_invite)
      @invite.destroy
      head :no_content
    else
      render json: { }, status: :unprocessable_entity
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_invite
      @invite = Invite.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def invite_params
      params.require(:invite).permit(:user_id, :guild_id)
    end

    # A function to check if user is authenticated and if the user doesn't have a guild yet
    def check_user
      if self.admin?
        return 1
      end
      return (session[:user_id] && User.find(session[:user_id])) ? 1 : nil
    end

    # A function to give all the right for certain users for debug purposes
    def admin?
      return false
      # return (session[:user_id] && User.find(session[:user_id])[:login] == '') ? true : false
    end

    # # A function to check if user is authenticated and if the user doesn't have a guild yet
    def check_no_guild
      return (!User.find(session[:user_id])[:guild_id]) ? 1 : nil
    end

    # A function to check if user is authenticated and if the user doesn't have a guild yet
    def check_own_invite
      return (@invite[:user_id] == session[:user_id]) ? 1 : nil
    end

    # A function to check if user is authenticated as the guild owner
    def check_owner_user
      @guild = Guild.find(@invite[:guild_id])
      if self.admin?
        return 1
      end
      return (@guild[:owner_id] == session[:user_id]) ? 1 : nil
    end

    # A function to check if user is authenticated as the guild owner
    def check_is_guild_owner
      @guild = Guild.find(User.find(session[:user_id])[:guild_id])
      return (@guild[:owner_id] == session[:user_id]) ? 1 : nil
    end
end
