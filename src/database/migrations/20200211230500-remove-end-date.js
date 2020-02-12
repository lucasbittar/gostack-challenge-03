module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('orders', 'end_date');
  },

  down: (queryInterface, Sequelize) => {},
};
