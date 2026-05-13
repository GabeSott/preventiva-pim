import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { autorizar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';
import { PerfilChave } from '../constants/perfil';

const router = Router();

const service = new DashboardService(
  AppDataSource.getRepository(PlanoManutencao),
  AppDataSource.getRepository(ExecucaoManutencao),
  AppDataSource.getRepository(Equipamento)
);
const controller = new DashboardController(service);

router.get('/metricas', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getMetrics);
router.get('/atrasadas', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getAtrasadas);
router.get('/disponibilidade', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getDisponibilidade);
router.get('/em-dia', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getEmDia);
router.get('/top-tecnicos', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getTopTecnicos);
router.get('/top-equipamentos', autorizar(PerfilChave.ADMIN, PerfilChave.SUPERVISOR, PerfilChave.GESTOR), controller.getTopEquipamentos);

export default router;
