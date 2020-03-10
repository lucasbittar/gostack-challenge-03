module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('order_issues', 'full_description', {
      type: Sequelize.TEXT('long'),
      maxLength: 2000,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('order_issues', 'full_description');
  },
};
