module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('deliverymen', 'pickup_counter');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'pickup_counter', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },
};
