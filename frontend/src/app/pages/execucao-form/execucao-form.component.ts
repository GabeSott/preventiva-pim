import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PlanoService } from '../../services/plano.service';
import { ExecucaoService } from '../../services/execucao.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-execucao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-emerald-50 text-[#02464a] rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Registrar execução</h1>
          <p class="text-gray-500">Confirme a manutenção realizada no equipamento do PIM.</p>
        </div>
      </div>

      <form [formGroup]="execForm" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">

        <div class="grid grid-cols-1 gap-5">

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Plano de manutenção</label>
            <select formControlName="planoId" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 appearance-none text-sm">
              <option value="">Selecione o plano...</option>
              <option *ngFor="let p of planos()" [value]="p.id">
                {{ p.titulo }} ({{ p.equipamento?.nome }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Data da execução</label>
              <input type="date" formControlName="dataExecucao" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Responsável técnico</label>
              <div class="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium h-[46px] text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ tecnicoNome() || 'Buscando...' }}
              </div>
            </div>
          </div>

          <div *ngIf="itensChecklist().length > 0" class="mt-2">
            <label class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">              
              Checklist de verificação
            </label>
            <div class="space-y-2">
              <div *ngFor="let item of itensChecklist()" 
                   class="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <span class="text-sm text-gray-600 font-medium">{{ item.descricao }}</span>
                <div class="flex gap-2">
                  <button type="button" (click)="toggleItem(item.id, true)"
                          [class]="item.conforme ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400'"
                          class="px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase">OK</button>
                  <button type="button" (click)="toggleItem(item.id, false)"
                          [class]="item.conforme === false ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400'"
                          class="px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase">X</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Status da manutenção</label>
            <select formControlName="status" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
              <option value="realizada">✅ Realizada</option>
              <option value="parcial">⚠️ Parcial</option>
              <option value="nao_realizada">❌ Não realizada</option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
            <input type="checkbox" formControlName="conformidade" id="conforme" 
                   class="h-5 w-5 rounded border-gray-300 text-[#02464a] focus:ring-[#02464a] transition-all cursor-pointer">
            <label for="conforme" class="text-sm font-bold text-gray-700 cursor-pointer">
              Execução em conformidade com o plano?
            </label>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Observações / Detalhes técnicos</label>
            <textarea formControlName="observacoes" rows="3" 
                      placeholder="Descreva detalhes técnicos ou ocorrências..." 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none resize-none text-sm text-gray-700"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/planos" 
                    class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="execForm.invalid" 
                    [style.background-color]="'#02464a'"
                    class="px-8 py-2.5 text-white font-bold rounded-xl hover:brightness-110 hover:shadow-lg disabled:opacity-50 disabled:bg-gray-300 transition-all active:scale-95 shadow-md shadow-emerald-100">
              Confirmar execução
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ExecucaoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private planoService = inject(PlanoService);
  private execucaoService = inject(ExecucaoService);
  private authService = inject(AuthService);

  execForm: FormGroup;
  planos = signal<any[]>([]);
  tecnicoNome = signal<string>('');
  itensChecklist = signal<any[]>([]);

  constructor() {
    this.execForm = this.fb.group({
      planoId: ['', Validators.required],
      dataExecucao: [new Date().toISOString().substring(0, 10), Validators.required],
      status: ['realizada', Validators.required],
      conformidade: [true],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.carregarPlanosAtivos();

    this.execForm.get('planoId')?.valueChanges.subscribe(id => {
      if (id) this.buscarDetalhesDoPlano(id);
    });

    this.route.queryParams.subscribe(params => {
      if (params['planoId']) {
        this.execForm.patchValue({ planoId: Number(params['planoId']) });
      }
    });
  }

  carregarPlanosAtivos(): void {
    this.planoService.listar({ limit: 100 }).subscribe(res => this.planos.set(res.data ?? []));
  }

  buscarDetalhesDoPlano(planoId: number): void {
    this.planoService.obterPorId(planoId).subscribe({
      next: (res) => {
        this.tecnicoNome.set(res.tecnico?.nome || this.authService.getUsuario()?.nome);
        this.itensChecklist.set(res.itens_checklist.map((i: any) => ({ ...i, conforme: true })));
      }
    });
  }

  toggleItem(itemId: number, status: boolean): void {
    this.itensChecklist.update(itens =>
      itens.map(i => i.id === itemId ? { ...i, conforme: status } : i)
    );
  }

  salvar(): void {
    if (this.execForm.valid) {
      const checklist = this.itensChecklist().map(item => ({
        itemId: item.id,
        conforme: item.conforme
      }));

      const payload = {
        ...this.execForm.value,
        dataExecucao: new Date(this.execForm.value.dataExecucao).toISOString(),
        planoId: Number(this.execForm.value.planoId),
        tecnicoId: this.authService.getUsuario()?.id,
        checklist
      };

      console.log('Payload enviado para o backend:', payload);

      this.execucaoService.criar(payload).subscribe({
        next: () => {
          alert('Execução e Checklist registrados com sucesso!');
          this.router.navigate(['/app/planos']);
        },
        error: (err) => {
          console.error("Erro ao salvar execução:", err);
          alert('Erro ao registrar execução.');
        }
      });
    }
  }
}