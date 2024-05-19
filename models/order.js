const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const order = sequelize.define(
    "order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM,
        values: ["going", "new", "completed", "canceled"],
        defaultValue: "new",
      },
      priority: {
        type: Sequelize.ENUM,
        values: ["critical", "high", "medium", "low"],
      },
      customer_latitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -90,
          max: 90,
        },
      },
      customer_longitude: {
        type: DataTypes.DOUBLE,
        validate: {
          min: -180,
          max: 180,
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      location: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      freezeTableName: true,
      tableName: "orders",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_order_1",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "FK_order_2",
          using: "BTREE",
          fields: [{ name: "driver_id" }],
        },
        {
          name: "FK_order_3",
          using: "BTREE",
          fields: [{ name: "doctor_id" }],
        },
      ],
    }
  );

  order.addScope("filter_by_status", (status) => {
    const whereClause = status ? { status } : {};
    console.log(whereClause);
    return {
      where: whereClause,
    };
  });

  return order;
};
