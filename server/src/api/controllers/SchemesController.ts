// server/src/api/controllers/SchemesController.ts
import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export class SchemesController {
  static async listPublic(_req: Request, res: Response) {
    try {
      const schemes = await prisma.scheme.findMany({ where: { active: true }, orderBy: { created_at: 'desc' } });
      return res.json({ schemes });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to load schemes' });
    }
  }
}

export class AdminSchemesController {
  static async create(req: Request, res: Response) {
    try {
      const { title, description, eligibility, link, start_date, end_date, active } = req.body || {};
      if (!title) return res.status(400).json({ error: 'title is required' });
      const created = await prisma.scheme.create({
        data: {
          title: String(title),
          description: description || null,
          eligibility: eligibility || null,
          link: link || null,
          start_date: start_date ? new Date(String(start_date)) : null,
          end_date: end_date ? new Date(String(end_date)) : null,
          active: active == null ? true : Boolean(active),
        }
      });
      return res.status(201).json({ scheme: created });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to create scheme' });
    }
  }

  static async list(_req: Request, res: Response) {
    try {
      const schemes = await prisma.scheme.findMany({ orderBy: { created_at: 'desc' } });
      return res.json({ schemes });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to load schemes' });
    }
  }
}
