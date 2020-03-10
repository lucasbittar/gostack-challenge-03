import Sequelize, { Model } from 'sequelize';

class OrderIssue extends Model {
  static init(sequelize) {
    super.init(
      {
        full_description: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
      },
      {
        sequelize,
        tableName: 'order_issues',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
    });
  }
}

export default OrderIssue;
