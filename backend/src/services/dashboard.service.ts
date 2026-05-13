import { Repository, LessThan } from 'typeorm';
import { PlanoManutencao } from '../entities/PlanoManutencao';
import { ExecucaoManutencao } from '../entities/ExecucaoManutencao';
import { Equipamento } from '../entities/Equipamento';

export class DashboardService {
  constructor(
    private planoRepo: Repository<PlanoManutencao>,
    private execucaoRepo: Repository<ExecucaoManutencao>,
    private equipamentoRepo: Repository<Equipamento>
  ) {}

  async getMetrics() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const seteDiasDepois = new Date(hoje);
    seteDiasDepois.setDate(hoje.getDate() + 7);
    seteDiasDepois.setHours(23, 59, 59, 999);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1, 0, 0, 0, 0);

    // Execuções registradas no mês
    const execucoesMes = await this.execucaoRepo.createQueryBuilder('exec')
      .leftJoinAndSelect('exec.plano', 'plano')
      .where('exec.data_execucao >= :inicio AND exec.data_execucao < :fim', { inicio: inicioMes, fim: fimMes })
      .getMany();

    // Conformidade = realizadas no prazo / total esperadas no mês * 100
    // Realizadas no prazo: data_execucao <= data_prevista (comparando apenas datas sem hora)
    const realizadasNoPrazo = execucoesMes.filter(e => {
      if (!e.data_prevista) return false;
      const dExec = new Date(e.data_execucao);
      dExec.setHours(0,0,0,0);
      const dPrev = new Date(e.data_prevista);
      dPrev.setHours(0,0,0,0);
      return dExec <= dPrev;
    }).length;

    // Total esperadas: planos com data_prevista no mês (via execuções) +
    // planos ativos com proxima_em no mês ainda sem execução
    const planosExecutadosNoMes = new Set(execucoesMes.map(e => e.plano?.id).filter(id => !!id));

    const planosEsperadosSemExecucao = await this.planoRepo.createQueryBuilder('plano')
      .where('plano.ativo = :ativo', { ativo: true })
      .andWhere('plano.proxima_em >= :inicio AND plano.proxima_em < :fim', { inicio: inicioMes, fim: fimMes })
      .getMany();

    const totalEsperadas = execucoesMes.length +
      planosEsperadosSemExecucao.filter(p => !planosExecutadosNoMes.has(p.id)).length;

    const conformidadeMensal = totalEsperadas > 0
      ? Math.round((realizadasNoPrazo / totalEsperadas) * 100)
      : 100;

    const [atrasadasCount, previstas7DiasCount] = await Promise.all([
      this.planoRepo.count({ where: { ativo: true, proxima_em: LessThan(hoje) } }),
      this.planoRepo.createQueryBuilder('plano')
        .where('plano.ativo = :ativo', { ativo: true })
        .andWhere('plano.proxima_em >= :hoje AND plano.proxima_em <= :seteDias', { hoje, seteDias: seteDiasDepois })
        .getCount(),
    ]);

    return {
      atrasadas: atrasadasCount,
      previstas7Dias: previstas7DiasCount,
      execucoesNoMes: execucoesMes.length,
      conformidadeMensal,
    };
  }

  async getAtrasadas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atrasadas = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(hoje) },
      relations: ['equipamento']
    });

    const agora = new Date();
    return atrasadas.map(plano => ({
      id: plano.id,
      titulo: plano.titulo,
      equipamento: {
        id: plano.equipamento.id,
        nome: plano.equipamento.nome,
        codigo: plano.equipamento.codigo
      },
      proxima_em: plano.proxima_em,
      dias_atraso: Math.ceil((agora.getTime() - plano.proxima_em!.getTime()) / 86400000)
    }));
  }

  async getEmDia() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const emDia = await this.planoRepo.createQueryBuilder('plano')
      .leftJoinAndSelect('plano.equipamento', 'equipamento')
      .where('plano.ativo = :ativo', { ativo: true })
      .andWhere('plano.proxima_em >= :hoje', { hoje })
      .getMany();

    return emDia.map(plano => ({
      id: plano.id,
      titulo: plano.titulo,
      equipamento: {
        id: plano.equipamento.id,
        nome: plano.equipamento.nome,
        codigo: plano.equipamento.codigo
      },
      proxima_em: plano.proxima_em
    }));
  }

  async getDisponibilidade() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const total = await this.equipamentoRepo.count();
    const ativos = await this.equipamentoRepo.count({ where: { ativo: true } });

    const planosAtrasados = await this.planoRepo.find({
      where: { ativo: true, proxima_em: LessThan(hoje) },
      relations: ['equipamento']
    });

    const idsComAtraso = new Set(planosAtrasados.map(p => p.equipamento.id));
    const disponiveis = total - idsComAtraso.size;

    return {
      totalEquipamentos: total,
      equipamentosAtivos: ativos,
      equipamentosComAtraso: idsComAtraso.size,
      equipamentosDisponiveis: disponiveis,
      percentualDisponibilidade: total > 0 ? Math.round((disponiveis / total) * 100) : 0
    };
  }

  async getTopTecnicos() {
    return this.execucaoRepo.createQueryBuilder('exec')
      .innerJoin('exec.tecnico', 'tecnico')
      .select('tecnico.nome', 'nome')
      .addSelect('COUNT(exec.id)', 'total')
      .groupBy('tecnico.id')
      .addGroupBy('tecnico.nome')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getTopEquipamentos() {
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    return this.execucaoRepo.createQueryBuilder('exec')
      .innerJoin('exec.plano', 'plano')
      .innerJoin('plano.equipamento', 'equipamento')
      .select('equipamento.nome', 'nome')
      .addSelect('equipamento.codigo', 'codigo')
      .addSelect('COUNT(exec.id)', 'total')
      .where('exec.data_execucao >= :umAnoAtras', { umAnoAtras })
      .groupBy('equipamento.id')
      .addGroupBy('equipamento.nome')
      .addGroupBy('equipamento.codigo')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
