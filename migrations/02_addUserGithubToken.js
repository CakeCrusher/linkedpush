const { DataTypes } = require("sequelize");

// add a new column to the users table
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn("users", "github_token", {
      type: DataTypes.STRING(510),
      allowNull: true,
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn("users", "github_token");
  },
};
