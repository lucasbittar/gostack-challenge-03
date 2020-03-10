module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('order_issues', 'canceled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('order_issues', 'canceled_at');
  },
};
