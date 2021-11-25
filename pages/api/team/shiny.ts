import type { NextApiRequest, NextApiResponse } from 'next';
import '../../../db/Connection';
import Pokemon from '../../../db/Pokemon';
import { authenticateToken } from '../../../utility/authentication';

type Data = {
  token?: string
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req.headers['x-auth']) {
    res.status(403).json({ message: 'Token not found in headers.' });
    return;
  }
  const token = req.headers['x-auth'] as string;
  const user = await authenticateToken(token);
  if (!user) {
    res.status(403).json({ message: 'Unable to verify' });
    return;
  }
  if (req.method === 'POST') {
    if (!req.body.name) {
      res.status(403).json({ message: 'Shiny hunt name required.' });
      return;
    }
    const team = user.getCurrentTeam();
    let name = req.body.name;
    if (!team.settings.shinyCount || !team.settings.shinyCount.count) {
      team.settings.shinyCount = {
        name,
        count: {},
      };
    }
    if (team.settings.shinyCount.deleted && team.settings.shinyCount.deleted.indexOf(name) !== -1) {
      team.settings.shinyCount.deleted = team.settings.shinyCount.deleted.filter((deleted) => deleted !== name);
    } else {
      team.settings.shinyCount.count[name] = 0;
    }
    user.markModified('teams');
    await user.save();
    res.status(200).json({ message: 'Created new shiny hunt successfully.' });
  } else if (req.method === 'DELETE') {
    if (!req.body.name) {
      res.status(403).json({ message: 'Shiny hunt name required.' });
      return;
    }
    const team = user.getCurrentTeam();
    const name = req.body.name;

    if (!team.settings.shinyCount || team.settings.shinyCount.count[name] == null) {
      res.status(403).json({ message: 'Shiny hunt does not exist with name!' });
      return;
    }
    if (!team.settings.shinyCount.deleted) {
      team.settings.shinyCount.deleted = [];
    }
    team.settings.shinyCount.deleted.push(name);
    user.markModified('teams');
    await user.save();
    res.status(200).json({ message: 'Deleted shiny hunt successfully.' });
  } else if (req.method === 'PUT') {
    if (!req.body.change || !req.body.name) {
      res.status(403).json({ message: 'Shiny hunt Name and change amount required.' });
      return;
    }
    const change = Number.parseInt(req.body.change);
    const team = user.getCurrentTeam();
    const name = req.body.name;
    if (!team.settings.shinyCount || team.settings.shinyCount.count[name] == null) {
      res.status(403).json({ message: 'Shiny hunt does not exist!' });
      return;
    }
    team.settings.shinyCount.count[name] += change;
    console.log(team.settings.shinyCount)
    user.markModified('teams');
    await user.save();
    res.status(200).json({ message: 'Updated shiny hunt count successfully.', data: { newCount: team.settings.shinyCount.count[name] } });
  } else {
    res.status(403).json({ message: 'Invalid method.' })
  }
}
