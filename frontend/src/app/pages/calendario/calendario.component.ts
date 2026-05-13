import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanoService } from '../../services/plano.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { PaginatorComponent } from '../../components/paginator/paginator.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginatorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Calendário de manutenções</h1>
          <p class="text-gray-500 font-medium">Cronograma de preventivas ordenado por data prevista.</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Equipamento</label>
          <select [(ngModel)]="filtroEquipamento" (change)="onFiltroEquipamentoChange()"
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm">
            <option [value]="null">Todos os equipamentos</option>
            <option *ngFor="let eq of equipamentos()" [value]="eq.id">{{ eq.nome }} ({{ eq.codigo }})</option>
          </select>
        </div>

        <div class="flex-1 min-w-[300px]">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Período / Status</label>
          <div class="flex flex-wrap gap-2">
            <button (click)="setFiltroStatus('todas')" 
                    [class]="statusAtivo() === 'todas' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'"
                    class="px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase">Todas</button>
            <button (click)="setFiltroStatus('atrasadas')" 
                    [class]="statusAtivo() === 'atrasadas' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-500'"
                    class="px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase">Atrasadas</button>
            <button (click)="setFiltroStatus('hoje')" 
                    [class]="statusAtivo() === 'hoje' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-500'"
                    class="px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase">Hoje</button>
            <button (click)="setFiltroStatus('semana')" 
                    [class]="statusAtivo() === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'"
                    class="px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase">Semana</button>
            <button (click)="setFiltroStatus('mes')" 
                    [class]="statusAtivo() === 'mes' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-500'"
                    class="px-3 py-2 rounded-xl text-[10px] font-bold transition-all uppercase">Mês</button>
          </div>
        </div>
      </div>

      <!-- Lista do Calendário -->
      <div class="space-y-4">
        <div *ngFor="let plano of planos()" 
             class="bg-white p-6 rounded-3xl shadow-sm border-l-8 flex items-center justify-between hover:shadow-md transition-all group"
             [ngClass]="getBadgeInfo(plano.proxima_em).border">
          
          <div class="flex items-center gap-6">
            <div class="text-center w-16">
              <p class="text-[10px] font-black uppercase text-gray-400">{{ plano.proxima_em | date:'MMM' }}</p>
              <p class="text-2xl font-black text-gray-800">{{ plano.proxima_em | date:'dd' }}</p>
            </div>

            <div class="h-10 w-[1px] bg-gray-100"></div>

            <div>
              <div class="flex items-center gap-2 mb-1">
                <span [ngClass]="getBadgeInfo(plano.proxima_em).bg" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                   {{ getBadgeInfo(plano.proxima_em).label }}
                </span>
                <span class="text-[10px] font-bold text-gray-400 uppercase">{{ plano.equipamento?.codigo }}</span>
              </div>
              <h3 class="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{{ plano.titulo }}</h3>
              <p class="text-xs text-gray-500">Responsável: <b>{{ plano.tecnico?.nome || 'Não definido' }}</b></p>
            </div>
          </div>

          <button [routerLink]="['/app/planos/execucoes/nova']" [queryParams]="{ planoId: plano.id }"
                  class="px-6 py-2.5 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all active:scale-95">
            Registrar OS
          </button>
        </div>

        <div *ngIf="planos().length === 0" class="p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
           <p class="text-gray-400 font-medium">Nenhuma manutenção agendada para este filtro.</p>
        </div>
      </div>

      <app-paginator [page]="page()" [totalPages]="totalPages()" [total]="total()" (pageChange)="onPageChange($event)" />

    </div>
  `
})
export class CalendarioComponent implements OnInit {
  private planoService = inject(PlanoService);
  private equipamentoService = inject(EquipamentoService);

  planos = signal<any[]>([]);
  equipamentos = signal<any[]>([]);
  
  filtroEquipamento: number | null = null;
  statusAtivo = signal<'todas' | 'atrasadas' | 'hoje' | 'semana' | 'mes'>('todas');

  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit(): void {
    this.carregar();
    this.equipamentoService.listar(1, 100).subscribe(res => this.equipamentos.set(res.data ?? []));
  }

  setFiltroStatus(status: 'todas' | 'atrasadas' | 'hoje' | 'semana' | 'mes') {
    this.statusAtivo.set(status);
    this.page.set(1);
    this.carregar();
  }

  onFiltroEquipamentoChange() {
    this.page.set(1);
    this.carregar();
  }

  carregar() {
    const filtros: any = {
      page: this.page(),
      limit: 10,
      equipamentoId: this.filtroEquipamento || undefined,
      status: this.statusAtivo() === 'atrasadas' ? 'atrasado' : undefined
    };

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    if (this.statusAtivo() === 'hoje') {
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23,59,59,999);
      filtros.inicio = hoje.toISOString();
      filtros.fim = fimHoje.toISOString();
    } else if (this.statusAtivo() === 'semana') {
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() + 7);
      fimSemana.setHours(23,59,59,999);
      filtros.inicio = hoje.toISOString();
      filtros.fim = fimSemana.toISOString();
    } else if (this.statusAtivo() === 'mes') {
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
      filtros.inicio = hoje.toISOString();
      filtros.fim = fimMes.toISOString();
    }

    this.planoService.listar(filtros).subscribe(res => {
      this.planos.set(res.data ?? []);
      this.totalPages.set(res.meta?.totalPages ?? 1);
      this.total.set(res.meta?.total ?? 0);
    });
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.carregar();
  }

  getBadgeInfo(data: string) {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const prevista = new Date(data);
    prevista.setHours(0,0,0,0);

    const diff = prevista.getTime() - hoje.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dias < 0) return { label: 'Atrasada', bg: 'bg-red-100 text-red-700', border: 'border-red-500', color: 'text-red-600' };
    if (dias === 0) return { label: 'Hoje', bg: 'bg-orange-100 text-orange-700', border: 'border-orange-500', color: 'text-orange-600' };
    if (dias <= 7) return { label: 'Próximos 7 dias', bg: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-500', color: 'text-yellow-600' };
    return { label: 'No prazo', bg: 'bg-green-100 text-green-700', border: 'border-green-500', color: 'text-green-600' };
  }
}
