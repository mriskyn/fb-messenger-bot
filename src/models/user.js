'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Message);
    }
  }
  User.init(
    {
      name: { type: DataTypes.STRING },
      fbId: { type: DataTypes.STRING },
      birth_date: { type: DataTypes.DATEONLY },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
