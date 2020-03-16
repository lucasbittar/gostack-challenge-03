import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  /*
   * Create session
   * All fields are required
   */
  async store(req, res) {
    const { mobile } = req.query;

    if (mobile === undefined) {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation failed' });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const checkPass = await user.checkPassword(password);
      if (!checkPass) {
        return res.status(401).json({ error: 'Wrong password' });
      }

      const { id, name } = user;

      return res.json({
        user: {
          id,
          name,
          email,
        },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });
    }

    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation failed. Make sure you typed in your ID correctly.',
      });
    }

    const { deliveryman_id } = req.body;

    const deliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const { id, name, email, avatar, created_at } = deliveryman;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        created_at,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
