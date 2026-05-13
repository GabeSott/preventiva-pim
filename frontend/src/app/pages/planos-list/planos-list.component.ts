import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PlanoService } from '../../services/plano.service';
import { AuthService } from '../../services/auth.service';
import { PaginatorComponent } from '../../components/paginator/paginator.component';

@Component({
  selector: 'app-planos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatorComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
            Planos de manutenção 
            <span *ngIf="nomeEquipamento()" class="text-blue-600"> - {{ nomeEquipamento() }}</span>
          </h1>
          <p class="text-gray-500">Gerencie as rotinas preventivas do PIM em tempo real.</p>
        </div>
        <div class="flex gap-3">
          <button *ngIf="idEquipamento()" routerLink="/app/equipamentos" 
                  class="px-5 py-3 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all">
            Voltar
          </button>
          <button *ngIf="podeCriar()" routerLink="/app/planos/novo" 
                  [style.background-color]="'#02464a'"
                  class="flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#02464a]/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo plano
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">
        <button (click)="setFiltro('todos')" 
                [class]="filtroAtual() === 'todos' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border-gray-200'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm">
          Todos ({{ total() }})
        </button>
        <button (click)="setFiltro('atrasados')" 
                [class]="filtroAtual() === 'atrasados' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-100'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm">
          ⚠️ Atrasados
        </button>
        <button (click)="setFiltro('criticos')" 
                [class]="filtroAtual() === 'criticos' ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border-orange-100'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm">
          ⏳ Críticos
        </button>
        <button (click)="setFiltro('em_dia')" 
                [class]="filtroAtual() === 'em_dia' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-green-100'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm">
          ✅ Em dia
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let plano of planos()" 
             class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-8 flex flex-col justify-between hover:shadow-xl transition-all group"
             [ngClass]="calcularStatus(plano.proxima_em).border">
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase">
                {{ plano.equipamento?.codigo || 'EQ' }}
              </span>
              <span [ngClass]="calcularStatus(plano.proxima_em).cor" 
                    class="px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1">
                {{ calcularStatus(plano.proxima_em).icon }} {{ calcularStatus(plano.proxima_em).label }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{{ plano.titulo }}</h3>
            <div class="mb-4 min-h-[50px]">
              <div *ngIf="plano.descricao" class="bg-gray-50 border-l-4 border-gray-300 p-2 rounded-r-lg">
                <p class="text-xs text-gray-700 italic line-clamp-2">"{{ plano.descricao }}"</p>
              </div>
            </div>
            <div class="space-y-3 mb-6 text-sm">
              <p class="flex items-center gap-2"><span class="text-gray-400">📅</span> Próxima: <b>{{ plano.proxima_em | date:'dd/MM/yyyy' }}</b></p>
              <p class="flex items-center gap-2"><span class="text-gray-400">👤</span> Técnico: <b>{{ plano.tecnico?.nome || 'Não atribuído' }}</b></p>
            </div>
          </div>
          <div class="flex gap-2">
            <button [routerLink]="['/app/planos', plano.id]" 
                    class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
              Histórico
            </button>
            <button *ngIf="podeCriar()" [routerLink]="['/app/planos/editar', plano.id]"
                    class="py-3 px-4 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-all">
              Editar
            </button>
            <button [routerLink]="['/app/planos/execucoes/nova']" [queryParams]="{ planoId: plano.id }"

                    class="flex-[2] py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
              Executar
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="planos().length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <h3 class="text-lg font-medium text-gray-400">Nenhum plano encontrado.</h3>
      </div>

      <app-paginator [page]="page()" [totalPages]="totalPages()" [total]="total()" (pageChange)="onPageChange($event)" />
    </div>
  `
})
export class PlanosListComponent implements OnInit {
  private planoService = inject(PlanoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  planos = signal<any[]>([]);
  filtroAtual = signal<'todos' | 'atrasados' | 'criticos' | 'em_dia'>('todos');
  idEquipamento = signal<number | null>(null);
  nomeEquipamento = signal<string | null>(null);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  podeCriar() {
    const chave = this.authService.usuario()?.perfil?.chave;
    return ['admin', 'gestor', 'supervisor'].includes(chave);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idEquipamento.set(params['equipamentoId'] ? Number(params['equipamentoId']) : null);
      this.page.set(1);
      this.carregar();
    });
  }

  setFiltro(f: 'todos' | 'atrasados' | 'criticos' | 'em_dia') {
    this.filtroAtual.set(f);
    this.page.set(1);
    this.carregar();
  }

  carregar() {
    const filtros: any = { page: this.page(), limit: 9 };
    if (this.idEquipamento()) filtros.equipamentoId = this.idEquipamento();
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (this.filtroAtual() === 'atrasados') {
      filtros.status = 'atrasado';
    } else if (this.filtroAtual() === 'criticos') {
      const fimCritico = new Date(hoje);
      fimCritico.setDate(hoje.getDate() + 7);
      fimCritico.setHours(23, 59, 59, 999);
      filtros.inicio = hoje.toISOString();
      filtros.fim = fimCritico.toISOString();
    } else if (this.filtroAtual() === 'em_dia') {
      const inicioEmDia = new Date(hoje);
      inicioEmDia.setDate(hoje.getDate() + 8);
      filtros.inicio = inicioEmDia.toISOString();
    }

    this.planoService.listar(filtros).subscribe({
      next: (res) => {
        this.planos.set(res.data ?? []);
        this.totalPages.set(res.meta?.totalPages ?? 1);
        this.total.set(res.meta?.total ?? 0);
        if (this.idEquipamento() && res.data?.length > 0) {
          this.nomeEquipamento.set(res.data[0].equipamento?.nome);
        }
      },
      error: (err) => console.error('Erro ao listar:', err)
    });
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.carregar();
  }

  calcularStatus(dataProxima: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((new Date(dataProxima).getTime() - hoje.getTime()) / 86400000);
    if (diff < 0) return { label: 'ATRASADO', cor: 'text-red-700 bg-red-50 border-red-200', border: 'border-red-500', icon: '⚠️' };
    if (diff <= 7) return { label: 'CRÍTICO', cor: 'text-orange-700 bg-orange-50 border-orange-200', border: 'border-orange-500', icon: '⏳' };
    return { label: 'EM DIA', cor: 'text-green-700 bg-green-50 border-green-200', border: 'border-green-500', icon: '✅' };
  }
}
