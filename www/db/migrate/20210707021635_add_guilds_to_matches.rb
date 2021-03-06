class AddGuildsToMatches < ActiveRecord::Migration[6.1]
  def change
    add_reference :matches, :left_guild, foreign_key: {to_table: :guilds, on_delete: :nullify}
    add_reference :matches, :right_guild, foreign_key: {to_table: :guilds, on_delete: :nullify}
  end
end
