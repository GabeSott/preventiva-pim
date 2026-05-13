import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-emerald-50 text-[#02464a] rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m2.25-1.5h-4.5M12 18.75c-4.418 0-8-2.239-8-5s3.582-5 8-5 8 2.239 8 5-3.582 5-8 5zM12 11.25a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ idEdicao ? 'Editar usuário' : 'Novo usuário' }}
          </h1>
          <p class="text-gray-500 text-sm">Gerencie o acesso e informações do colaborador do PIM.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div class="grid grid-cols-1 gap-5">
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nome completo</label>
            <input type="text" formControlName="nome" placeholder="Ex: João Silva" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">E-mail corporativo</label>
            <input type="email" formControlName="email" placeholder="Ex: joao.silva@empresa.com" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
          </div>

          <div *ngIf="!idEdicao">
            <label class="block text-sm font-bold text-gray-700 mb-2">Senha de acesso</label>
            <input type="password" formControlName="senha" placeholder="••••••••" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Perfil de acesso</label>
              <select formControlName="perfilId" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700 appearance-none">
                <option value="" disabled>Selecione o perfil...</option>
                <option *ngFor="let p of perfis()" [value]="p.id">{{ p.descricao }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Setor / Departamento</label>
              <input type="text" formControlName="setor" placeholder="Ex: Manutenção, Produção" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-sm text-gray-700">
            </div>
          </div>

          <div *ngIf="form.invalid && form.touched" class="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <p class="text-xs font-bold uppercase mb-2">Atenção:</p>
            <ul class="text-[10px] font-bold list-disc list-inside space-y-1 uppercase opacity-80">
              <li *ngIf="form.get('nome')?.invalid">Nome é obrigatório</li>
              <li *ngIf="form.get('email')?.invalid">E-mail corporativo inválido</li>
              <li *ngIf="!idEdicao && form.get('senha')?.invalid">Senha mínima de 6 caracteres</li>
              <li *ngIf="form.get('perfilId')?.invalid">Selecione o perfil de acesso</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/usuarios" 
                    class="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            
            <button type="submit" [disabled]="form.invalid" 
                    [style.background-color]="form.invalid ? '#cbd5e1' : '#02464a'"
                    class="px-8 py-2.5 text-white font-bold rounded-xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all disabled:cursor-not-allowed shadow-lg shadow-[#02464a]/20">
              {{ idEdicao ? 'Salvar alterações' : 'Cadastrar usuário' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class UsuariosFormComponent implements OnInit {
  private service = inject(UsuarioService);
  private perfilService = inject(PerfilService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form: FormGroup;
  idEdicao: number | null = null;
  perfis = signal<any[]>([]);

  constructor() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.minLength(6)]],
      perfilId: ['', Validators.required],
      setor: ['']
    });
  }

  ngOnInit(): void {
    this.perfilService.listar().subscribe({
      next: (res) => this.perfis.set(res ?? []),
      error: (err) => console.error('Erro ao carregar perfis:', err)
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.idEdicao = Number(id);
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();

      this.service.obterPorId(this.idEdicao).subscribe(res => {
        this.form.patchValue({
          ...res,
          perfilId: res.perfil?.id
        });
      });
    } else {
      this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = { ...this.form.value };
      if (this.idEdicao && !dados.senha) {
        delete dados.senha;
      }

      // Converte perfilId para number pois o select retorna string
      dados.perfilId = Number(dados.perfilId);

      const obs = this.idEdicao
        ? this.service.atualizar(this.idEdicao, dados)
        : this.service.criar(dados);

      obs.subscribe({
        next: () => {
          alert(`Usuário ${this.idEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`);
          this.router.navigate(['/app/usuarios']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          const msg = err.error?.message || 'Falha ao salvar usuário.';
          alert(msg);
        }
      });
    }
  }
}
