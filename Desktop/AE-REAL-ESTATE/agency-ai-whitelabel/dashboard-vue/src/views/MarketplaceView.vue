<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Users,
  BedDouble,
  Globe,
  Plus,
  X,
  ChevronLeft,
  Layers,
  Zap
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const emit = defineEmits(['view-detail'])

const router = useRouter()
const properties = ref<any[]>([])
const showMap = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const page = ref(0)
const limit = ref(6)
const total = ref(0)
const hasMore = ref(false)
const selectedProperty = ref<any | null>(null)
const isEnhancing = ref(false)
const isSmartSearch = ref(false)
const isReindexing = ref(false)
const enhancedProperties = ref<Set<string>>(new Set())

const reindexProperties = async () => {
  if (isReindexing.value) return
  isReindexing.value = true
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/search/reindex?tenantId=ae6_kinetic_01`, {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      alert(`Asset Update Successful: ${data.message}`)
    }
  } catch (err) {
    console.error("Data synchronization failed", err)
    alert("Synchronization failed. Please contact support.")
  } finally {
    isReindexing.value = false
  }
}

const toggleSmartSearch = () => {
  isSmartSearch.value = !isSmartSearch.value
  page.value = 0
  fetchProperties()
}

const enhanceProperty = async (prop: any) => {
  if (enhancedProperties.value.has(prop.id)) return

  isEnhancing.value = true
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Update property with "enhanced" image from Unsplash high-res
  const highResImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=90',
    'https://images.unsplash.com/photo-1512918766775-d56aebb309f9?auto=format&fit=crop&w=1600&q=90',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=90',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=90'
  ]

  const enhancedProp = properties.value.find(p => p.id === prop.id)
  if (enhancedProp) {
    enhancedProp.image_url = highResImages[Math.floor(Math.random() * highResImages.length)]
    enhancedProp.is_enhanced = true
    enhancedProperties.value.add(prop.id)
  }

  isEnhancing.value = false
}

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<L.Map | null>(null)
let markersGroup: L.LayerGroup | null = null

// Fix Leaflet Icon Issue
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

const initMap = async () => {
  if (!mapContainer.value) return

  await nextTick()
  fixLeafletIcons()

  if (mapInstance.value) {
    (mapInstance.value as L.Map).remove()
  }

  mapInstance.value = L.map(mapContainer.value, {
    center: [7.8804, 98.3923], // Phuket Center
    zoom: 11,
    zoomControl: false,
    attributionControl: false
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
  }).addTo(mapInstance.value as L.Map)

  markersGroup = L.layerGroup().addTo(mapInstance.value as L.Map)
  updateMarkers()
}

const updateMarkers = () => {
  if (!mapInstance.value || !markersGroup) return
  markersGroup.clearLayers()

  properties.value.forEach(prop => {
    if (prop.lat && prop.lng) {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative group/pin">
            <div class="w-10 h-10 bg-[var(--ae6-primary)] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white transform hover:scale-125 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/pin:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/pin:translate-y-0 z-[1000]">
              <div class="bg-[var(--ae6-bg)]/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl w-48 border border-[var(--ae6-border)]">
                <img src="${prop.image_url}" class="w-full h-24 object-cover rounded-xl mb-3" />
                <div class="text-[10px] font-bold text-[var(--ae6-text-main)] uppercase tracking-tight mb-1">${prop.name}</div>
                <div class="text-[10px] font-bold text-[var(--ae6-primary)] tracking-tighter">฿${(prop.price / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })

      const marker = L.marker([prop.lat, prop.lng], { icon: customIcon })
      marker.on('click', () => {
        selectedProperty.value = prop
        // Emit event for parent to handle detail view (DDProperty style)
        emit('view-detail', prop)
      })
      markersGroup?.addLayer(marker)
    }
  })

  // Fit bounds if markers exist
  if (properties.value.length > 0 && mapInstance.value) {
    const latLngs = properties.value.map(p => [p.lat, p.lng] as L.LatLngTuple)
    ;(mapInstance.value as L.Map).fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] })
  }
}

watch(showMap, (val) => {
  if (val) {
    nextTick(() => initMap())
  }
})

watch(properties, () => {
  if (showMap.value) {
    updateMarkers()
  }
}, { deep: true })

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
  }
})

const openQuickView = (prop: any) => {
  selectedProperty.value = prop
}

const closeQuickView = () => {
  selectedProperty.value = null
}

const propertyTypes = ['Villa', 'Condo', 'Penthouse', 'Estate']

const fetchProperties = async (append = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const offset = page.value * limit.value

    const params = new URLSearchParams({
      tenantId: 'ae6_kinetic_01',
      limit: limit.value.toString(),
      offset: offset.toString(),
      q: searchQuery.value,
      type: selectedType.value,
      status: selectedStatus.value
    })

    const endpoint = (isSmartSearch.value && searchQuery.value)
      ? `${apiBase}/api/search/intelligent?${params.toString()}`
      : `${apiBase}/api/houses?${params.toString()}`

    const res = await fetch(endpoint)
    const data = await res.json()

    const results = isSmartSearch.value ? data.results : data.results
    const totalCount = isSmartSearch.value ? data.meta?.count || data.results.length : data.pagination?.total || 0
    const hasMoreResults = isSmartSearch.value ? false : data.pagination?.hasMore || false

    const newProperties = results.map((p: any) => ({
      ...p,
      // Keep existing lat/lng if present, otherwise randomize slightly for map view
      lat: p.lat || (7.8804 + (Math.random() - 0.5) * 0.1),
      lng: p.lng || (98.3923 + (Math.random() - 0.5) * 0.1),
      image_url: p.image_url || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'
    }))

    if (append) {
      properties.value = [...properties.value, ...newProperties]
    } else {
      properties.value = newProperties
    }

    total.value = totalCount
    hasMore.value = hasMoreResults
  } catch (err) {
    console.error("Failed to fetch properties:", err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 0
  fetchProperties()
}

const handleLoadMore = () => {
  if (hasMore.value) {
    page.value++
    fetchProperties(true)
  }
}

const selectType = (type: string) => {
  selectedType.value = selectedType.value === type ? '' : type
  page.value = 0
  fetchProperties()
}

onMounted(() => fetchProperties())
</script>

<template>
  <div class="min-h-screen bg-[var(--ae6-bg)] py-32 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div class="max-w-xl">
          <h2 class="text-xs uppercase tracking-[0.4em] text-[var(--ae6-primary)] font-bold mb-4">Strategic Asset Portfolio</h2>
          <h3 class="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-tight text-[var(--ae6-text-main)]">
            Enterprise Asset Exchange
          </h3>
          <p class="mt-4 text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-widest font-bold">Showing {{ properties.length }} of {{ total }} Assets</p>
        </div>
        <div class="flex flex-col gap-6 w-full md:w-auto">
          <div class="flex flex-col md:flex-row gap-6 items-center">
            <div class="relative flex-1 group">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="isSmartSearch ? 'Strategic Search: Query assets, financial metrics, or regional data...' : 'Search assets, locations, and configurations...'"
                class="bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-full py-4 px-12 text-[10px] uppercase tracking-widest font-bold focus:border-[var(--ae6-primary)] outline-none transition-all w-full md:w-64 md:focus:w-80 shadow-sm"
              />
              <Globe v-if="!isSmartSearch" class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)]" :size="16" />
              <Zap v-else class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-primary)] animate-pulse" :size="16" />

              <!-- Smart Search Toggle -->
              <button
                @click="toggleSmartSearch"
                :class="[
                  'absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all',
                  isSmartSearch ? 'bg-[var(--ae6-primary)] text-white' : 'bg-[var(--ae6-border)] text-[var(--ae6-text-muted)]'
                ]"
                title="Enable AI-Driven Intelligent Search"
              >
                <Zap :size="12" />
              </button>
            </div>
            <div class="flex gap-4 w-full md:w-auto">
              <button
                @click="reindexProperties"
                :disabled="isReindexing"
                class="glass-card px-4 py-4 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:bg-[var(--ae6-primary)] hover:text-white transition-all border border-[var(--ae6-border)] shadow-sm disabled:opacity-50"
                title="Synchronize Data Repository"
              >
                <Layers :size="14" :class="{ 'animate-spin': isReindexing }" />
              </button>
              <button @click="showMap = !showMap" class="glass-card flex-1 md:flex-none px-8 py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-2 hover:bg-[var(--ae6-primary)] hover:text-white transition-all border border-[var(--ae6-border)] shadow-sm">
                <Globe :size="14" /> {{ showMap ? 'Gallery View' : 'Geospatial View' }}
              </button>
            </div>
          </div>

          <!-- Filter Chips (Mobile Friendly) -->
          <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            <button
              v-for="type in propertyTypes"
              :key="type"
              @click="selectType(type)"
              :class="[
                'whitespace-nowrap px-6 py-2 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold border transition-all',
                selectedType === type
                  ? 'bg-[var(--ae6-primary)] text-white border-transparent shadow-lg'
                  : 'bg-[var(--ae6-bg)] text-[var(--ae6-text-muted)] border-[var(--ae6-border)] hover:border-[var(--ae6-primary)]'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>

      <!-- Marketplace Grid View -->
      <div v-if="!showMap" class="animate-in fade-in duration-700">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div v-for="prop in properties" :key="prop.id"
            class="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden interactive-card group shadow-lg border border-[var(--ae6-border)]"
          >
            <div class="h-64 md:h-80 relative overflow-hidden">
              <img :src="prop.image_url" :alt="`Luxury property: ${prop.name}`" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" loading="lazy" />

              <!-- Data Optimized Badge -->
              <div v-if="prop.is_enhanced" class="absolute top-6 left-6 px-4 py-2 rounded-full bg-[var(--ae6-primary)] text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse z-10">
                Audited Asset Data
              </div>

              <!-- Quick View Overlay -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                <button
                  @click.stop="openQuickView(prop)"
                  class="bg-white/20 backdrop-blur-xl border border-white/30 text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[var(--ae6-primary)] hover:border-transparent transition-all transform translate-y-8 group-hover:translate-y-0 duration-700 shadow-2xl"
                >
                  Executive Summary
                </button>
                <button
                  v-if="!prop.is_enhanced"
                  @click.stop="enhanceProperty(prop)"
                  :disabled="isEnhancing"
                  class="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold hover:bg-white/20 transition-all transform translate-y-12 group-hover:translate-y-0 duration-700 delay-100"
                >
                  {{ isEnhancing ? 'Optimizing Asset...' : 'Enhance Digital Presentation' }}
                </button>
              </div>

              <div class="absolute inset-0 bg-gradient-to-t from-[var(--ae6-bg)]/80 via-transparent to-transparent opacity-60"></div>
              <div class="absolute top-6 right-6 px-4 py-2 rounded-full glass-card !bg-[var(--ae6-bg)]/90 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ae6-primary)] shadow-lg">
                {{ prop.status }}
              </div>
              <div class="absolute bottom-6 left-6 text-white">
                <div class="text-[8px] uppercase tracking-[0.3em] font-bold opacity-80 mb-1">{{ prop.type }}</div>
                <div class="text-xl font-bold tracking-tighter uppercase">{{ prop.name }}</div>
              </div>
            </div>
            <div class="p-8 md:p-10" @click="emit('view-detail', prop)">
              <div class="flex justify-between items-start mb-6">
                <div class="max-w-[60%]">
                  <div class="text-[10px] uppercase tracking-[0.2em] text-[var(--ae6-primary)] font-bold mb-2 flex items-start gap-2">
                    <MapPin :size="12" class="mt-0.5 shrink-0" />
                    <span class="line-clamp-1">{{ prop.location }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-[var(--ae6-text-main)] tracking-tighter line-clamp-1">฿{{ (prop.price / 1000000).toFixed(1) }}M</div>
                  <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-bold">Estimated Market Value</div>
                </div>
              </div>
              <div class="flex justify-between py-6 border-y border-[var(--ae6-border)] mb-8">
                <div class="flex items-center gap-3">
                  <Users :size="16" class="text-[var(--ae6-text-muted)]" />
                  <span class="text-[10px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.guests || 4 }} Occupancy</span>
                </div>
                <div class="flex items-center gap-3">
                  <BedDouble :size="16" class="text-[var(--ae6-text-muted)]" />
                  <span class="text-[10px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.beds || 3 }} Bedrooms</span>
                </div>
              </div>
              <button
                @click.stop="emit('view-detail', prop)"
                class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] text-[var(--ae6-text-main)] py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-primary)] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm active:scale-95"
              >
                Access Full Asset Report
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Section -->
        <div v-if="hasMore" class="mt-20 flex justify-center">
          <button
            @click="handleLoadMore"
            :disabled="loading"
            class="group relative px-12 py-5 bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-full overflow-hidden transition-all hover:border-[var(--ae6-primary)] disabled:opacity-50 shadow-xl"
          >
            <div class="absolute inset-0 bg-[var(--ae6-primary)] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span class="relative z-10 text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-text-main)] group-hover:text-white transition-colors">
              {{ loading ? 'Synchronizing with Core...' : 'Explore Additional Opportunities' }}
            </span>
          </button>
        </div>

        <!-- No Results -->
        <div v-if="properties.length === 0 && !loading" class="mt-20 text-center">
          <div class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-[0.4em] font-bold">No assets identified within current parameters</div>
          <button @click="searchQuery = ''; selectedType = ''; handleSearch()" class="mt-6 text-[var(--ae6-primary)] text-[10px] uppercase tracking-widest font-bold hover:underline">Reset Search Parameters</button>
        </div>
      </div>

      <!-- Real-time Map View (Leaflet) -->
      <div v-else class="h-[700px] glass-card rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-700 border border-[var(--ae6-border)]">
        <div ref="mapContainer" class="w-full h-full z-0"></div>

        <div class="absolute top-10 right-10 flex flex-col gap-4 z-10">
          <button @click="mapInstance?.zoomIn()" class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)]">
            <Plus :size="20" />
          </button>
          <button @click="mapInstance?.zoomOut()" class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)]">
            <ChevronLeft class="rotate-[-90deg]" :size="20" />
          </button>
          <button class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)]">
            <Layers :size="20" />
          </button>
        </div>

        <div class="absolute bottom-10 left-10 glass-card p-8 rounded-[2rem] shadow-2xl border border-[var(--ae6-border)] max-w-sm z-10 pointer-events-none">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-3 h-3 rounded-full bg-[var(--ae6-primary)] animate-pulse"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-main)]">Geospatial Market Analytics</span>
          </div>
          <p class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed uppercase tracking-widest">Showing {{ properties.length }} active assets in the market sector.</p>
        </div>
      </div>
    </div>

    <!-- Mobile Sticky Navigation -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] md:hidden">
      <div class="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full p-2 flex items-center gap-2 shadow-2xl">
        <button
          @click="showMap = false"
          :class="[!showMap ? 'bg-[var(--ae6-primary)] text-white' : 'text-white/60']"
          class="px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all"
        >
          Gallery
        </button>
        <button
          @click="showMap = true"
          :class="[showMap ? 'bg-[var(--ae6-primary)] text-white' : 'text-white/60']"
          class="px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all"
        >
          Geospatial
        </button>
      </div>
    </div>

    <!-- Quick View Modal -->
    <Transition name="fade">
      <div v-if="selectedProperty" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-xl" @click="closeQuickView"></div>
        <div class="relative w-full max-w-5xl bg-[var(--ae6-bg)] rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--ae6-border)] animate-in zoom-in-95 duration-500">
          <button @click="closeQuickView" class="absolute top-8 right-8 z-10 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-[var(--ae6-primary)] transition-all">
            <X :size="20" />
          </button>

          <div class="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto no-scrollbar">
            <!-- Left: Image/Gallery -->
            <div class="w-full md:w-1/2 h-80 md:h-auto relative">
              <img :src="selectedProperty.image_url" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-[var(--ae6-bg)]/80 via-transparent to-transparent"></div>
              <div class="absolute bottom-10 left-10">
                <div class="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-primary)] mb-2">{{ selectedProperty.type }}</div>
                <h4 class="text-3xl font-bold tracking-tighter uppercase text-white">{{ selectedProperty.name }}</h4>
              </div>
            </div>

            <!-- Right: Details -->
            <div class="w-full md:w-1/2 p-10 md:p-16 flex flex-col">
              <div class="flex justify-between items-start mb-10">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2 text-[var(--ae6-text-muted)] text-[10px] uppercase font-bold tracking-widest">
                    <MapPin :size="14" />
                    {{ selectedProperty.location }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-[var(--ae6-primary)] tracking-tighter">฿{{ (selectedProperty.price / 1000000).toFixed(1) }}M</div>
                  <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-bold">Asset Valuation</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-8 mb-10">
                <div class="p-6 rounded-[2rem] bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)]">
                  <div class="flex items-center gap-4 mb-2">
                    <Users :size="18" class="text-[var(--ae6-primary)]" />
                    <span class="text-[10px] uppercase font-black tracking-widest text-[var(--ae6-text-muted)]">Occupancy</span>
                  </div>
                  <div class="text-lg font-bold text-[var(--ae6-text-main)]">{{ selectedProperty.guests || 4 }} Guests</div>
                </div>
                <div class="p-6 rounded-[2rem] bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)]">
                  <div class="flex items-center gap-4 mb-2">
                    <BedDouble :size="18" class="text-[var(--ae6-primary)]" />
                    <span class="text-[10px] uppercase font-black tracking-widest text-[var(--ae6-text-muted)]">Private Suites</span>
                  </div>
                  <div class="text-lg font-bold text-[var(--ae6-text-main)]">{{ selectedProperty.beds || 3 }} Bedrooms</div>
                </div>
              </div>

              <p class="text-[10px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)] leading-relaxed mb-10">
                Institutional-grade analysis complete. High-yield potential identified in prime strategic corridor. Advanced structural and aesthetic standards verified.
              </p>

              <div class="mt-auto flex flex-col gap-4">
                <div v-if="selectedProperty.is_enhanced" class="p-4 rounded-2xl bg-[var(--ae6-primary)]/10 border border-[var(--ae6-primary)]/20 mb-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div class="text-[8px] uppercase font-black tracking-widest text-[var(--ae6-primary)] mb-1">Asset Intelligence Report</div>
                  <p class="text-[10px] text-[var(--ae6-text-main)] font-medium leading-relaxed">
                    {{ selectedProperty.ai_insight || 'Property structural integrity verified. High-resolution documentation synchronized from global data networks.' }}
                  </p>
                </div>

                <div class="flex gap-4">
                  <button @click="router.push('/auth')" class="flex-1 bg-[var(--ae6-primary)] text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
                    Access Complete Listing
                  </button>
                  <button
                    v-if="!selectedProperty.is_enhanced"
                    @click="enhanceProperty(selectedProperty)"
                    :disabled="isEnhancing"
                    class="flex-1 bg-white border border-[var(--ae6-border)] text-[var(--ae6-text-main)] py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-bg-soft)] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap :size="14" class="text-[var(--ae6-primary)]" />
                    {{ isEnhancing ? 'Syncing...' : 'Enhance Data' }}
                  </button>
                  <button @click="closeQuickView" class="px-8 py-6 rounded-2xl border border-[var(--ae6-border)] text-[var(--ae6-text-main)] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-bg-soft)] transition-all">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
