module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('orders', 'start_date');
  },

  down: (queryInterface, Sequelize) => {},
};
