import OrderIssue from '../models/OrderIssue';

class IssueController {
  async delete(req, res) {
    const { id } = req.params;
    const issue = await OrderIssue.findByPk(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await issue.destroy();

    return res.json({
      message: `Issue with ID ${id} was sucessfully removed`,
    });
  }
}

export default new IssueController();
