const { Model } = require("sequelize");
const { sequelize } = require("../utils/db");
const { DataTypes } = require("sequelize");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedinToken: {
      type: DataTypes.STRING(510),
      allowNull: true,
    },
    githubToken: {
      type: DataTypes.STRING(510),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "user",
    underscored: true,
    timestamps: false,
  }
);

module.exports = User;
