import OrderIssue from '../models/OrderIssue';
import Order from '../models/Order';

class IssueController {
  async delete(req, res) {
    const { id } = req.params;
    const issue = await OrderIssue.findByPk(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const { order_id } = issue;

    const order = await Order.findByPk(order_id);

    await order.update({ canceled_at: new Date() });

    return res.json({
      message: `Order with ID ${order_id} was successfully canceled`,
    });
  }
}

export default new IssueController();
