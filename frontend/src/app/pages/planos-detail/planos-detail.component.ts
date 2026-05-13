import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlanoService } from '../../services/plano.service';

@Component({
  selector: 'app-planos-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50/30">
      <div *ngIf="plano()" class="space-y-6">

        <div class="flex items-center justify-between mb-8">
          <div>
            <a routerLink="/app/planos" class="text-blue-600 text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
              ← Voltar para lista
            </a>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ plano().titulo }}</h1>
            <p class="text-gray-500">{{ plano().descricao || 'Sem descrição detalhada.' }}</p>
          </div>
          <button [routerLink]="['/app/planos/execucoes/nova']" [queryParams]="{ planoId: plano().id }"
                  class="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all">
            Nova Manutenção
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Equipamento</label>
            <p class="text-lg font-bold text-gray-800">{{ plano().equipamento?.nome }}</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Periodicidade</label>
            <p class="text-lg font-bold text-gray-800">{{ plano().periodicidade_dias }} dias</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Próxima Manutenção</label>
            <p class="text-lg font-bold text-blue-600">{{ plano().proxima_em | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>

        <!-- Checklist do Plano -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 class="font-bold text-gray-800">Itens do Checklist</h2>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li *ngFor="let item of plano().itens_checklist" class="flex items-center gap-3 text-sm text-gray-600">
                <div class="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">
                  {{ item.ordem }}
                </div>
                {{ item.descricao }}
              </li>
              <li *ngIf="!plano().itens_checklist?.length" class="text-gray-400 italic text-sm">
                Nenhum item configurado para este checklist.
              </li>
            </ul>
          </div>
        </div>

        <!-- Histórico de Execuções -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 class="font-bold text-gray-800">Histórico de Execuções</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div *ngFor="let exec of plano().execucoes"
                 class="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                 (click)="toggleExec(exec.id)">

              <!-- Linha principal -->
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-sm font-bold text-gray-700">{{ exec.data_execucao | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span [ngClass]="{
                      'bg-green-100 text-green-700': exec.status?.chave === 'realizada',
                      'bg-orange-100 text-orange-700': exec.status?.chave === 'parcial',
                      'bg-red-100 text-red-700': exec.status?.chave === 'nao_realizada'
                    }" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {{ exec.status?.descricao || exec.status?.chave }}
                    </span>
                    <!-- Badge conformidade geral -->
                    <span [ngClass]="exec.conformidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                          class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {{ exec.conformidade ? '✓ Conforme' : '✗ Não Conforme' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">Técnico: <b>{{ exec.tecnico?.nome }}</b></p>
                  <p *ngIf="exec.observacoes" class="text-sm text-gray-500 italic mt-1">"{{ exec.observacoes }}"</p>
                </div>

                <!-- Percentual conformidade checklist + seta -->
                <div class="flex items-center gap-3 ml-4">
                  <div *ngIf="exec.checklist_execucao?.length" class="text-right">
                    <p class="text-xs text-gray-400">Checklist</p>
                    <p class="text-sm font-bold"
                       [ngClass]="exec.percentual_conformidade === 100 ? 'text-green-600' : exec.percentual_conformidade >= 50 ? 'text-orange-500' : 'text-red-600'">
                      {{ exec.percentual_conformidade }}%
                    </p>
                  </div>
                  <svg *ngIf="exec.checklist_execucao?.length"
                       [ngClass]="expandedExec() === exec.id ? 'rotate-180' : ''"
                       class="w-4 h-4 text-gray-400 transition-transform"
                       xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              <!-- Checklist expandido -->
              <div *ngIf="expandedExec() === exec.id && exec.checklist_execucao?.length"
                   class="mt-4 border-t border-gray-100 pt-4 space-y-2">
                <div *ngFor="let item of exec.checklist_execucao"
                     class="flex items-start gap-3 text-sm">
                  <span [ngClass]="item.conforme ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        class="mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {{ item.conforme ? '✓' : '✗' }}
                  </span>
                  <div>
                    <p class="text-gray-700 font-medium">{{ item.item?.descricao }}</p>
                    <p *ngIf="item.observacao" class="text-gray-400 italic text-xs">{{ item.observacao }}</p>
                  </div>
                </div>
              </div>

            </div>
            <div *ngIf="!plano().execucoes?.length" class="p-10 text-center text-gray-400 italic">
              Nenhuma manutenção registrada para este plano ainda.
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PlanosDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private planoService = inject(PlanoService);

  plano = signal<any>(null);
  expandedExec = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.planoService.obterPorId(id).subscribe({
        next: (res) => this.plano.set(res),
        error: (err) => console.error('Erro ao buscar detalhes:', err)
      });
    }
  }

  toggleExec(id: number) {
    this.expandedExec.set(this.expandedExec() === id ? null : id);
  }
}
