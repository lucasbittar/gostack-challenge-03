import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

class DeliverymanOrdersController {
  async index(req, res) {
    const { deliveryman_id } = req.params;

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        id: deliveryman_id,
      },
    });

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman_id' });
    }

    const orders = await Order.findAll({
      where: {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
      },
    });
    return res.json(orders);
  }

  async update(req, res) {
    /*
     * Quick check for signature when closing an order
     */
    let missingSignatureError = '';
    const handleSignatureVerification = (end_date, field) => {
      if (end_date) {
        missingSignatureError = 'Signature is required on closing orders';
        return field.required();
      }
      return field();
    };

    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', handleSignatureVerification),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error:
          missingSignatureError !== ''
            ? missingSignatureError
            : 'Validation failed',
      });
    }

    const { deliveryman_id, order_id } = req.params;

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        id: deliveryman_id,
      },
    });

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman_id' });
    }

    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) {
      return res.status(400).json({ error: 'Invalid order_id' });
    }

    await order.update(req.body);

    return res.json(order);
  }
}

export default new DeliverymanOrdersController();
