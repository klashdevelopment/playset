import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method === 'GET') {
      try {
        const response = await fetch('https://api.setlist.fm/rest/1.0/setlist/'+req.query.id, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-api-key': process.env.SETLISTFM_API_KEY as string
          }
        });
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  