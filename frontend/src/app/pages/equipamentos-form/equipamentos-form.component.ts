import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EquipamentoService } from '../../services/equipamento.service';

@Component({
  selector: 'app-equipamentos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-emerald-50 text-[#02464a] rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ idEdicao ? 'Editar equipamento' : 'Novo equipamento' }}
          </h1>
          <p class="text-gray-500 text-sm">Gerencie as informações técnicas do ativo no PIM.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div class="grid grid-cols-1 gap-5">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Código / TAG</label>
              <input type="text" formControlName="codigo" placeholder="Ex: MOTO-001" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nome do Ativo</label>
              <input type="text" formControlName="nome" placeholder="Ex: Motor de Indução" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Tipo de Ativo</label>
              <input type="text" formControlName="tipo" placeholder="Ex: Elétrico, Mecânico" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Localização</label>
              <input type="text" formControlName="localizacao" placeholder="Ex: Galpão A, Setor 2" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Fabricante</label>
              <input type="text" formControlName="fabricante" placeholder="Ex: WEG, Siemens" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Modelo / Especificação</label>
              <input type="text" formControlName="modelo" placeholder="Ex: W22 Premium" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <input type="checkbox" formControlName="ativo" id="ativo" 
                   class="h-5 w-5 rounded border-gray-300 text-[#02464a] focus:ring-[#02464a] transition-all cursor-pointer">
            <label for="ativo" class="text-sm font-bold text-gray-700 cursor-pointer">
              Ativo para manutenções?
            </label>
          </div>

          <div *ngIf="form.invalid && form.touched" class="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <p class="text-xs font-bold uppercase mb-2">Atenção:</p>
            <ul class="text-[10px] font-bold list-disc list-inside space-y-1 uppercase opacity-80">
              <li *ngIf="form.get('codigo')?.invalid">Código/TAG é obrigatório (mín. 3 caracteres)</li>
              <li *ngIf="form.get('nome')?.invalid">Nome do Ativo é obrigatório</li>
              <li *ngIf="form.get('tipo')?.invalid">Tipo é obrigatório</li>
              <li *ngIf="form.get('localizacao')?.invalid">Localização é obrigatória</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/equipamentos" 
                    class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            
            <button type="submit" [disabled]="form.invalid" 
                    [style.background-color]="form.invalid ? '#cbd5e1' : '#02464a'"
                    class="px-8 py-2.5 text-white font-bold rounded-xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all disabled:cursor-not-allowed shadow-lg shadow-[#02464a]/20">
              {{ idEdicao ? 'Salvar alterações' : 'Cadastrar equipamento' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class EquipamentosFormComponent implements OnInit {
  private service = inject(EquipamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form: FormGroup;
  idEdicao: number | null = null;

  constructor() {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      localizacao: ['', Validators.required],
      fabricante: [''],
      modelo: [''],
      ativo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.idEdicao = Number(id);
      this.service.obterPorId(this.idEdicao).subscribe(res => {
        this.form.patchValue(res);
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const obs = this.idEdicao
        ? this.service.atualizar(this.idEdicao, this.form.value)
        : this.service.criar(this.form.value);

      obs.subscribe({
        next: () => {
          alert(`Equipamento ${this.idEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`);
          this.router.navigate(['/app/equipamentos']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          const msg = err.error?.message || 'Falha ao salvar equipamento.';
          alert(msg);
        }
      });
    }
  }
}