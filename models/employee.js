const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = function (sequelize, DataTypes) {
  const employee = sequelize.define(
    "employee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      position: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      hospital_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "hospitals",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: "phone must be unique",
        validate: {
          len: [4, 25],
        },
      },
      status: {
        type: Sequelize.ENUM,
        values: ["active", "inactive", "going", "maternity_leave"],
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: Sequelize.ENUM,
        values: ["driver", "doctor", "admin"],
        allowNull: false,
        defaultValue: "driver",
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: "email must be unique",
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Email буруу байна",
        ],
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      location: {
        type: DataTypes.TEXT,
      },
      latitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -180,
          max: 180,
        },
      },
    },
    {
      sequelize,
      tableName: "employees",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_employee_1",
          using: "BTREE",
          fields: [{ name: "hospital_id" }],
        },
      ],
          },
    //position
  );
  // Static method

  // Instance method

  employee.prototype.haversineDistanceBetweenPoints = function (
    lat1,
    lon1,
    lat2,
    lon2
  ) {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0; // Distance is zero for the same coordinates
    }
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const deltaLon = lon2 - lon1;
    const deltaLambda = (deltaLon * Math.PI) / 180;
    const d =
      Math.acos(
        Math.sin(p1) * Math.sin(p2) +
          Math.cos(p1) * Math.cos(p2) * Math.cos(deltaLambda)
      ) * R;
    return d;
  };

  employee.prototype.getJsonWebToken = function () {
    const token = jwt.sign(this.toJSON(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });
    return token;
  };

  employee.prototype.checkPassword = async function (enteredPassword) {
    return bcrypt.compareSync(enteredPassword, this.password);
  };
  return employee;
};
