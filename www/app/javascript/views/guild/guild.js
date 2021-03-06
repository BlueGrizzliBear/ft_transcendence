import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { InvitesView } from 'views/guild/invites';

import { Users } from 'collections/users';

import { Invite } from 'models/invite';
import { Guild } from 'models/guild';

export const GuildView = Backbone.View.extend({

    invitesView: new InvitesView(),
    figuresView: new FiguresView(),
    membersView: new MembersView(),
    guild: new Guild(),

    mainButtonClick: function (evt) {
        let thisView = evt.data.thisView;
        if (evt.target.id == 'DestroyButton') {
            if (confirm("You are about to destroy this guild. Are you sure ?")) {
                let guild = new Guild({ id: thisView.guild.id });
                guild.destroy({
                    success: function () {
                        Backbone.history.navigate("guilds", { trigger: true });
                    },
                    error: function () {
                        Backbone.history.navigate("guilds", { trigger: true });
                    }
                });
            }
            else
                $('#DestroyButton').one("click", { thisView: thisView }, thisView.mainButtonClick);
        }
        else if (evt.target.id == 'CancelInvitationButton') {
            let model = new Invite({ id: thisView.guild.get("invite_sent").id });
            model.destroy({
                success: function () {
                    thisView.render(thisView.guild.id);
                },
                error: function () {
                    thisView.render(thisView.guild.id);
                }
            });
        }
        else if (evt.target.id == 'JoinButton') {
            let invite = new Invite();

            invite.save({ user_id: window.currentUser.id, guild_id: thisView.guild.id }, {
                success: function () {
                    thisView.render(thisView.guild.id);
                },
                error: function () {
                    thisView.render(thisView.guild.id);
                }
            });
        }
        else if (evt.target.id == 'LeaveButton') {
            if (confirm("You are about to leave this guild. Are you sure ?")) {
                window.currentUser.leave(window.currentUser, thisView);
            }
            else
                $('#LeaveButton').one("click", { thisView: thisView }, thisView.mainButtonClick);
        }
    },

    createUserList: function () {
        let self = this;
        let filteredCollection = new Users(this.guild.get("users"));

        let membersListTemplate = _.template($('#mainGuildMembersListTemplate').html());
        let membersListRowTemplate = _.template('<div class="button Ownership" id="<%= username %>"><%= username %></div>')

        $('#PassOwnershipButton').append(membersListTemplate);
        filteredCollection.forEach(function (user, id) {
            if (user.id != window.currentUser.id) {
                $('#mainGuildMembersList').append(membersListRowTemplate(user.toJSON()));
                $('#mainGuildMembersList div:last-child').on('click', function () {
                    if (confirm("You are about to pass ownership to " + user.get('username') + ". Are you sure ?")) {
                        self.guild.save({ 'owner_id': user.id }, {
                            context: self,
                            success: function (model, resp, options) {
                                this.render(this.guild.id);
                            },
                            error: function (model, resp, options) {
                                this.render(this.guild.id);
                            },
                        });
                    }
                });
            }
        }, this);
        $('#mainGuildMembersList').css('display', 'none');
        $('#PassOwnershipButton').hover(
            function () {
                $('#mainGuildMembersList').css('display', 'block');
            },
            function () {
                $('#mainGuildMembersList').css('display', 'none');
            }
        );
    },

    addMainButton: function () {

        let joinButtonTemplate = _.template($('#mainGuildButtonTemplate').html());
        let buttonText;

        if (window.currentUser.has("guild_id")) {
            if (window.currentUser.get("guild_id") != this.guild.id)
                return;
            else if (window.currentUser.get("guild_id") == this.guild.id) {
                if (this.guild.get("owner_id") == window.currentUser.id) {
                    if (this.guild.get('active_members') == 1)
                        buttonText = "Destroy";
                    else
                        buttonText = "Pass Ownership";
                }
                else
                    buttonText = "Leave";
                let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                $('#guildNavbar').append(joinButtonTemplate(model.toJSON()));

                if (buttonText == "Pass Ownership") {
                    this.createUserList();
                }
                else
                    $('#' + buttonText.replace(' ', '') + 'Button').one("click", { thisView: this }, this.mainButtonClick);
            }
        }
        else {
            buttonText = (this.guild.get('invite_sent')) ? "Cancel Invitation" : "Join";
            let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
            $('#guildNavbar').append(joinButtonTemplate(model.toJSON()));
            $('#' + buttonText.replace(' ', '') + 'Button').one("click", { thisView: this }, this.mainButtonClick);
        }
    },

    render: function (guildId) {
        this.$el.empty();
        this.$el.attr({ id: 'guildPage' });
        this.guild.set({ id: guildId });
        let self = this;

        $.when(this.guild.fetch(), window.currentUser.fetch()).then(
            function success() {
                $('main#guildPage').prepend('<div id="guildNavbar"><a class="button Cancel" href="#guilds">Back</a></div>');
                self.addMainButton();
                if (window.currentUser.get('guild_id') == self.guild.id)
                    $('main#guildPage').append(self.invitesView.render(self).el);
                $('main#guildPage').append(self.figuresView.render(self).el);
                $('main#guildPage').append(self.membersView.render(self).el);
            },
            function error() {
                Backbone.history.navigate("guilds", { trigger: true });
            }
        );
        return this;
    }
});
