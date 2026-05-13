import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PlanoService } from '../../services/plano.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-planos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-emerald-50 text-[#02464a] rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ idEdicao ? 'Editar plano de manutenção' : 'Novo plano de manutenção' }}
          </h1>
          <p class="text-gray-500">Vincule uma rotina preventiva a um equipamento do PIM.</p>
        </div>
      </div>

      <form [formGroup]="planoForm" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div class="grid grid-cols-1 gap-6">

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Equipamento</label>
            <select formControlName="equipamentoId" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o equipamento...</option>
              <option *ngFor="let eq of equipamentos()" [value]="eq.id">{{ eq.nome }} ({{ eq.codigo }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Título do Plano</label>
            <input type="text" formControlName="titulo" placeholder="Ex: Manutenção Preventiva de Motores" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Periodicidade</label>
              <select formControlName="periodicidadeDias" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 appearance-none">
                <option [value]="7">Semanal (7 dias)</option>
                <option [value]="15">Quinzenal (15 dias)</option>
                <option [value]="30">Mensal (30 dias)</option>
                <option [value]="60">Bimestral (60 dias)</option>
                <option [value]="90">Trimestral (90 dias)</option>
                <option [value]="180">Semestral (180 dias)</option>
                <option [value]="365">Anual (365 dias)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ idEdicao ? 'Próxima Execução' : 'Data da 1ª Execução' }}
              </label>
              <input type="date" formControlName="dataProximaManutencao" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Técnico Responsável</label>
            <select formControlName="tecnicoId" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o técnico...</option>
              <option *ngFor="let user of usuarios()" [value]="user.id">{{ user.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea formControlName="descricao" placeholder="Detalhes do plano..."
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 h-32"></textarea>
          </div>

          <div *ngIf="!idEdicao" class="border-t border-gray-100 pt-6">
            <div class="flex items-center justify-between mb-4">
              <label class="block text-sm font-bold text-gray-700">Checklist de Verificação</label>
              <button type="button" (click)="adicionarItemChecklist()" 
                      class="text-xs font-bold text-[#02464a] hover:text-[#013538] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Item
              </button>
            </div>
            <div class="space-y-3">
              <div *ngFor="let item of checklist(); let i = index" class="flex gap-2">
                <input type="text" [(ngModel)]="item.descricao" [ngModelOptions]="{standalone: true}"
                       placeholder="Ex: Verificar nível de óleo"
                       class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm">
                <button type="button" (click)="removerItemChecklist(i)" class="p-2 text-red-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div *ngIf="checklist().length === 0" class="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
                Nenhum item adicionado ao checklist.
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/planos" 
                    class="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="planoForm.invalid" 
                    class="px-8 py-2.5 bg-gradient-to-r from-[#02464a] to-[#013538] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-emerald-100">
              {{ idEdicao ? 'Salvar alterações' : 'Salvar plano' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class PlanosFormComponent implements OnInit {
  private planoService = inject(PlanoService);
  private equipamentoService = inject(EquipamentoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  planoForm: FormGroup;
  equipamentos = signal<any[]>([]);
  usuarios = signal<any[]>([]);
  checklist = signal<{ descricao: string }[]>([]);
  idEdicao: number | null = null;

  constructor() {
    this.planoForm = this.fb.group({
      equipamentoId: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      periodicidadeDias: [30, Validators.required],
      dataProximaManutencao: ['', Validators.required],
      tecnicoId: [''],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    this.carregarEquipamentos();
    this.carregarUsuarios();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.idEdicao = Number(id);
      this.planoService.obterPorId(this.idEdicao).subscribe(res => {
        const proxima = res.proxima_em ? new Date(res.proxima_em).toISOString().split('T')[0] : '';
        this.planoForm.patchValue({
          equipamentoId: res.equipamento?.id ?? '',
          titulo: res.titulo,
          periodicidadeDias: res.periodicidade_dias,
          dataProximaManutencao: proxima,
          tecnicoId: res.tecnico?.id ?? '',
          descricao: res.descricao ?? ''
        });
      });
    }
  }

  adicionarItemChecklist() {
    this.checklist.update(list => [...list, { descricao: '' }]);
  }

  removerItemChecklist(index: number) {
    this.checklist.update(list => list.filter((_, i) => i !== index));
  }

  carregarEquipamentos() {
    this.equipamentoService.listar(1, 100).subscribe(res => this.equipamentos.set(res.data ?? []));
  }

  carregarUsuarios() {
    this.usuarioService.listar(1, 100).subscribe(res => this.usuarios.set(res.data ?? []));
  }

  salvar() {
    if (this.planoForm.valid) {
      const v = this.planoForm.value;
      const dados: any = {
        equipamentoId: Number(v.equipamentoId),
        titulo: v.titulo,
        periodicidadeDias: Number(v.periodicidadeDias),
        dataProximaManutencao: new Date(v.dataProximaManutencao).toISOString(),
        tecnicoId: v.tecnicoId ? Number(v.tecnicoId) : undefined,
        descricao: v.descricao
      };

      if (!this.idEdicao) {
        dados.itensChecklist = this.checklist().filter(it => it.descricao.trim() !== '');
      }

      const obs = this.idEdicao
        ? this.planoService.atualizar(this.idEdicao, dados)
        : this.planoService.criar(dados);

      obs.subscribe({
        next: () => {
          alert(`Plano ${this.idEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`);
          this.router.navigate(['/app/planos']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          alert(err.error?.message || 'Falha ao salvar plano.');
        }
      });
    }
  }
}
