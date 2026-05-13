import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      <aside *ngIf="router.url !== '/login'" class="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div class="p-6">
          <div class="mb-10">
            <div class="flex items-center gap-3">
              <img src="assets/img/logo-preventiva.jpeg" alt="Logo" class="w-11 h-11 rounded-xl shadow-lg object-cover">
              <h1 class="font-black tracking-tighter text-xl text-gray-900 leading-none">Preventiva PIM</h1>
            </div>
            <div class="flex mt-3">
              <div class="inline-flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg ml-[56px]">
                <span class="text-[11px] font-black text-[#02464a] antialiased uppercase">{{ dataHora().split(',')[0] }}</span>
                <div class="w-px h-3 bg-emerald-200"></div>
                <span class="text-[11px] font-black text-emerald-600 antialiased uppercase">{{ dataHora().split(',')[1]?.trim() }}</span>
              </div>
            </div>
          </div>

          <nav class="space-y-2">
            <a *ngIf="['admin', 'gestor', 'supervisor'].includes(authService.usuario()?.perfil?.chave)"
                routerLink="/app/dashboard" 
                routerLinkActive="bg-[#02464a] text-white shadow-md shadow-emerald-100" 
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-[#02464a] hover:text-white rounded-xl transition-all">
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
            </a>

            <a routerLink="/app/calendario" 
                routerLinkActive="bg-[#02464a] text-white shadow-md shadow-emerald-100" 
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-[#02464a] hover:text-white rounded-xl transition-all">
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>Calendário</span>
                </div>
            </a>

            <a routerLink="/app/planos" 
                routerLinkActive="bg-[#02464a] text-white shadow-md shadow-emerald-100" 
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-[#02464a] hover:text-white rounded-xl transition-all">
                
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-13.5h-1.875a3.375 3.375 0 0 1-3.375-3.375M16.5 21h-9a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25V18.75a2.25 2.25 0 0 1-2.25 2.25Z" />
                  </svg>
                  <span>Planos e Status</span>
                </div>
            </a>

            <a routerLink="/app/equipamentos" 
                routerLinkActive="bg-[#02464a] text-white shadow-md shadow-emerald-100" 
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-[#02464a] hover:text-white rounded-xl transition-all">
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <span>Equipamentos</span>
                </div>
            </a>

            <a *ngIf="['admin', 'gestor'].includes(authService.usuario()?.perfil?.chave)"
                routerLink="/app/usuarios" 
                routerLinkActive="bg-[#02464a] text-white shadow-md shadow-emerald-100" 
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-[#02464a] hover:text-white rounded-xl transition-all">
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <span>Usuários</span>
                </div>
            </a>
          </nav>
        </div>

        <div class="mt-auto p-6 border-t border-gray-100">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-emerald-50 text-[#02464a] rounded-full flex items-center justify-center font-bold">
              {{ authService.usuario()?.nome?.charAt(0) || 'U' }}
            </div>
            <div>
              <p class="text-xs font-black">{{ authService.usuario()?.nome || 'Usuário' }}</p>
              <p class="text-[10px] text-gray-400">{{ authService.usuario()?.perfil?.descricao || 'Perfil' }}</p>
            </div>
          </div>

          <button (click)="logout()" class="group flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H21" />
            </svg>
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-gray-50">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  public router = inject(Router);
  public authService = inject(AuthService);

  dataHora = signal<string>('');
  private intervalId: any;

  ngOnInit() {
    this.atualizarDataHora();
    // Atualiza a cada minuto para manter o relógio preciso
    this.intervalId = setInterval(() => this.atualizarDataHora(), 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  atualizarDataHora() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    this.dataHora.set(`${data}, ${horas}h${minutos}`);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
