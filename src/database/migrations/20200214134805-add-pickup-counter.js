module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'pickup_counter', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverymen', 'pickup_counter');
  },
};
