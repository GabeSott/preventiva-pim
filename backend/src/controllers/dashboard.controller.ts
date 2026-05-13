import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private service: DashboardService) {}

  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getMetrics());
    } catch (err) { next(err); }
  };

  getAtrasadas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getAtrasadas());
    } catch (err) { next(err); }
  };

  getDisponibilidade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getDisponibilidade());
    } catch (err) { next(err); }
  };

  getEmDia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getEmDia());
    } catch (err) { next(err); }
  };

  getTopTecnicos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getTopTecnicos());
    } catch (err) { next(err); }
  };

  getTopEquipamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json(await this.service.getTopEquipamentos());
    } catch (err) { next(err); }
  };
}
