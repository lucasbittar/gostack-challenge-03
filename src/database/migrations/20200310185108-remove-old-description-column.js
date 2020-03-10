module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('order_issues', 'description');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('order_issues', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
