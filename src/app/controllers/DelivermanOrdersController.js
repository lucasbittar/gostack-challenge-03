import Order from '../models/Order';

class DeliverymanOrdersController {
  async index(req, res) {
    const { deliveryman_id } = req.params;
    const orders = await Order.findAll({
      where: {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
      },
    });
    return res.json(orders);
  }
}

export default new DeliverymanOrdersController();
