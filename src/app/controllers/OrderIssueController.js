import * as Yup from 'yup';

import Order from '../models/Order';
import OrderIssue from '../models/OrderIssue';

class OrderIssueController {
  async index(req, res) {
    const { page = 1, search } = req.query;
    const pageLimit = 10;

    const issuesParams = {
      limit: pageLimit,
      order: [['id', 'DESC']],
      offset: (page - 1) * pageLimit,
      attributes: ['id', 'full_description', 'order_id', 'canceled_at'],
    };

    const issues = await OrderIssue.findAndCountAll(issuesParams);
    return res.json(issues);
  }

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
      attributes: ['full_description', 'created_at'],
    });

    return res.json(issues);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      full_description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { order_id } = req.params;
    const { full_description } = req.body;

    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) {
      return res.status(400).json({ error: 'Invalid order_id' });
    }

    const orderIssue = await OrderIssue.create({ order_id, full_description });

    return res.json(orderIssue);
  }
}

export default new OrderIssueController();
