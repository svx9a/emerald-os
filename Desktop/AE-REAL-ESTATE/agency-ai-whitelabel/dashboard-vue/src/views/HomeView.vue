<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Users,
  Bot,
  Wallet,
  Key
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const stats = ref<any[]>([
  { label: 'Market Volume', value: '$4.2B+', icon: TrendingUp },
  { label: 'Global Assets', value: '1,200+', icon: Globe },
  { label: 'Active Investors', value: '85k', icon: Users },
  { label: 'Operational Efficiency', value: '99.9%', icon: Bot }
])

const iconMap: any = {
  TrendingUp,
  Globe,
  Users,
  Bot,
  Wallet,
  Key
}

const fetchStats = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/stats?tenantId=ae6_kinetic_01`)
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      stats.value = data.map(s => ({
        ...s,
        icon: iconMap[s.icon] || TrendingUp
      }))
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="relative overflow-hidden bg-[var(--ae6-bg)]">
    <!-- Hero Section -->
    <main class="relative h-[90vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
          class="w-full h-full object-cover scale-100 brightness-[0.8] dark:brightness-[0.6]"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ae6-bg)]"></div>
      </div>

      <div class="relative z-10 text-center px-6 max-w-5xl">
        <div class="inline-flex items-center gap-2 bg-[var(--ae6-surface)] px-6 py-2 rounded-full border border-[var(--ae6-border)] mb-8 animate-bounce-slow">
          <Sparkles class="text-[var(--ae6-primary)]" :size="16" />
          <span class="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-text-main)]">Strategic Asset Intelligence</span>
        </div>
        <div class="w-full max-w-2xl mx-auto mb-12">
          <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-[var(--ae6-text-main)]">
            <g transform="skewX(-25)">
              <!-- AE6 Industrial Stencil -->
              <g stroke-width="1.5" transform="translate(10, 8)">
                <!-- A-TOTEM (Industrial Black) - Thicker, Same Ground Height, Leaning -->
                <g fill="currentColor" stroke="currentColor" transform="scale(1.25) translate(-10, -10)">
                  <path d="M55 0 L110 115 H80 L55 45 L30 115 H0 Z"/>
                  <!-- Stencil Split Crossbar - Aligned to Thicker Legs -->
                  <path d="M38 72 H52 V88 H38 Z M58 72 H72 V88 H58 Z"/>
                </g>
                <!-- E + stencil 6 (currentColor) - Tightened Gap for Thicker A -->
                <g fill="currentColor" stroke="currentColor" transform="translate(115, 0)">
                  <!-- E letter -->
                  <path d="M0 0 H22 V115 H0 Z
                           M28 0 H93 V24 H28 Z
                           M28 47 H76 V67 H28 Z
                           M28 91 H93 V115 H28 Z"/>
                  <!-- 6 with stencil hole -->
                  <path d="M102 0 H178 V24 H124 V47 H178 V115 H102 V0 Z
                           M124 67 H156 V91 H124 Z"
                        fill-rule="evenodd"/>
                </g>
              </g>
             </g>
           </svg>
        </div>
        <p class="text-xl md:text-2xl text-[var(--ae6-text-muted)] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Leverage the industry's first predictive asset engine, designed for the modern global investor.
        </p>
        <div class="flex flex-col md:flex-row gap-6 justify-center items-center">
          <button @click="router.push('/marketplace')"
            class="group bg-[var(--ae6-text-main)] text-[var(--ae6-bg)] px-10 py-5 rounded-full font-bold uppercase text-xs tracking-[0.3em] hover:bg-[var(--ae6-primary)] transition-all duration-500 flex items-center gap-4 shadow-2xl focus:ring-2 focus:ring-[var(--ae6-primary)] focus:ring-offset-2 focus:outline-none"
            aria-label="Access AE6 Global Marketplace"
          >
            Access International Marketplace
            <ArrowRight class="group-hover:translate-x-2 transition-transform" :size="16" />
          </button>
          <div class="flex flex-col gap-6" role="complementary" aria-label="Social Proof">
            <div class="flex items-center gap-4">
              <span class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-widest font-bold">Trusted by 85,000 Global Investors</span>
            </div>
            <div class="flex flex-wrap items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <!-- OpenAI -->
              <div class="h-5 flex items-center gap-2" title="AI Intelligence by OpenAI">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-4.4471-2.9119 6.0857 6.0857 0 0 0-5.6337 1.9351 6.0857 6.0857 0 0 0-5.6337-1.9351 6.0462 6.0462 0 0 0-4.4471 2.9119 5.9847 5.9847 0 0 0-.5153 4.9066 6.0846 6.0846 0 0 0 0 4.3578 5.9847 5.9847 0 0 0 .5153 4.9066 6.0462 6.0462 0 0 0 4.4471 2.9119 6.0856 6.0856 0 0 0 5.6337-1.9351 6.0856 6.0856 0 0 0 5.6337 1.9351 6.0462 6.0462 0 0 0 4.4471-2.9119 5.9847 5.9847 0 0 0 .5153-4.9066 6.0846 6.0846 0 0 0 0-4.3578ZM12 12.5a.5.5 0 1 1 .5-.5.5006.5006 0 0 1-.5.5Z"/>
                </svg>
                <span class="text-[11px] font-bold tracking-tight">OpenAI</span>
              </div>
              <!-- Google Cloud -->
              <div class="h-5 flex items-center gap-2" title="Data Infrastructure by Google Cloud">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <span class="text-[11px] font-bold tracking-tight">Google Cloud</span>
              </div>
              <!-- AWS -->
              <div class="h-5 flex items-center gap-2" title="Scalable Infrastructure by AWS">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span class="text-[11px] font-bold tracking-tight">AWS</span>
              </div>
              <!-- Stripe -->
              <div class="h-5 flex items-center gap-2" title="Financial Processing by Stripe">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M13.962 8.885c-1.155 0-1.857.575-1.857 1.482 0 1.63 2.253 1.366 2.253 3.14 0 .618-.52 1.018-1.348 1.018-.893 0-1.558-.337-2.146-.664l-.454 1.94c.643.344 1.62.658 2.65.658 2.28 0 3.49-1.09 3.49-2.57 0-1.822-2.253-1.482-2.253-3.13 0-.523.414-.906 1.15-.906.69 0 1.285.23 1.764.532l.46-1.923c-.502-.275-1.222-.577-1.99-.577zm-8.875.21v2.105h1.564v-2.105h-1.564zm0 2.87h1.564v5.336h-1.564v-5.336zm4.116-2.87v2.105h1.564v-2.105h-1.564zm0 2.87h1.564v5.336h-1.564v-5.336z"/>
                </svg>
                <span class="text-[11px] font-bold tracking-tight">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Stats Section -->
    <section class="relative z-20 -mt-24 px-6 pb-32">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div v-for="stat in stats" :key="stat.label" class="glass-card !bg-[var(--ae6-surface)]/80 p-10 rounded-[2.5rem] interactive-card border border-[var(--ae6-border)]">
          <div class="p-4 bg-[var(--ae6-primary)]/10 rounded-2xl text-[var(--ae6-primary)] w-fit mb-6">
            <component :is="stat.icon" :size="24" />
          </div>
          <div class="text-4xl font-bold mb-2 tracking-tight text-[var(--ae6-text-main)] font-orbitron">{{ stat.value }}</div>
          <div class="text-[10px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)] font-mono">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Enterprise Integrations Section -->
    <section class="relative z-20 px-6 pb-32">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--ae6-primary)] mb-4">Enterprise Ecosystem</h2>
          <h3 class="text-3xl font-bold tracking-tight text-[var(--ae6-text-main)] uppercase">Seamless Global Integrations</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <!-- Salesforce -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="#00A1E0" d="M23.3 12.5c0-2.3-1.9-4.2-4.2-4.2-0.2 0-0.3 0-0.5 0.1-1-2.4-3.4-4-6.1-4-2.7 0-5 1.6-6 3.9-0.3-0.1-0.6-0.1-0.9-0.1-2.4 0-4.4 2-4.4 4.4 0 0.1 0 0.2 0 0.3-0.7 0.6-1.2 1.5-1.2 2.5 0 1.8 1.5 3.3 3.3 3.3h16.7c1.8 0 3.3-1.5 3.3-3.3 0-1.2-0.6-2.2-1.5-2.9 0.2-0.1 0.3-0.1 0.3-0.1z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">Salesforce</span>
          </div>
          <!-- HubSpot -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="#FF7A59" d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12s4.5 10 10 10 10-4.5 10-10zm-10 7c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">HubSpot</span>
          </div>
          <!-- DocuSign -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="#005CB9" d="M4 4h16v16H4z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">DocuSign</span>
          </div>
          <!-- Plaid -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="currentColor" d="M2 2h20v20H2z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">Plaid</span>
          </div>
          <!-- Bloomberg -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="currentColor" d="M4 4h16v16H4z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">Bloomberg</span>
          </div>
          <!-- Zillow -->
          <div class="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-[var(--ae6-primary)]/30 transition-all border border-[var(--ae6-border)]">
            <svg viewBox="0 0 24 24" class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="#0074E4" d="M12 2L2 12h3v10h14V12h3L12 2z"/>
            </svg>
            <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">Zillow</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

