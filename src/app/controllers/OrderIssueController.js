import * as Yup from 'yup';

import Order from '../models/Order';
import OrderIssue from '../models/OrderIssue';

class OrderIssueController {
  async show(req, res) {
    const { order_id } = req.params;

    const orderExists = await Order.findOne({
      where: {
        id: order_id,
      },
    });

    if (!orderExists) {
      return res.status(400).json({ error: 'Invalid order_id' });
    }

    const issues = await OrderIssue.findAll({
      where: {
        order_id,
      },
      attributes: ['description', 'created_at'],
    });

    return res.json(issues);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { order_id } = req.params;
    const { description } = req.body;

    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) {
      return res.status(400).json({ error: 'Invalid order_id' });
    }

    const orderIssue = await OrderIssue.create({ order_id, description });

    return res.json(orderIssue);
  }
}

export default new OrderIssueController();
