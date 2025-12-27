<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldCheck,
  User,
  Lock
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const authId = ref('')
const authKey = ref('')
const isAuthenticating = ref(false)

const handleLogin = async () => {
  if (!authId.value.trim()) return
  isAuthenticating.value = true

  // Simulation: Accept any ID starting with ae6_ or containing agency
  setTimeout(() => {
    if (authId.value.toLowerCase().includes('ae6') || authId.value.toLowerCase().includes('agency')) {
      router.push('/dashboard')
    } else {
      alert("Authentication Failed. Please verify your Enterprise ID.")
    }
    isAuthenticating.value = false
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-[var(--ae6-bg)] relative overflow-hidden">
    <!-- Background Accents -->
    <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--ae6-primary)]/5 rounded-full blur-[100px]"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--ae6-primary)]/5 rounded-full blur-[100px]"></div>

    <div class="w-full max-w-md glass-card !bg-[var(--ae6-surface)]/80 p-12 rounded-[3rem] relative overflow-hidden group border border-[var(--ae6-border)]">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--ae6-primary)] to-transparent opacity-50"></div>

      <div class="text-center mb-10">
        <div class="w-20 h-20 bg-[var(--ae6-primary)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <ShieldCheck class="text-white" :size="36" />
        </div>
        <h2 class="text-4xl font-bold mb-2 tracking-tight text-[var(--ae6-text-main)] uppercase font-orbitron italic">Enterprise Portal</h2>
        <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.4em]">Strategic Intelligence Network</p>
      </div>

      <div class="space-y-8">
        <div class="space-y-3">
          <label class="text-[10px] uppercase tracking-[0.3em] text-[var(--ae6-primary)] font-bold ml-1">Corporate ID</label>
          <div class="relative group/input">
            <User class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)] group-focus-within/input:text-[var(--ae6-primary)] transition-colors" :size="20" />
            <input v-model="authId" type="text" placeholder="ENT_HQ_01" class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[1.5rem] py-5 pl-14 pr-6 focus:border-[var(--ae6-primary)] focus:outline-none transition-all placeholder:text-[var(--ae6-text-muted)]/40 text-[var(--ae6-text-main)]" />
          </div>
        </div>
        <div class="space-y-3">
          <label class="text-[10px] uppercase tracking-[0.3em] text-[var(--ae6-primary)] font-bold ml-1">Security Key</label>
          <div class="relative group/input">
            <Lock class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)] group-focus-within/input:text-[var(--ae6-primary)] transition-colors" :size="20" />
            <input v-model="authKey" type="password" placeholder="••••••••" class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[1.5rem] py-5 pl-14 pr-6 focus:border-[var(--ae6-primary)] focus:outline-none transition-all placeholder:text-[var(--ae6-text-muted)]/40 text-[var(--ae6-text-main)]" />
          </div>
        </div>
        <div class="pt-4">
          <button @click="handleLogin" :disabled="isAuthenticating" class="w-full bg-gradient-to-r from-[var(--ae6-primary)] to-[var(--ae6-primary-hover)] text-white py-6 rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.3em] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50">
            {{ isAuthenticating ? 'Authenticating...' : 'Secure Access' }}
          </button>
        </div>
        <button @click="router.push('/')" class="w-full text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[var(--ae6-primary)] transition-colors">
          Return to Hub
        </button>
      </div>
    </div>
  </div>
</template>
