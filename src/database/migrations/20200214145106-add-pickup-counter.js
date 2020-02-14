module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'num_pickup', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverymen', 'num_pickup');
  },
};
