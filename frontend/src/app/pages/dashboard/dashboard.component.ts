import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="mb-10">
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p class="text-gray-500 font-medium">Indicadores de Manutenção Preventiva em tempo real.</p>
      </div>

      <!-- Supervisor: só atrasadas + conformidade -->
      <ng-container *ngIf="isSupervisor(); else fullMetrics">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2 border-red-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-red-100 text-red-600 rounded-2xl">⚠️</div>
              <span class="text-xs font-bold text-gray-400 uppercase">Planos Atrasados</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.atrasadas || 0 }}</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2" [ngClass]="getConformidadeStatus().border">
            <div class="flex items-center gap-4 mb-4">
              <div [ngClass]="getConformidadeStatus().bg + ' ' + getConformidadeStatus().text" class="p-3 rounded-2xl">
                {{ getConformidadeStatus().icon }}
              </div>
              <span class="text-xs font-bold text-gray-400 uppercase">Conformidade do Mês</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.conformidadeMensal || 0 }}%</p>
          </div>
        </div>
      </ng-container>

      <!-- Admin/Gestor/Técnico: todos os cards -->
      <ng-template #fullMetrics>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2 border-red-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-red-100 text-red-600 rounded-2xl">⚠️</div>
              <span class="text-xs font-bold text-gray-400 uppercase">Planos Atrasados</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.atrasadas || 0 }}</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2 border-orange-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-orange-100 text-orange-600 rounded-2xl">⏳</div>
              <span class="text-xs font-bold text-gray-400 uppercase">Próximos 7 dias</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.previstas7Dias || 0 }}</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2" [ngClass]="getConformidadeStatus().border">
            <div class="flex items-center gap-4 mb-4">
              <div [ngClass]="getConformidadeStatus().bg + ' ' + getConformidadeStatus().text" class="p-3 rounded-2xl">
                {{ getConformidadeStatus().icon }}
              </div>
              <span class="text-xs font-bold text-gray-400 uppercase">Conformidade</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.conformidadeMensal || 0 }}%</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-blue-100 text-blue-600 rounded-2xl">📊</div>
              <span class="text-xs font-bold text-gray-400 uppercase">Execuções/Mês</span>
            </div>
            <p class="text-3xl font-black text-gray-900">{{ metricas()?.execucoesNoMes || 0 }}</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-3xl shadow-lg border-2 border-blue-600">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-blue-500 text-white rounded-2xl text-xs font-bold">OEE</div>
              <span class="text-xs font-bold text-blue-400 uppercase">Disponibilidade</span>
            </div>
            <p class="text-3xl font-black text-white">{{ disponibilidade()?.percentualDisponibilidade || 0 }}%</p>
            <p class="text-[10px] text-blue-300 font-bold mt-2">{{ disponibilidade()?.equipamentosDisponiveis }} de {{ disponibilidade()?.totalEquipamentos }} operando</p>
          </div>
        </div>
      </ng-template>

      <!-- Top 5 Equipment and Technicians -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <!-- Top 5 Equipment (Now First) -->
        <div class="bg-white rounded-3xl shadow-sm border-2 border-green-200 overflow-hidden">
          <div class="p-5 border-b border-green-200 bg-green-50/50 flex items-center justify-between">
            <h2 class="font-black text-gray-800 uppercase tracking-wider text-xs">Top 5: Equipamentos (Ano)</h2>
            <span class="px-2 py-0.5 bg-green-200 text-green-700 rounded-full text-[9px] font-black uppercase">Volume</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div *ngFor="let eq of topEquipamentos(); let i = index" class="px-5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors h-[54px]">
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-lg text-[10px] font-black text-gray-500">{{ i + 1 }}º</span>
                <div>
                  <p class="font-bold text-gray-700 leading-tight text-sm">{{ eq.nome }}</p>
                  <p class="text-[9px] text-gray-400 font-bold uppercase">{{ eq.codigo }}</p>
                </div>
              </div>
              <span class="text-xs font-black text-green-600">{{ eq.total }} manutenções</span>
            </div>
            <div *ngIf="topEquipamentos().length === 0" class="p-8 text-center text-gray-400 italic text-xs">
              Nenhuma manutenção no período.
            </div>
          </div>
        </div>

        <!-- Top 5 Technicians (Now Second) -->
        <div class="bg-white rounded-3xl shadow-sm border-2 border-blue-200 overflow-hidden">
          <div class="p-5 border-b border-blue-200 bg-blue-50/50 flex items-center justify-between">
            <h2 class="font-black text-gray-800 uppercase tracking-wider text-xs">Top 5: Técnicos</h2>
            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase">Produtividade</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div *ngFor="let tec of topTecnicos(); let i = index" class="px-5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors h-[54px]">
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-lg text-[10px] font-black text-gray-500">{{ i + 1 }}º</span>
                <div>
                  <p class="font-bold text-gray-700 leading-tight text-sm">{{ tec.nome }}</p>
                  <p class="text-[9px] text-gray-400 font-bold uppercase">Colaborador</p>
                </div>
              </div>
              <span class="text-xs font-black text-blue-600">{{ tec.total }} manutenções</span>
            </div>
            <div *ngIf="topTecnicos().length === 0" class="p-8 text-center text-gray-400 italic text-xs">
              Nenhuma manutenção registrada.
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Atrasadas (todos veem) -->
      <div class="bg-white rounded-3xl shadow-sm border-2 border-red-200 overflow-hidden">
        <div class="p-6 border-b border-red-200 bg-red-50/50 flex items-center justify-between">
          <h2 class="font-black text-gray-800 uppercase tracking-wider text-xs">Manutenções em Atraso</h2>
          <span class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase">Ação Imediata</span>
        </div>
        <div class="divide-y divide-gray-50">
          <div *ngFor="let item of atrasadas()" class="py-3 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all text-xs">
                {{ item.equipamento?.codigo?.substring(0, 4) || 'EQ' }}
              </div>
              <div>
                <h3 class="font-bold text-gray-800">{{ item.titulo }}</h3>
                <p class="text-xs text-gray-400 font-medium">{{ item.equipamento?.nome }}</p>
              </div>
            </div>
            <div class="flex items-center gap-8">
              <div class="text-right">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Data Prevista</p>
                <p class="text-sm font-black text-gray-700">{{ item.proxima_em | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="text-right w-24">
                <p class="text-[10px] font-bold text-red-400 uppercase mb-1">Atraso</p>
                <p class="text-sm font-black text-red-600">{{ item.dias_atraso }} dias</p>
              </div>
              <button [routerLink]="['/app/planos/execucoes/nova']" [queryParams]="{ planoId: item.id }"
                      class="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all active:scale-95">
                Resolver
              </button>
            </div>
          </div>
          <div *ngIf="atrasadas().length === 0" class="p-20 text-center text-gray-400 italic">
            Parabéns! Não existem manutenções em atraso no momento.
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  metricas = signal<any>(null);
  atrasadas = signal<any[]>([]);
  disponibilidade = signal<any>(null);
  topTecnicos = signal<any[]>([]);
  topEquipamentos = signal<any[]>([]);

  getConformidadeStatus() {
    const valor = this.metricas()?.conformidadeMensal || 0;
    if (valor <= 24) return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300', icon: '🟣' };
    if (valor <= 49) return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300', icon: '🔴' };
    if (valor <= 74) return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300', icon: '🟠' };
    return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300', icon: '✅' };
  }

  isSupervisor() {
    return this.authService.usuario()?.perfil?.chave === 'supervisor';
  }

  isTecnico() {
    return this.authService.usuario()?.perfil?.chave === 'tecnico';
  }

  ngOnInit(): void {
    if (this.isTecnico()) {
      this.router.navigate(['/app/calendario']);
      return;
    }
    this.service.getMetricas().subscribe(res => this.metricas.set(res));
    this.service.getAtrasadas().subscribe(res => this.atrasadas.set(res));
    this.service.getTopTecnicos().subscribe(res => this.topTecnicos.set(res));
    this.service.getTopEquipamentos().subscribe(res => this.topEquipamentos.set(res));
    if (!this.isSupervisor()) {
      this.service.getDisponibilidade().subscribe(res => this.disponibilidade.set(res));
    }
  }
}
