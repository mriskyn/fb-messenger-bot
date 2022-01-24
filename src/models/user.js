'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Message, { foreignKey: 'UserId' });
    }
  }
  User.init(
    {
      name: { type: DataTypes.STRING },
      fbId: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
