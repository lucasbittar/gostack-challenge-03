import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  /*
   * Create a single recipient
   * All fields are required except "address_2"
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      number: Yup.number().required(),
      address_2: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const recipient = await Recipient.create(req.body);
    const {
      id,
      name,
      address,
      number,
      address_2,
      city,
      state,
      zip_code,
    } = recipient;
    return res.json({
      id,
      name,
      address,
      number,
      address_2,
      city,
      state,
      zip_code,
    });
  }

  /*
   * Update a single recipient by ID
   * All fields are required except "address_2
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      number: Yup.number().required(),
      address_2: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    try {
      const updatedRecipient = await recipient.update(req.body);
      return res.json(updatedRecipient);
    } catch (err) {
      return res.status(400).json({ error: `Something went wrong - ${err}` });
    }
  }

  /*
   * Fetch all recipients from DB
   */
  async index(req, res) {
    return res.json(await Recipient.findAll());
  }
}

export default new RecipientController();
