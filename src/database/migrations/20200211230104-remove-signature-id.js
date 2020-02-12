module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('orders', 'signature_id');
  },

  down: (queryInterface, Sequelize) => {},
};
