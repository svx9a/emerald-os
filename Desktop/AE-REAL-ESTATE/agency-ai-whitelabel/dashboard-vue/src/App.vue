<script setup lang="ts">
defineOptions({
  name: 'AE6IntelligenceDashboard'
})
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ae6_kinetic from './utils/schemes/ae6_kinetic'
import {
  LayoutDashboard,
  Briefcase,
  Globe,
  Bot,
  LogOut,
  MapPin,
  Users,
  BedDouble,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  Bell,
  Settings,
  Wallet,
  Key,
  Upload,
  LogIn,
  FileText,
  BarChart3,
  Link,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Share2,
  Heart,
  Bed,
  Bath,
  Maximize,
  Phone,
  Mail,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  FileDown,
  RefreshCw,
  Database,
  Trash2,
  Sun,
  Moon,
  Calendar,
  Layers,
  CreditCard,
  MessageSquare,
  Zap,
  Settings2,
  Menu,
  X,
  Coffee,
  Send,
  Plus,
  Waves,
  Cpu,
  Dumbbell,
  Car,
  Leaf
} from 'lucide-vue-next'

// --- Types ---
type View = 'landing' | 'auth' | 'dashboard' | 'property-detail'
type Tab = 'overview' | 'portfolio' | 'marketplace' | 'intelligence' | 'leads' | 'inventory' | 'ops' | 'finance' | 'agent' | 'settings' | 'relax'

// --- State ---
const currentView = ref<View | 'property-detail'>('landing')
const activeTab = ref<Tab>('overview')
const selectedProperty = ref<any>(null)
const agentPrompt = ref('')
const isLoadingAgent = ref(false)
const isDark = ref(false)
const locale = ref<'en' | 'th' | 'zh'>('en')
const userLocation = ref<{lat: number, lng: number, address?: string} | null>(null)
const authId = ref('')
const authKey = ref('')
const isAuthenticating = ref(false)
const globalLoading = ref(false)
const globalError = ref<string | null>(null)
const isMobileMenuOpen = ref(false)

// --- Newsletter Sync State ---
/*
const subscriberEmail = ref('')
const isSubscribing = ref(false)
const subscribeStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

const _handleSubscribe = async () => {
  if (!subscriberEmail.value.trim() || isSubscribing.value) return

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(subscriberEmail.value)) {
    subscribeStatus.value = { type: 'error', message: 'Invalid Email Address' }
    setTimeout(() => subscribeStatus.value = null, 3000)
    return
  }

  isSubscribing.value = true

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: subscriberEmail.value,
        type: 'newsletter',
        tenantId: 'ae6_kinetic_01'
      })
    })

    if (!res.ok) throw new Error('Subscription Failed')

    subscribeStatus.value = { type: 'success', message: 'Subscription Confirmed' }
    subscriberEmail.value = ''
    setTimeout(() => subscribeStatus.value = null, 5000)
    fetchTasks()
  } catch (err) {
    subscribeStatus.value = { type: 'error', message: 'Subscription Failed' }
    setTimeout(() => subscribeStatus.value = null, 3000)
  } finally {
    isSubscribing.value = false
  }
}
*/

// --- Contact Form State ---
/*
const contactForm = ref({ email: '', message: '' })
const isSendingContact = ref(false)
const contactStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

const _handleContactSubmit = async () => {
  if (!contactForm.value.email.trim() || !contactForm.value.message.trim() || isSendingContact.value) return

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(contactForm.value.email)) {
    contactStatus.value = { type: 'error', message: 'Invalid Email Address' }
    setTimeout(() => contactStatus.value = null, 3000)
    return
  }

  isSendingContact.value = true

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: contactForm.value.email,
        message: contactForm.value.message,
        propertyId: selectedProperty.value?.id,
        tenantId: 'ae6_kinetic_01'
      })
    })

    if (!res.ok) throw new Error('Lead Capture Failed')

    contactStatus.value = { type: 'success', message: 'Message Sent Successfully' }
    contactForm.value = { email: '', message: '' }
    setTimeout(() => contactStatus.value = null, 5000)
    // Refresh tasks to show the new lead task if in management view
    fetchTasks()
  } catch (err) {
    contactStatus.value = { type: 'error', message: 'Failed to Send Message' }
    setTimeout(() => contactStatus.value = null, 3000)
  } finally {
    isSendingContact.value = false
  }
}
*/

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        console.log("AE6 Geolocation: Link Established", userLocation.value)

        // Reverse Geocoding for "Real Live" location name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`)
          const data = await res.json()
          if (data && data.display_name) {
            userLocation.value.address = data.address.city || data.address.town || data.address.state || data.address.country
            console.log("AE6 Intelligence: Location Identified:", userLocation.value.address)
          }
        } catch (err) {
          console.warn("AE6 Intelligence: Reverse Geocoding Failed", err)
        }
      },
      (error) => {
        console.warn("AE6 Geolocation: Signal Lost", error.message)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }
}

// Relax Mode State
const relaxInput = ref('')
const isRelaxLoading = ref(false)
const relaxMessages = ref<{ role: 'user' | 'agent', text: string, agent?: string, status?: string }[]>([
  {
    role: 'agent',
    text: "Operational Interface Online. Strategic AI agents are active. How can I assist with your asset management today?",
    agent: "Orchestrator"
  }
])

const executeRelaxCommand = async () => {
  if (!relaxInput.value.trim() || isRelaxLoading.value) return

  const userCommand = relaxInput.value
  relaxMessages.value.push({ role: 'user', text: userCommand })
  relaxInput.value = ''
  isRelaxLoading.value = true

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/relax/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: userCommand, tenantId: 'ae6_kinetic_01' })
    })
    const data = await res.json()

    if (data.success) {
        relaxMessages.value.push({
          role: 'agent',
          text: data.data.result,
          agent: data.data.agent,
          status: data.data.status
        })
        // Refresh dashboard data if properties or tasks might have changed
        fetchDashboardData()
        fetchTasks()
      } else {
      throw new Error(data.error || 'AE6 Orchestrator Connection Error')
    }
  } catch (err: any) {
    relaxMessages.value.push({
      role: 'agent',
      text: `System Error: ${err.message}. Re-establishing connection...`
    })
  } finally {
    isRelaxLoading.value = false
  }
}

// Auto-scroll Relax Messages
watch(relaxMessages, () => {
  nextTick(() => {
    const el = document.getElementById('relax-messages')
    if (el) el.scrollTop = el.scrollHeight
  })
}, { deep: true })

// --- Methods ---
const scrollToMarketplace = () => {
  showPublicMarketplace.value = true
  document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })
}

const viewPropertyDetail = (prop: any) => {
  selectedProperty.value = prop
  currentView.value = 'property-detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// --- Methods ---
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Property Upload Form State
const uploadStep = ref(1)
const isUploading = ref(false)
const uploadProgress = ref(0)
const propertyForm = ref({
  name: '',
  location: '',
  price: '',
  sqft: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  type: 'Villa',
  status: 'available'
})
const uploadedFiles = ref<{name: string, type: string, size: string}[]>([])

// Management Sub-tabs
const manageSubTab = ref<'upload' | 'analytics' | 'integrations'>('upload')

// Analytics Mock Data
const analyticsStats = ref([
  { label: 'Total Views', value: '12,842', trend: '+18%', color: '#3182bd' },
  { label: 'Inquiries', value: '428', trend: '+24%', color: '#6baed6' },
  { label: 'Conv. Rate', value: '3.2%', trend: '+0.5%', color: '#9ecae1' },
  { label: 'Avg. ROI', value: '8.4%', trend: '+1.2%', color: '#08519c' }
])

const messages = ref([
  { role: 'assistant', content: "Welcome to the Strategic Intelligence Concierge. How may I assist with your portfolio today?" }
])

const properties = ref<any[]>([])
const totalPropertiesCount = ref(0)
const stats = ref<any[]>([])
const showPublicMarketplace = ref(false)
const showMap = ref(false)
const isEnhancing = ref(false)
const enhancedProperties = ref<Set<string>>(new Set())

const enhanceProperty = async (prop: any) => {
  if (enhancedProperties.value.has(prop.id)) return

  isEnhancing.value = true
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Update property with "enhanced" image
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
        viewPropertyDetail(prop)
      })
      markersGroup?.addLayer(marker)
    }
  })

  // Fit bounds if markers exist
  if (properties.value.length > 0 && mapInstance.value) {
    const latLngs = properties.value.map(p => [p.lat, p.lng] as L.LatLngExpression)
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

// --- Methods ---
const iconMap: any = {
  Wallet,
  Key,
  TrendingUp
}

const fetchDashboardData = async () => {
  if (globalLoading.value) return // Prevent parallel sync collisions
  globalLoading.value = true
  globalError.value = null

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const tenantId = 'ae6_kinetic_01'

    // Atomic Parallel Fetching
    const housesUrl = new URL(`${apiBase}/api/houses`)
    housesUrl.searchParams.append('tenantId', tenantId)
    if (userLocation.value) {
      housesUrl.searchParams.append('lat', userLocation.value.lat.toString())
      housesUrl.searchParams.append('lng', userLocation.value.lng.toString())
    }

    const [housesRes, statsRes] = await Promise.all([
      fetch(housesUrl.toString()),
      fetch(`${apiBase}/api/stats?tenantId=${tenantId}`)
    ])

    if (!housesRes.ok || !statsRes.ok) throw new Error('AE6 Intelligence Node: Handshake Failed')

    const [housesData, statsData] = await Promise.all([
      housesRes.json(),
      statsRes.json()
    ])

    // Optimize Properties with Lat/Lng and Heroic Statuses
    const results = Array.isArray(housesData) ? housesData : (housesData.results || [])
    totalPropertiesCount.value = housesData.pagination?.total || results.length
    properties.value = results.map((h: any, i: number) => {
      return {
        ...h,
        // Fallback image if missing
        image_url: h.image_url || [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
        ][i % 2]
      }
    })

    if (Array.isArray(statsData)) {
      stats.value = statsData.map((s: any) => ({
        ...s,
        icon: iconMap[s.icon] || Wallet
      }))
    }

    // Dynamic ROI Analytics Optimization
    analyticsStats.value = [
      { label: 'Market Velocity', value: 'High Growth', trend: 'Bullish', color: ae6_kinetic(0.1) },
      { label: 'Active Pipeline', value: 'Institutional', trend: '+24%', color: ae6_kinetic(0.4) },
      { label: 'Asset Liquidity', value: 'Optimal', trend: 'Steady', color: ae6_kinetic(0.7) },
      { label: 'Projected Yield', value: '12.4%', trend: 'Optimized', color: ae6_kinetic(0.9) }
    ]
  } catch (err: any) {
    console.error("AE6 Intelligence Core: Optimization Fault:", err)
    globalError.value = "Connection Error: System re-connecting..."
  } finally {
    globalLoading.value = false
  }
}

const handleAgentCommand = async () => {
  if (!agentPrompt.value.trim()) return

  const userMsg = agentPrompt.value
  messages.value.push({ role: 'user', content: userMsg })
  agentPrompt.value = ''
  isLoadingAgent.value = true

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const response = await fetch(`${apiBase}/api/agent/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: userMsg, tenantId: 'ae6_kinetic_01' })
    })

    const data = await response.json()

    if (data.success) {
      let aiResponse = `**AE6 Core Response**\n\n`

      const query = (data.executedQuery || '').toUpperCase()
      if (query.includes('INSERT') || query.includes('UPDATE') || query.includes('DELETE')) {
        aiResponse += `System records updated. Synchronizing dashboard...\n`
        await Promise.all([fetchDashboardData(), fetchTasks()])
      }

      // Contextual Navigation Assistance
      const lowerMsg = userMsg.toLowerCase()
      const contextMaps = [
        { keys: ['lead', 'investor', 'customer'], tab: 'leads', note: 'Lead Management Node' },
        { keys: ['money', 'revenue', 'roi', 'finance', 'price'], tab: 'finance', note: 'Financial Analytics Node' },
        { keys: ['fix', 'task', 'maintain', 'ops', 'operation'], tab: 'ops', note: 'Operational Command' },
        { keys: ['predict', 'trend', 'future', 'forecast'], tab: 'intelligence', note: 'Predictive Intelligence' }
      ]

      for (const map of contextMaps) {
        if (map.keys.some(k => lowerMsg.includes(k))) {
          activeTab.value = map.tab as any
          aiResponse += `\n\n*Contextual Shift: Accessing ${map.note}...*`
          break
        }
      }

      if (data.data && data.data.length > 0) {
        aiResponse += `\n\nFound ${data.data.length} relevant records in the AE6 network.`
      } else if (!query.includes('INSERT')) {
        aiResponse += "\n\nCommand executed. The AE6 Core reports no matching historical data for this specific query."
      } else {
        aiResponse += "\n\nTask has been successfully logged into the agency queue."
      }

      messages.value.push({ role: 'assistant', content: aiResponse })
    } else {
      messages.value.push({ role: 'assistant', content: `**AE6 Core Error:** ${data.error}` })
    }
  } catch (err) {
    messages.value.push({ role: 'assistant', content: "Connection Lost. Please ensure the AI Service is active." })
  } finally {
    isLoadingAgent.value = false
  }
}

const tasks = ref<any[]>([])
const fetchTasks = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const res = await fetch(`${apiBase}/api/tasks?tenantId=ae6_kinetic_01`)
    if (!res.ok) throw new Error('Failed to synchronize with AE6 Task Queue')
    tasks.value = await res.json()
  } catch (err: any) {
    console.error("Failed to fetch tasks:", err)
    // We don't necessarily want to block the whole UI for tasks,
    // but we can log it to the global error if critical.
  }
}

onMounted(() => {
  getUserLocation()
  fetchDashboardData()
  fetchTasks()
})

watch(userLocation, () => {
  fetchDashboardData()
})

const translations = {
  en: {
    experience: 'Enterprise Ecosystem',
    overview: 'Portfolio Overview',
    portfolio: 'Asset Management',
    leads: 'Lead Intelligence',
    inventory: 'Asset Inventory',
    ops: 'Operations Center',
    finance: 'Financial Analytics',
    aiAgent: 'AI Orchestrator',
    settings: 'Configurations',
    marketplace: 'Asset Exchange',
    intelligence: 'Market Insights',
    enterPortal: 'Secure Authentication',
    initializing: 'Optimizing Enterprise Framework...',
    systemError: 'System Protocol Error',
    featuredAssets: 'Strategic Assets',
    globalMarketplace: 'Global Exchange',
    tropicalPortfolio: 'Asset Portfolio',
    viewAsset: 'Executive Summary',
    navigation: 'Portal Navigation',
    compliance: 'Governance & Compliance',
    contact: 'Strategic Contact',
    terms: 'Legal Framework',
    privacy: 'Data Protection',
    aml: 'Global Compliance Standards',
    cookies: 'Data Policy',
    allAssets: 'Total Inventory',
    featured: 'Priority Assets',
    grid: 'Gallery View',
    map: 'Spatial Analysis',
    relaxMode: 'Autonomous Operations',
    copilot: 'Operational Intelligence',
    morningBriefing: 'Market Intelligence Briefing',
    agentActive: 'Orchestrator Online',
    systemReady: 'Core Operational',
    typeCommand: 'Initiate autonomous command...',
    loadMore: 'Sync More Assets',
    allTypes: 'All Asset Classes',
    priceRange: 'Valuation Range',
    searchPlaceholder: 'Scan Market Coordinates...',
    showing: 'Synchronizing',
    of: 'of',
    premiumAssets: 'Institutional Assets',
    sortBy: 'Priority Matrix:',
    newestFirst: 'Latest Acquisitions',
    priceHighLow: 'Valuation: High to Low',
    priceLowHigh: 'Valuation: Low to High',
    maxRoi: 'Alpha Yield Potential',
    totalPrice: 'Asset Valuation',
    perSqm: 'Unit Cost',
    guests: 'Occupancy',
    beds: 'Units',
    sf: 'Area',
    backToMarketplace: 'Back to Marketplace',
    premiumAmenities: 'Premium Amenities',
    agentProfile: 'Agent Profile',
    investmentInsights: 'Investment Insights',
    propertyFeatures: 'Property Features',
    contactAgent: 'Contact Agent',
    bookViewing: 'Book a Viewing',
    similarProperties: 'Similar Properties',
    viewDetails: 'View Details',
    marketValue: 'Market Value',
    rentalYield: 'Rental Yield',
    capitalAppreciation: 'Capital Appreciation',
    locationScore: 'Location Score',
    floorPlan: 'Floor Plan',
    virtualTour: 'Virtual Tour',
    description: 'Description',
    bathrooms: 'Bathrooms',
    featuredAsset: 'Featured Asset',
    sqftLabel: 'sqft',
    seniorConsultant: 'AE6 Senior Consultant',
    highScore: 'HIGH (9.4/10)',
    appreciationRate: '+12.4% / yr',
      investmentSummary: 'This asset is in the top 5% of regional properties for capital preservation and growth potential.',
      photosCount: '1 / 12 Photos',
      morePhotos: '+ 9 More',
      privatePool: 'Private Pool',
      smartHome: 'Smart Home',
      security247: 'Security 24/7',
      gym: 'Gym',
      parking: 'Parking',
      garden: 'Garden',
      email: 'Email',
      message: 'Message',
      sending: 'Sending...',
      submitInquiry: 'Submit Inquiry',
      globalOperations: 'Global Operations',
      isoCertified: 'ISO 27001 Certified',
      gdprCompliant: 'GDPR Compliant',
      villa: 'Luxury Villa',
      condo: 'Premium Condominium',
      land: 'Strategic Land Plot',
      penthouse: 'Sky Penthouse',
      estate: 'Private Estate',
      socialChannels: 'Social Channels',
      strategicIntegrations: 'Strategic Integrations',
      brandDescription: 'AE6 Kinetic Ecosystem - Empowering the next generation of real estate intelligence through autonomous AI orchestrators and global asset exchange protocols.',
    },
  th: {
    experience: 'ประสบการณ์',
    overview: 'ภาพรวม',
    portfolio: 'พอร์ตโฟลิโอ',
    leads: 'จัดการลูกค้า',
    inventory: 'คลังทรัพย์สิน',
    ops: 'ฝ่ายปฏิบัติการ',
    finance: 'การเงิน',
    aiAgent: 'เอเจนต์ AI',
    settings: 'การตั้งค่า',
    marketplace: 'ตลาดอสังหาฯ',
    intelligence: 'แนวโน้มตลาด',
    enterPortal: 'เข้าสู่ระบบ',
    initializing: 'กำลังเริ่มต้นระบบ Enterprise...',
    systemError: 'ข้อผิดพลาดของระบบ',
    featuredAssets: 'ทรัพย์สินแนะนำ AE6',
    globalMarketplace: 'ตลาดอสังหาฯ ทั่วโลก',
    tropicalPortfolio: 'พอร์ตโฟลิโอเขตร้อน',
    viewAsset: 'ดูรายละเอียด',
    navigation: 'เมนูหลัก',
    compliance: 'ข้อกำหนดและกฎระเบียบ',
    contact: 'ติดต่อเรา',
    terms: 'เงื่อนไขการให้บริการ',
    privacy: 'นโยบายความเป็นส่วนตัว',
    aml: 'มาตรฐาน AML/KYC',
    cookies: 'นโยบายคุกกี้',
    allAssets: 'ทรัพย์สินทั้งหมด',
    featured: 'แนะนำ',
    grid: 'ตาราง',
    map: 'แผนที่',
    relaxMode: 'โหมดจัดการเอเจนต์',
    copilot: 'ระบบจัดการอัจฉริยะ',
    morningBriefing: 'สรุปข่าวเช้านี้',
    agentActive: 'เอเจนต์กำลังทำงาน',
    systemReady: 'ระบบพร้อมใช้งาน',
    typeCommand: 'พิมพ์คำสั่งสำหรับเอเจนต์ของคุณ...',
    loadMore: 'โหลดทรัพย์สินเพิ่มเติม',
    allTypes: 'ทุกประเภท',
    priceRange: 'ช่วงราคา',
    searchPlaceholder: 'ค้นหาทำเลหรือชื่อโครงการ...',
    showing: 'กำลังแสดง',
    of: 'จากทั้งหมด',
    premiumAssets: 'ทรัพย์สินระดับพรีเมียม',
    sortBy: 'เรียงตาม:',
    newestFirst: 'ใหม่ล่าสุด',
    priceHighLow: 'ราคาสูง-ต่ำ',
    priceLowHigh: 'ราคาต่ำ-สูง',
    maxRoi: 'ผลตอบแทนสูงสุด',
    totalPrice: 'ราคารวม',
    perSqm: 'ราคาต่อ ตร.ม.',
    guests: 'ผู้เข้าพัก',
    beds: 'ห้องนอน',
    sf: 'พื้นที่',
    backToMarketplace: 'กลับสู่ตลาดอสังหาฯ',
    premiumAmenities: 'สิ่งอำนวยความสะดวกระดับพรีเมียม',
    agentProfile: 'ข้อมูลเอเจนต์',
    investmentInsights: 'ข้อมูลเชิงลึกการลงทุน',
    propertyFeatures: 'คุณสมบัติของทรัพย์สิน',
    contactAgent: 'ติดต่อเอเจนต์',
    bookViewing: 'นัดหมายเข้าชม',
    similarProperties: 'ทรัพย์สินที่คล้ายกัน',
    viewDetails: 'ดูรายละเอียด',
    marketValue: 'มูลค่าตลาด',
    rentalYield: 'ผลตอบแทนจากการเช่า',
    capitalAppreciation: 'การเพิ่มขึ้นของมูลค่าทุน',
    locationScore: 'คะแนนทำเล',
    floorPlan: 'แปลนบ้าน',
    virtualTour: 'ทัวร์เสมือนจริง',
    description: 'รายละเอียด',
    bathrooms: 'ห้องน้ำ',
    featuredAsset: 'ทรัพย์สินแนะนำ',
    sqftLabel: 'ตร.ฟ.',
    seniorConsultant: 'ที่ปรึกษาอาวุโส AE6',
    highScore: 'สูง (9.4/10)',
    appreciationRate: '+12.4% / ปี',
    investmentSummary: 'ทรัพย์สินนี้อยู่ในกลุ่ม 5% แรกของภูมิภาคที่มีศักยภาพในการรักษามูลค่าทุนและการเติบโต',
    photosCount: '1 / 12 รูปภาพ',
    morePhotos: '+ 9 เพิ่มเติม',
    privatePool: 'สระว่ายน้ำส่วนตัว',
    smartHome: 'สมาร์ทโฮม',
    security247: 'ระบบรักษาความปลอดภัย 24 ชม.',
    gym: 'ฟิตเนส',
    parking: 'ที่จอดรถ',
      garden: 'สวน',
      email: 'อีเมล',
      message: 'ข้อความ',
      sending: 'กำลังส่ง...',
      submitInquiry: 'ส่งคำถาม',
      globalOperations: 'การดำเนินงานทั่วโลก',
      isoCertified: 'ได้รับการรับรอง ISO 27001',
      gdprCompliant: 'เป็นไปตามมาตรฐาน GDPR',
      villa: 'วิลล่าหรู',
      condo: 'คอนโดมิเนียมระดับพรีเมียม',
      land: 'ที่ดินทำเลทอง',
      penthouse: 'เพนท์เฮาส์ลอยฟ้า',
      estate: 'คฤหาสน์ส่วนตัว',
      socialChannels: 'ช่องทางโซเชียล',
      strategicIntegrations: 'การรวมเชิงกลยุทธ์',
      brandDescription: 'AE6 Kinetic Ecosystem - เสริมสร้างศักยภาพแห่งโลกอสังหาริมทรัพย์ยุคใหม่ด้วยระบบ AI อัจฉริยะและการแลกเปลี่ยนทรัพย์สินทั่วโลก',
    },
  zh: {
    experience: '极致体验',
    overview: '概览',
    portfolio: '投资组合',
    leads: '线索管理',
    inventory: '库存',
    ops: '运营',
    finance: '财务',
    aiAgent: 'AI 代理',
    settings: '设置',
    marketplace: '房产市场',
    intelligence: '市场趋势',
    enterPortal: '进入门户',
    initializing: '正在初始化企业系统...',
    systemError: '系统错误',
    featuredAssets: '精选 AE6 资产',
    globalMarketplace: '全球房产市场',
    tropicalPortfolio: '热带投资组合',
    viewAsset: '查看资产',
    navigation: '导航',
    compliance: '合规性',
    contact: '联系我们',
    terms: '服务条款',
    privacy: '隐私协议',
    aml: '反洗钱标准',
    cookies: 'Cookie 政策',
    allAssets: '全部资产',
    featured: '精选',
    grid: '网格',
    map: '地图',
    relaxMode: '代理编排',
    copilot: '副驾驶编排器',
    morningBriefing: '早间简报',
    agentActive: '代理活跃中',
    systemReady: '系统就绪',
    typeCommand: '为您的代理输入命令...',
    loadMore: '加载更多资产',
    allTypes: '所有房产类型',
    priceRange: '价格范围',
    searchPlaceholder: '搜索地点或项目...',
    showing: '正在显示',
    of: '共',
    premiumAssets: '优质资产',
    sortBy: '排序方式:',
    newestFirst: '最新发布',
    priceHighLow: '价格从高到低',
    priceLowHigh: '价格从低到高',
    maxRoi: '最高投资回报',
    totalPrice: '总价',
    perSqm: '单价 (每平米)',
    guests: '可入住人数',
    beds: '卧室',
    sf: '面积',
    backToMarketplace: '返回市场',
    premiumAmenities: '高级设施',
    agentProfile: '代理人资料',
    investmentInsights: '投资见解',
    propertyFeatures: '房产特点',
    contactAgent: '联系代理人',
    bookViewing: '预约看房',
    similarProperties: '相似房产',
    viewDetails: '查看详情',
    marketValue: '市场价值',
    rentalYield: '租金收益率',
    capitalAppreciation: '资本增值',
    locationScore: '位置评分',
    floorPlan: '户型图',
    virtualTour: '虚拟看房',
    description: '房产描述',
    bathrooms: '浴室',
    featuredAsset: '精选资产',
    sqftLabel: '平方英尺',
    seniorConsultant: 'AE6 高级顾问',
    highScore: '高 (9.4/10)',
    appreciationRate: '+12.4% / 年',
    investmentSummary: '该资产在资本保值和增长潜力方面位居该地区前 5%。',
    photosCount: '1 / 12 照片',
    morePhotos: '+ 9 更多',
    privatePool: '私人泳池',
    smartHome: '智能家居',
    security247: '24/7 安保',
    gym: '健身房',
    parking: '停车场',
    garden: '花园',
    email: '电子邮箱',
    message: '信息',
    sending: '正在发送...',
    submitInquiry: '提交咨询',
    globalOperations: '全球运营',
    isoCertified: 'ISO 27001 认证',
    gdprCompliant: '符合 GDPR 标准',
    villa: '豪华别墅',
    condo: '高端公寓',
    land: '战略土地',
    penthouse: '空中阁楼',
    estate: '私人庄园',
    socialChannels: '社交渠道',
    strategicIntegrations: '战略集成',
    brandDescription: 'AE6 Kinetic Ecosystem - 通过自主 AI 协调器和全球资产交换协议，赋能下一代房地产智能。',
  }
}

const t = (key: keyof typeof translations['en']) => translations[locale.value][key]

const handleLogin = async () => {
  if (!authId.value.trim()) return
  isAuthenticating.value = true

  // Simulation: Accept any ID starting with ae6_ or containing agency
  setTimeout(() => {
    if (authId.value.toLowerCase().includes('ae6') || authId.value.toLowerCase().includes('agency')) {
      currentView.value = 'dashboard'
    } else {
      alert("Invalid Agency Identifier. Access Denied by AE6 Security Protocol.")
    }
    isAuthenticating.value = false
  }, 1000)
}

// --- Management Methods ---
const simulateUpload = () => {
  isUploading.value = true
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 5
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      isUploading.value = false
      uploadedFiles.value.push({
        name: `property_image_${uploadedFiles.value.length + 1}.jpg`,
        type: 'image/jpeg',
        size: '2.4 MB'
      })
    }
  }, 50)
}

const submitProperty = async () => {
  isUploading.value = true
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'
    const response = await fetch(`${apiBase}/api/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...propertyForm.value,
        tenantId: 'ae6_kinetic_01',
        price: parseFloat(propertyForm.value.price),
        guests: parseInt(propertyForm.value.bedrooms) * 2 || 4,
        beds: parseInt(propertyForm.value.bedrooms) || 2,
        image_url: uploadedFiles.value[0]?.name
          ? `${apiBase}/api/media/${uploadedFiles.value[0].name}`
          : 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
      })
    })

    const data = await response.json()
    if (data.success) {
      uploadStep.value = 4 // Move to success step
      await fetchDashboardData()
    }
  } catch (err) {
    console.error("Failed to create property:", err)
  } finally {
    isUploading.value = false
  }
}

const resetForm = () => {
  propertyForm.value = {
    name: '',
    location: '',
    price: '',
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    type: 'Villa',
    status: 'available'
  }
  uploadStep.value = 1
  uploadedFiles.value = []
}

const nextStep = () => {
  if (uploadStep.value < 3) {
    uploadStep.value++
  }
}

const prevStep = () => {
  if (uploadStep.value > 1) uploadStep.value--
}

</script>

<template>
  <div class="min-h-screen bg-[var(--ae6-bg)] text-[var(--ae6-text-main)] font-sans selection:bg-[var(--ae6-primary)] selection:text-white transition-colors duration-700">
    <!-- Skip to Content for Accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-[var(--ae6-primary)] focus:text-white focus:px-6 focus:py-4 focus:rounded-b-2xl focus:left-1/2 focus:-translate-x-1/2 focus:shadow-2xl transition-all font-bold uppercase tracking-widest text-xs">
      Skip to Content
    </a>

    <!-- Global SVG Definitions for Logos -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
      <defs>
        <linearGradient id="ae6-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:var(--ae6-primary);stop-opacity:1" />
          <stop offset="100%" style="stop-color:var(--ae6-primary-hover);stop-opacity:1" />
        </linearGradient>
        <filter id="ae6-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood flood-color="var(--ae6-primary)" flood-opacity="0.3" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>
    </svg>

    <link rel="preconnect" href="https://images.unsplash.com" />
    <link rel="dns-prefetch" href="https://images.unsplash.com" />
    <Transition name="fade" mode="out-in">
      <!-- 1. LANDING PAGE -->
      <div v-if="currentView === 'landing'" key="landing" class="relative overflow-hidden bg-[var(--ae6-bg)]">
        <!-- Mobile Menu Overlay -->
        <Transition name="fade">
          <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[100] lg:hidden">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-xl" @click="isMobileMenuOpen = false"></div>
            <div class="absolute right-0 top-0 h-full w-[280px] bg-[var(--ae6-bg)] border-l border-[var(--ae6-border)] shadow-2xl p-8 flex flex-col">
              <div class="flex justify-between items-center mb-12">
                <span class="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-primary)]">Navigation</span>
                <button @click="isMobileMenuOpen = false" class="p-2 text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Dashboard Content inside Mobile Menu (Removed unreachable check for build stability) -->
              <div v-if="false" class="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-8">
                <button v-for="tab in [
                  { id: 'overview', icon: LayoutDashboard, label: t('overview') },
                  { id: 'portfolio', icon: Briefcase, label: t('portfolio') },
                  { id: 'marketplace', icon: Globe, label: t('marketplace') },
                  { id: 'intelligence', icon: TrendingUp, label: t('intelligence') },
                  { id: 'leads', icon: Users, label: t('leads') },
                  { id: 'inventory', icon: Layers, label: t('inventory') },
                  { id: 'ops', icon: CheckCircle2, label: t('ops') },
                  { id: 'finance', icon: CreditCard, label: t('finance') },
                  { id: 'agent', icon: Bot, label: t('aiAgent') },
                  { id: 'relax', icon: Coffee, label: t('relaxMode') },
                  { id: 'settings', icon: Settings, label: t('settings') }
                ] as const" :key="tab.id"
                  @click="activeTab = tab.id as Tab; isMobileMenuOpen = false"
                  :class="[
                    'w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300',
                    activeTab === tab.id ? 'bg-[var(--ae6-primary)] text-white shadow-lg' : 'text-[var(--ae6-text-muted)] hover:bg-[var(--ae6-bg-soft)]'
                  ]"
                >
                  <component :is="tab.icon" :size="18" />
                  <span class="text-[10px] uppercase tracking-[0.2em] font-bold">{{ tab.label }}</span>
                </button>
              </div>

              <!-- General Navigation -->
              <div class="space-y-6">
                <button @click="currentView = 'landing'; isMobileMenuOpen = false" class="block w-full text-left text-sm font-bold uppercase tracking-widest hover:text-[var(--ae6-primary)] transition-colors">{{ t('experience') }}</button>
                <button @click="scrollToMarketplace(); isMobileMenuOpen = false" class="block w-full text-left text-sm font-bold uppercase tracking-widest hover:text-[var(--ae6-primary)] transition-colors">{{ t('marketplace') }}</button>
                <button v-if="true" @click="currentView = 'auth'; isMobileMenuOpen = false" class="block w-full text-left text-sm font-bold uppercase tracking-widest text-[var(--ae6-primary)] transition-colors">{{ t('enterPortal') }}</button>
                <button v-else @click="currentView = 'landing'; isMobileMenuOpen = false" class="block w-full text-left text-sm font-bold uppercase tracking-widest text-red-500 transition-colors">Exit Dashboard</button>
              </div>

              <div class="mt-auto pt-8 border-t border-[var(--ae6-border)]">
                <div class="flex gap-4">
                  <button @click="toggleTheme" class="p-3 bg-[var(--ae6-bg-soft)] rounded-xl border border-[var(--ae6-border)]">
                    <Sun v-if="isDark" class="w-4 h-4" />
                    <Moon v-else class="w-4 h-4" />
                  </button>
                  <button @click="locale = locale === 'en' ? 'th' : (locale === 'th' ? 'zh' : 'en')" class="flex-1 bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] rounded-xl px-4 text-[10px] uppercase font-bold tracking-widest">
                    {{ locale.toUpperCase() }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <nav class="container mx-auto px-6 py-8 flex justify-between items-center relative z-50" role="navigation" aria-label="Main Navigation">
          <div class="flex items-center gap-6 group cursor-pointer" @click="currentView = 'landing'" role="button" tabindex="0" aria-label="AE6 Home" @keydown.enter="currentView = 'landing'">
            <div class="w-32 h-10 bg-transparent flex items-center justify-center transition-all hover:scale-105 group/logo relative">
              <!-- Atomic Glow Effect -->
              <div class="absolute inset-0 bg-[var(--ae6-primary)]/10 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700"></div>

              <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" class="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(var(--ae6-primary-rgb),0.3)]">
                <g transform="translate(10, 25)">
                  <!-- AE6 LOGO: Precision Engineered -->
                  <g class="transition-all duration-700">
                    <!-- A (Kinetic Primary) -->
                    <path d="M50 0 L100 100 H75 L50 45 L25 100 H0 Z" fill="url(#ae6-logo-gradient)" class="animate-pulse-subtle" />
                    <!-- E (Institutional Core) -->
                    <path d="M110 0 H180 V20 H130 V40 H170 V60 H130 V80 H180 V100 H110 Z" fill="var(--ae6-text-main)" />
                    <!-- 6 (Stencil Numeric) -->
                    <path d="M200 0 H270 V20 H220 V40 H270 V100 H200 V0 Z M220 60 H250 V80 H220 Z" fill="url(#ae6-logo-gradient)" fill-rule="evenodd" />
                  </g>
                </g>
              </svg>
            </div>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)]">
            <a href="#" class="hover:text-[var(--ae6-text-main)] transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ae6-primary)] rounded">{{ t('experience') }}</a>
            <a href="#marketplace" class="hover:text-[var(--ae6-text-main)] transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ae6-primary)] rounded">{{ t('marketplace') }}</a>
          </div>

          <div class="flex items-center gap-4 md:gap-8">
            <!-- Real-time Location Badge -->
            <div v-if="userLocation" class="hidden xl:flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[var(--ae6-border)] animate-pulse">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span class="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--ae6-text-main)]">
                Live_{{ userLocation.address?.toUpperCase() || 'LOCATION_VERIFIED' }}
              </span>
            </div>

            <!-- Language Switcher -->
            <button @click="locale = locale === 'en' ? 'th' : (locale === 'th' ? 'zh' : 'en')"
              class="text-[10px] uppercase tracking-widest font-black text-[var(--ae6-text-muted)] hover:text-[var(--ae6-text-main)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ae6-primary)] rounded px-2 py-1 min-w-[32px]"
              :aria-label="`Switch to ${locale === 'en' ? 'Thai' : (locale === 'th' ? 'Chinese' : 'English')}`"
            >
              {{ locale.toUpperCase() }}
            </button>
    <button @click="toggleTheme"
      class="p-3 rounded-full bg-[var(--ae6-bg-soft)] text-[var(--ae6-text-muted)] hover:scale-110 hover:text-[var(--ae6-primary)] transition-all focus:ring-2 focus:ring-[var(--ae6-primary)] focus:outline-none border border-[var(--ae6-border)]"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Sun v-if="isDark" :size="20" />
      <Moon v-else :size="20" />
    </button>
            <button @click="currentView = 'auth'"
              class="hidden md:flex items-center gap-2 bg-[var(--ae6-text-main)] text-[var(--ae6-bg)] px-8 py-3 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:opacity-80 transition-all duration-300 shadow-xl active:scale-95 focus:ring-2 focus:ring-[var(--ae6-primary)] focus:ring-offset-2 focus:outline-none"
              :aria-label="t('enterPortal')"
            >
              <LogIn :size="14" />
              {{ t('enterPortal') }}
            </button>
            <!-- Mobile Menu Toggle -->
            <button @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="lg:hidden p-3 text-[var(--ae6-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--ae6-primary)] rounded-full"
              :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
              :aria-expanded="isMobileMenuOpen"
            >
              <Menu v-if="!isMobileMenuOpen" :size="24" />
              <X v-else :size="24" />
            </button>
          </div>
        </nav>

        <!-- Hero Section -->
        <main id="main-content" class="relative min-h-[70vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
              class="w-full h-full object-cover scale-100 brightness-[0.9] dark:brightness-[0.7]"
            />
            <!-- Background Overlay -->
            <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
          </div>

          <div class="relative z-10 text-center px-6 max-w-5xl float-slow">
            <div class="mb-8 md:mb-12">
              <h1 class="text-4xl md:text-7xl font-black text-white uppercase tracking-[-0.05em] leading-[0.9] mb-6">
                Next-Gen<br/><span class="text-[var(--ae6-primary)]">Real Estate</span><br/>Protocol
              </h1>
              <p class="text-white/80 text-xs md:text-sm uppercase tracking-[0.4em] font-bold max-w-2xl mx-auto leading-relaxed">
                Powered by AE6 Atomic Core for superhuman property exploration
              </p>
            </div>
            <div class="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
              <button @click="scrollToMarketplace"
                class="w-full md:w-auto group bg-white text-black px-10 py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-primary)] hover:text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl active:scale-95"
              >
                Explore Marketplace
                <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button @click="currentView = 'auth'"
                class="w-full md:w-auto group glass-card !bg-white/10 text-white px-10 py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:!bg-white/20 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-md active:scale-95"
              >
                Enter Portal
              </button>
            </div>
          </div>
        </main>

        <!-- Intelligence Stats (Sales Assets) -->
        <section class="border-y border-[var(--ae6-border)] bg-[var(--ae6-bg-soft)] py-12 md:py-20 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 pointer-events-none" :style="{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--ae6-primary) 1px, transparent 0)', backgroundSize: '40px 40px' }"></div>
          <div class="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            <div class="text-center group">
              <div class="text-3xl md:text-5xl font-black text-[var(--ae6-text-main)] mb-2 tracking-tighter group-hover:text-[var(--ae6-primary)] transition-colors">1.2B+</div>
              <div class="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] font-black">Assets Managed</div>
            </div>
            <div class="text-center group border-l border-[var(--ae6-border)] md:border-l-0">
              <div class="text-3xl md:text-5xl font-black text-[var(--ae6-text-main)] mb-2 tracking-tighter group-hover:text-[var(--ae6-primary)] transition-colors">98.4%</div>
              <div class="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] font-black">AI Accuracy</div>
            </div>
            <div class="text-center group border-t border-[var(--ae6-border)] md:border-t-0 md:border-l border-[var(--ae6-border)] pt-8 md:pt-0">
              <div class="text-3xl md:text-5xl font-black text-[var(--ae6-text-main)] mb-2 tracking-tighter group-hover:text-[var(--ae6-primary)] transition-colors">450+</div>
              <div class="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] font-black">Elite Agencies</div>
            </div>
            <div class="text-center group border-t border-l border-[var(--ae6-border)] md:border-t-0 pt-8 md:pt-0">
              <div class="text-3xl md:text-5xl font-black text-[var(--ae6-text-main)] mb-2 tracking-tighter group-hover:text-[var(--ae6-primary)] transition-colors">24/7</div>
              <div class="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] font-black">Core Uptime</div>
            </div>
          </div>
        </section>

        <!-- Feature Matrix (Sales Assets) -->
        <section class="py-20 md:py-32 container mx-auto px-6">
          <div class="flex flex-col items-center text-center mb-16 md:mb-24">
            <h2 class="text-[10px] uppercase tracking-[0.5em] text-[var(--ae6-primary)] font-black mb-4">Core Competencies</h2>
            <h3 class="text-3xl md:text-6xl font-bold tracking-tighter uppercase max-w-4xl leading-[0.9]">The Gold Standard for <span class="italic text-[var(--ae6-primary)]">Real Estate Technology</span></h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div class="space-y-6 group">
              <div class="w-16 h-16 bg-[var(--ae6-bg-soft)] rounded-2xl flex items-center justify-center text-[var(--ae6-primary)] group-hover:bg-[var(--ae6-primary)] group-hover:text-white transition-all duration-500 shadow-xl border border-[var(--ae6-border)]">
                <Zap :size="32" />
              </div>
              <h4 class="text-xl font-bold uppercase tracking-tight">Advanced Visual Analytics</h4>
              <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--ae6-text-muted)] leading-loose">AI-driven image processing upgrades standard listings to professional-grade digital assets automatically.</p>
            </div>
            <div class="space-y-6 group">
              <div class="w-16 h-16 bg-[var(--ae6-bg-soft)] rounded-2xl flex items-center justify-center text-[var(--ae6-primary)] group-hover:bg-[var(--ae6-primary)] group-hover:text-white transition-all duration-500 shadow-xl border border-[var(--ae6-border)]">
                <Globe :size="32" />
              </div>
              <h4 class="text-xl font-bold uppercase tracking-tight">Real-time Market Intelligence</h4>
              <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--ae6-text-muted)] leading-loose">Strategic market tracking across 50+ global corridors with high-precision data for asset valuation.</p>
            </div>
            <div class="space-y-6 group">
              <div class="w-16 h-16 bg-[var(--ae6-bg-soft)] rounded-2xl flex items-center justify-center text-[var(--ae6-primary)] group-hover:bg-[var(--ae6-primary)] group-hover:text-white transition-all duration-500 shadow-xl border border-[var(--ae6-border)]">
                <Users :size="32" />
              </div>
              <h4 class="text-xl font-bold uppercase tracking-tight">Enterprise Automation</h4>
              <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--ae6-text-muted)] leading-loose">Institutional-grade automation for lead management, contract optimization, and portfolio strategy.</p>
            </div>
          </div>
        </section>

        <!-- Public Marketplace / Featured Assets Section -->
        <section class="max-w-7xl mx-auto px-6 py-12 md:py-32 border-t border-[var(--ae6-border)]" id="marketplace">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div class="max-w-xl">
              <h2 class="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--ae6-primary)] font-bold mb-3 md:mb-4">{{ t('tropicalPortfolio') }}</h2>
              <h3 class="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-tight text-[var(--ae6-text-main)]">
                {{ showPublicMarketplace ? t('globalMarketplace') : t('featuredAssets') }}
              </h3>
            </div>
            <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full md:w-auto">
              <!-- DDProperty Inspired Filters -->
                <div v-if="showPublicMarketplace" class="flex flex-wrap gap-2 md:gap-3 items-center w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                <div class="relative group shrink-0">
                  <select class="appearance-none bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-full py-2.5 px-6 md:py-3 md:px-8 text-[8px] uppercase tracking-widest font-bold focus:border-[var(--ae6-primary)] outline-none cursor-pointer transition-all hover:bg-[var(--ae6-bg-soft)]">
                    <option>{{ t('allTypes') }}</option>
                    <option>Villa</option>
                    <option>Condo</option>
                    <option>Land</option>
                  </select>
                </div>
                <div class="relative group shrink-0">
                  <select class="appearance-none bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-full py-2.5 px-6 md:py-3 md:px-8 text-[8px] uppercase tracking-widest font-bold focus:border-[var(--ae6-primary)] outline-none cursor-pointer transition-all hover:bg-[var(--ae6-bg-soft)]">
                    <option>{{ t('priceRange') }}</option>
                    <option>$1M - $5M</option>
                    <option>$5M - $10M</option>
                    <option>$10M+</option>
                  </select>
                </div>
                <div class="relative group flex-1 md:flex-none">
                  <input type="text" :placeholder="t('searchPlaceholder')" class="bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-full py-2.5 px-6 md:py-3 md:px-8 text-[8px] uppercase tracking-widest font-bold focus:border-[var(--ae6-primary)] outline-none transition-all w-full md:w-48 md:group-hover:w-64" />
                </div>
              </div>
              <div class="flex gap-3 w-full md:w-auto justify-between md:justify-start">
                <button v-if="showPublicMarketplace" @click="showMap = !showMap" class="glass-card flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[8px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-2 hover:bg-[var(--ae6-primary)] hover:text-white transition-all border border-[var(--ae6-border)]">
                  <component :is="showMap ? LayoutDashboard : Globe" :size="12" />
                  {{ showMap ? t('grid') : t('map') }}
                </button>
                <button @click="showPublicMarketplace = !showPublicMarketplace" class="text-[8px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors flex items-center gap-2 group whitespace-nowrap">
                  {{ showPublicMarketplace ? t('featured') : t('allAssets') }}
                  <ChevronRight class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <!-- Marketplace Component -->
          <div v-if="showPublicMarketplace" class="animate-in fade-in duration-700">
            <MarketplaceView @view-detail="viewPropertyDetail" />
          </div>

          <!-- Marketplace Grid View (Landing) -->
          <div v-else-if="!showMap" class="space-y-12">
            <!-- Property Count & Sort -->
            <div class="flex justify-between items-center border-b border-[var(--ae6-border)] pb-6">
              <div class="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--ae6-text-muted)]">
                {{ t('showing') }} <span class="text-[var(--ae6-text-main)]">{{ showPublicMarketplace ? properties.length : Math.min(properties.length, 4) }}</span> {{ t('of') }} <span class="text-[var(--ae6-text-main)]">{{ totalPropertiesCount }}</span> {{ t('premiumAssets') }}
              </div>
              <div class="flex items-center gap-4">
                <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">{{ t('sortBy') }}</span>
                <select class="bg-transparent border-none text-[8px] uppercase tracking-widest font-black text-[var(--ae6-text-main)] focus:ring-0 cursor-pointer">
                  <option>{{ t('newestFirst') }}</option>
                  <option>{{ t('priceHighLow') }}</option>
                  <option>{{ t('priceLowHigh') }}</option>
                  <option>{{ t('maxRoi') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-700">
               <div v-for="prop in (showPublicMarketplace ? properties : properties.slice(0, 4))" :key="prop.id"
                 class="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden interactive-card group shadow-lg flex flex-col h-full border border-[var(--ae6-border)] cursor-pointer"
                 @click="viewPropertyDetail(prop)"
               >
                 <div class="h-40 md:h-48 relative overflow-hidden">
                   <img :src="prop.image_url" :alt="`Luxury property: ${prop.name}`" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" loading="lazy" />

                   <!-- Data Optimized Badge -->
                   <div v-if="prop.is_enhanced" class="absolute top-3 left-3 px-3 py-1 rounded-full bg-[var(--ae6-primary)] text-white text-[6px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse z-10">
                     Data Optimized
                   </div>

                   <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                   <!-- Technical Scanning Overlay -->
                   <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-2 bg-black/40">
                     <button
                       @click.stop="enhanceProperty(prop)"
                       :disabled="isEnhancing"
                       class="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full text-[7px] uppercase tracking-[0.2em] font-black hover:bg-[var(--ae6-primary)] transition-all"
                     >
                       {{ isEnhancing ? 'Analyzing...' : 'Visual Insights' }}
                     </button>
                   </div>
                   <div class="absolute top-3 right-3 md:top-4 md:right-4 px-3 py-1.5 rounded-full glass-card !bg-[var(--ae6-bg-soft)]/90 text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--ae6-primary)] shadow-lg">
                     {{ prop.status }}
                   </div>
                 </div>
                 <div class="p-5 md:p-6 flex-1 flex flex-col">
                   <div class="mb-3 md:mb-4">
                     <div class="text-[8px] uppercase tracking-[0.3em] text-[var(--ae6-primary)] font-bold mb-1 flex items-center gap-1.5">
                       <MapPin :size="8" />
                       {{ prop.location }}
                     </div>
                     <h4 class="text-base md:text-lg font-bold uppercase tracking-tight text-[var(--ae6-text-main)] group-hover:text-[var(--ae6-primary)] transition-colors line-clamp-1">{{ prop.name }}</h4>
                   </div>

                   <div class="flex justify-between items-end mb-3 md:mb-4 mt-auto">
                     <div class="flex flex-col">
                       <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-bold">{{ t('totalPrice') }}</div>
                       <div class="text-lg md:text-xl font-bold text-[var(--ae6-text-main)] tracking-tighter">${{ prop.price.toLocaleString() }}</div>
                     </div>
                     <div class="text-right flex flex-col">
                       <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-bold">{{ t('perSqm') }}</div>
                       <div class="text-[10px] md:text-xs font-bold text-[var(--ae6-primary)]">${{ Math.round(prop.price / (prop.sqft || 2000)).toLocaleString() }}</div>
                     </div>
                   </div>

                   <div class="grid grid-cols-3 py-3 md:py-4 border-y border-[var(--ae6-border)] mb-4 gap-2">
                     <div class="flex flex-col items-center gap-1 border-r border-[var(--ae6-border)]">
                       <span class="text-[8px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.guests || 4 }} {{ t('guests') }}</span>
                     </div>
                     <div class="flex flex-col items-center gap-1 border-r border-[var(--ae6-border)]">
                       <span class="text-[8px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.beds || 3 }} {{ t('beds') }}</span>
                     </div>
                     <div class="flex flex-col items-center gap-1">
                       <span class="text-[8px] uppercase font-bold text-[var(--ae6-text-main)]">{{ Math.round(prop.sqft || 1500) }} {{ t('sf') }}</span>
                     </div>
                   </div>

                   <button
                     @click.stop="viewPropertyDetail(prop)"
                     class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] text-[var(--ae6-text-main)] py-2.5 md:py-3 rounded-xl font-bold uppercase text-[8px] tracking-[0.3em] hover:bg-[var(--ae6-primary)] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm active:scale-95"
                   >
                     {{ t('viewAsset') }}
                   </button>
                 </div>
               </div>
             </div>

            <!-- DDProperty Style Load More -->
            <div v-if="showPublicMarketplace" class="flex flex-col items-center gap-6 pt-12">
              <div class="w-full max-w-xs bg-[var(--ae6-border)] h-1 rounded-full overflow-hidden">
                <div class="bg-[var(--ae6-primary)] h-full w-1/3 animate-pulse"></div>
              </div>
              <button
                @click="currentView = 'auth'"
                class="group bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] px-12 py-5 rounded-full font-black uppercase text-[10px] tracking-[0.4em] hover:bg-[var(--ae6-primary)] hover:text-white hover:border-transparent transition-all duration-500 flex items-center gap-4 shadow-xl"
              >
                {{ t('loadMore') }}
                <Plus class="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </div>

          <!-- Real-time Map View (Leaflet) -->
          <div v-else class="h-[500px] md:h-[700px] glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-700 border border-[var(--ae6-border)]">
            <div ref="mapContainer" class="w-full h-full z-0"></div>

            <!-- Map Controls -->
            <div class="absolute top-10 right-10 flex flex-col gap-4 z-10">
              <button @click="mapInstance?.zoomIn()" class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)] font-bold">
                <Plus :size="20" />
              </button>
              <button @click="mapInstance?.zoomOut()" class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)]">
                <ChevronLeft class="rotate-[-90deg]" :size="20" />
              </button>
              <button class="glass-card p-4 rounded-2xl text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all shadow-xl border border-[var(--ae6-border)]">
                <Layers :size="20" />
              </button>
            </div>

            <!-- Floating Legend -->
            <div class="absolute bottom-10 left-10 glass-card p-8 rounded-[2rem] shadow-2xl border border-[var(--ae6-border)] max-w-sm z-10 pointer-events-none">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-3 h-3 rounded-full bg-[var(--ae6-primary)] animate-pulse"></div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-main)]">Real-time Market Activity</span>
              </div>
              <p class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed uppercase tracking-widest">Showing {{ properties.length }} active assets in the regional investment corridor.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- 1.5. PROPERTY DETAIL VIEW (DDProperty Style) -->
      <div v-else-if="currentView === 'property-detail' && selectedProperty" key="property-detail" class="min-h-screen bg-[var(--ae6-bg)] pb-24">
        <!-- Navigation Header -->
        <nav class="sticky top-0 z-[60] glass-card !bg-[var(--ae6-bg)]/80 backdrop-blur-xl border-b border-[var(--ae6-border)] py-4 px-6 flex items-center justify-between">
          <button @click="currentView = 'landing'" class="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-[var(--ae6-text-main)] hover:text-[var(--ae6-primary)] transition-all group">
            <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {{ t('backToMarketplace') || 'Back to Marketplace' }}
          </button>
          <div class="flex items-center gap-4">
            <button class="p-3 rounded-xl bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-all">
              <Share2 :size="16" />
            </button>
            <button class="p-3 rounded-xl bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] text-[var(--ae6-text-muted)] hover:text-red-500 transition-all">
              <Heart :size="16" />
            </button>
          </div>
        </nav>

        <!-- Gallery Section -->
        <section class="container mx-auto px-6 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px] md:h-[600px]">
            <div class="lg:col-span-8 relative overflow-hidden rounded-[2rem] border border-[var(--ae6-border)] group shadow-2xl">
              <img :src="selectedProperty.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
              <div class="absolute bottom-6 left-6 px-4 py-2 glass-card !bg-black/40 text-white text-[8px] uppercase tracking-widest font-bold backdrop-blur-md rounded-full border border-white/20">
                {{ t('photosCount') }}
              </div>
            </div>
            <div class="lg:col-span-4 grid grid-rows-2 gap-6">
              <div class="relative overflow-hidden rounded-[2rem] border border-[var(--ae6-border)] shadow-xl">
                <img :src="selectedProperty.image_url" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div class="relative overflow-hidden rounded-[2rem] border border-[var(--ae6-border)] shadow-xl">
                <img :src="selectedProperty.image_url" class="w-full h-full object-cover blur-sm hover:blur-none transition-all duration-700" />
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group">
                  <span class="text-white text-xs uppercase tracking-[0.4em] font-black group-hover:scale-110 transition-transform">{{ t('morePhotos') }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Content -->
        <section class="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- Left Column -->
          <div class="lg:col-span-8 space-y-12">
            <!-- Basic Info -->
            <div class="space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-4 py-1.5 rounded-full bg-[var(--ae6-primary)] text-white text-[8px] font-black uppercase tracking-widest">{{ t('featuredAsset') }}</span>
                <span class="px-4 py-1.5 rounded-full glass-card border border-[var(--ae6-border)] text-[var(--ae6-primary)] text-[8px] font-black uppercase tracking-widest">{{ selectedProperty.status }}</span>
              </div>
              <h1 class="text-3xl md:text-5xl font-black text-[var(--ae6-text-main)] uppercase tracking-tighter leading-tight">{{ selectedProperty.name }}</h1>
              <div class="flex items-center gap-2 text-[var(--ae6-text-muted)] text-xs uppercase tracking-widest font-bold">
                <MapPin :size="14" class="text-[var(--ae6-primary)]" />
                {{ selectedProperty.location }}
              </div>
              <div class="text-4xl md:text-6xl font-black text-[var(--ae6-primary)] tracking-tighter">
                ${{ selectedProperty.price.toLocaleString() }}
              </div>
            </div>

            <!-- Key Features Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-[var(--ae6-border)]">
              <div class="space-y-2">
                <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-black">{{ t('beds') }}</div>
                <div class="flex items-center gap-3">
                  <Bed :size="20" class="text-[var(--ae6-primary)]" />
                  <span class="text-xl font-bold text-[var(--ae6-text-main)]">{{ selectedProperty.beds || 3 }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-black">{{ t('bathrooms') }}</div>
                <div class="flex items-center gap-3">
                  <Bath :size="20" class="text-[var(--ae6-primary)]" />
                  <span class="text-xl font-bold text-[var(--ae6-text-main)]">2</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-black">{{ t('sf') }}</div>
                <div class="flex items-center gap-3">
                  <Maximize :size="20" class="text-[var(--ae6-primary)]" />
                  <span class="text-xl font-bold text-[var(--ae6-text-main)]">{{ selectedProperty.sqft || 1500 }} <span class="text-xs uppercase">{{ t('sqftLabel') }}</span></span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="text-[8px] uppercase tracking-widest text-[var(--ae6-text-muted)] font-black">{{ t('perSqm') }}</div>
                <div class="flex items-center gap-3">
                  <Zap :size="20" class="text-[var(--ae6-primary)]" />
                  <span class="text-xl font-bold text-[var(--ae6-text-main)]">${{ Math.round(selectedProperty.price / (selectedProperty.sqft || 1500)).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-6">
              <h2 class="text-xl font-black uppercase tracking-[0.2em] text-[var(--ae6-text-main)]">{{ t('description') }}</h2>
              <p class="text-[var(--ae6-text-muted)] text-sm leading-relaxed uppercase tracking-widest font-medium">
                {{ selectedProperty.description || 'Experience the pinnacle of luxury living in this architectural masterpiece. This property represents a unique fusion of high-performance design and organic materials, optimized by AE6 Intelligence for maximum lifestyle ROI.' }}
              </p>
            </div>

            <!-- Amenities -->
            <div class="space-y-6">
              <h2 class="text-xl font-black uppercase tracking-[0.2em] text-[var(--ae6-text-main)]">{{ t('premiumAmenities') }}</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div v-for="amenity in [
                  { key: 'privatePool', icon: Waves },
                  { key: 'smartHome', icon: Cpu },
                  { key: 'security247', icon: ShieldCheck },
                  { key: 'gym', icon: Dumbbell },
                  { key: 'parking', icon: Car },
                  { key: 'garden', icon: Leaf }
                ]" :key="amenity.key" class="flex items-center gap-4 p-4 glass-card border border-[var(--ae6-border)] rounded-2xl group hover:border-[var(--ae6-primary)]/30 transition-all">
                  <component :is="amenity.icon" :size="16" class="text-[var(--ae6-primary)] group-hover:scale-110 transition-transform" />
                  <span class="text-[10px] uppercase tracking-widest font-bold text-[var(--ae6-text-main)]">{{ t(amenity.key as keyof typeof translations['en']) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column (Sticky) -->
          <div class="lg:col-span-4">
            <div class="sticky top-32 space-y-8">
              <!-- Agent Card -->
              <div class="glass-card p-8 rounded-[2.5rem] border border-[var(--ae6-border)] shadow-2xl relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[var(--ae6-primary)]/5 blur-3xl rounded-full"></div>

                <div class="flex items-center gap-6 mb-8">
                  <div class="w-20 h-20 rounded-2xl bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=ae6-agent" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 class="text-lg font-black text-[var(--ae6-text-main)] uppercase tracking-tight">{{ t('agentProfile') }}</h4>
                    <p class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-primary)]">{{ t('seniorConsultant') }}</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <button class="w-full bg-[var(--ae6-primary)] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-primary-hover)] transition-all shadow-xl active:scale-95">
                    {{ t('contactAgent') }}
                  </button>
                  <button class="w-full bg-[var(--ae6-bg-soft)] border border-[var(--ae6-border)] text-[var(--ae6-text-main)] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-bg)] transition-all active:scale-95">
                    {{ t('bookViewing') }}
                  </button>
                </div>

                <div class="mt-8 pt-8 border-t border-[var(--ae6-border)] flex items-center justify-center gap-8">
                  <button class="text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors"><Phone :size="18" /></button>
                  <button class="text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors"><Mail :size="18" /></button>
                  <button class="text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors"><MessageSquare :size="18" /></button>
                </div>
              </div>

              <!-- Investment Insights Card -->
              <div class="glass-card p-8 rounded-[2.5rem] border border-[var(--ae6-border)] bg-gradient-to-br from-[var(--ae6-primary)]/5 to-transparent">
                <h4 class="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--ae6-primary)] mb-6 flex items-center gap-3">
                  <TrendingUp :size="12" />
                  {{ t('investmentInsights') }}
                </h4>
                <div class="space-y-6">
                  <div class="flex justify-between items-center">
                    <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">{{ t('locationScore') }}</span>
                    <span class="text-[10px] font-black text-green-500">{{ t('highScore') }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[8px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">{{ t('capitalAppreciation') }}</span>
                    <span class="text-[10px] font-black text-[var(--ae6-text-main)]">{{ t('appreciationRate') }}</span>
                  </div>
                  <div class="w-full bg-[var(--ae6-border)] h-1.5 rounded-full overflow-hidden">
                    <div class="bg-[var(--ae6-primary)] h-full w-[85%]"></div>
                  </div>
                  <p class="text-[7px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)] leading-relaxed">
                    {{ t('investmentSummary') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 2. AUTHENTICATION -->
      <div v-else-if="currentView === 'auth'" key="auth" class="min-h-screen flex items-center justify-center px-6 bg-[var(--ae6-bg)] relative overflow-hidden">
        <div class="w-full max-w-md glass-card !bg-[var(--ae6-surface)]/80 p-12 rounded-none border-t-4 border-t-[var(--ae6-primary)] relative overflow-hidden group border-[var(--ae6-border)] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
          <div class="text-center mb-10">
            <div class="w-48 h-20 flex items-center justify-center mx-auto mb-8 transition-all duration-700 group-hover:scale-110 relative">
              <!-- Atomic Glow Effect -->
              <div class="absolute inset-0 bg-[var(--ae6-primary)]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" class="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(var(--ae6-primary-rgb),0.3)]">
                <g transform="translate(10, 25)">
                  <!-- AE6 LOGO: Precision Engineered -->
                  <g class="transition-all duration-700">
                    <!-- A (Kinetic Primary) -->
                    <path d="M50 0 L100 100 H75 L50 45 L25 100 H0 Z" fill="url(#ae6-logo-gradient)" class="animate-pulse-subtle" />
                    <!-- E (Institutional Core) -->
                    <path d="M110 0 H180 V20 H130 V40 H170 V60 H130 V80 H180 V100 H110 Z" fill="var(--ae6-text-main)" />
                    <!-- 6 (Stencil Numeric) -->
                    <path d="M200 0 H270 V20 H220 V40 H270 V100 H200 V0 Z M220 60 H250 V80 H220 Z" fill="url(#ae6-logo-gradient)" fill-rule="evenodd" />
                  </g>
                </g>
              </svg>
            </div>
            <h2 class="text-4xl font-black mb-2 tracking-tighter text-[var(--ae6-text-main)] uppercase font-orbitron italic kinetic-text">AE6 CORE</h2>
            <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.5em]">Core Operational Terminal</p>
          </div>

          <div class="space-y-8">
            <div class="space-y-3">
              <label class="text-[10px] uppercase tracking-[0.3em] text-[var(--ae6-primary)] font-bold ml-1">Agency Identifier</label>
              <div class="relative group/input">
                <User class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)] group-focus-within/input:text-[var(--ae6-primary)] transition-colors" :size="20" />
                <input v-model="authId" @keyup.enter="handleLogin" type="text" placeholder="ae6_admin_01" class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[1.5rem] py-5 pl-14 pr-6 focus:border-[var(--ae6-primary)] focus:outline-none transition-all placeholder:text-[var(--ae6-text-muted)]/40 text-[var(--ae6-text-main)]" />
              </div>
            </div>
            <div class="space-y-3">
              <label class="text-[10px] uppercase tracking-[0.3em] text-[var(--ae6-primary)] font-bold ml-1">Security Key</label>
              <div class="relative group/input">
                <Lock class="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)] group-focus-within/input:text-[var(--ae6-primary)] transition-colors" :size="20" />
                <input v-model="authKey" @keyup.enter="handleLogin" type="password" placeholder="••••••••" class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[1.5rem] py-5 pl-14 pr-6 focus:border-[var(--ae6-primary)] focus:outline-none transition-all placeholder:text-[var(--ae6-text-muted)]/40 text-[var(--ae6-text-main)]" />
              </div>
            </div>
            <div class="pt-4">
              <button @click="handleLogin" :disabled="isAuthenticating" class="w-full bg-gradient-to-r from-[var(--ae6-primary)] to-[var(--ae6-primary-hover)] text-white py-6 rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.3em] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                <LogIn v-if="!isAuthenticating" :size="18" />
                {{ isAuthenticating ? 'Authorizing...' : 'Initialize Session' }}
              </button>
            </div>
            <button @click="currentView = 'landing'" class="w-full text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[var(--ae6-primary)] transition-colors">
              Return to Surface
            </button>
          </div>
        </div>
      </div>

      <!-- 3. DASHBOARD -->
      <div v-else key="dashboard" class="flex h-screen overflow-hidden bg-[var(--ae6-bg)]">
        <!-- Sidebar -->
        <aside class="w-80 bg-[var(--ae6-surface)] border-r border-[var(--ae6-border)] flex flex-col p-8 relative z-30">
          <div class="flex items-center gap-4 mb-16 px-2">
            <div class="w-32 h-12 bg-transparent flex items-center justify-center transition-all hover:scale-110 group/logo relative">
              <!-- Atomic Glow Effect -->
              <div class="absolute inset-0 bg-[var(--ae6-primary)]/10 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700"></div>
              <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" class="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(var(--ae6-primary-rgb),0.3)]">
                <g transform="translate(10, 25)">
                  <!-- AE6 LOGO: Precision Engineered -->
                  <g class="transition-all duration-700">
                    <!-- A (Kinetic Primary) -->
                    <path d="M50 0 L100 100 H75 L50 45 L25 100 H0 Z" fill="url(#ae6-logo-gradient)" class="animate-pulse-subtle" />
                    <!-- E (Institutional Core) -->
                    <path d="M110 0 H180 V20 H130 V40 H170 V60 H130 V80 H180 V100 H110 Z" fill="var(--ae6-text-main)" />
                    <!-- 6 (Stencil Numeric) -->
                    <path d="M200 0 H270 V20 H220 V40 H270 V100 H200 V0 Z M220 60 H250 V80 H220 Z" fill="url(#ae6-logo-gradient)" fill-rule="evenodd" />
                  </g>
                </g>
              </svg>
            </div>
            <div class="flex flex-col text-[var(--ae6-text-main)]">
              <span class="text-2xl font-bold tracking-[-0.05em] uppercase leading-none font-orbitron italic kinetic-text">AE6</span>
              <span class="text-[8px] text-[var(--ae6-text-muted)] uppercase tracking-[0.5em] font-bold mt-2">Design Bureau</span>
            </div>
          </div>

          <nav class="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            <button v-for="tab in [
              { id: 'overview', icon: LayoutDashboard, label: t('overview') },
              { id: 'portfolio', icon: Briefcase, label: t('portfolio') },
              { id: 'marketplace', icon: Globe, label: t('marketplace') },
              { id: 'intelligence', icon: TrendingUp, label: t('intelligence') },
              { id: 'leads', icon: Users, label: t('leads') },
              { id: 'inventory', icon: Layers, label: t('inventory') },
              { id: 'ops', icon: CheckCircle2, label: t('ops') },
              { id: 'finance', icon: CreditCard, label: t('finance') },
              { id: 'agent', icon: Bot, label: t('aiAgent') },
              { id: 'relax', icon: Coffee, label: t('relaxMode') },
              { id: 'settings', icon: Settings, label: t('settings') }
            ] as const" :key="tab.id"
              @click="activeTab = tab.id as Tab"
              :class="[
                'w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden focus:ring-2 focus:ring-[var(--ae6-primary)]/20 focus:outline-none',
                activeTab === tab.id ? 'bg-[var(--ae6-primary)] text-white shadow-2xl shadow-blue-500/20' : 'hover:bg-[var(--ae6-bg)] text-[var(--ae6-text-muted)] hover:text-[var(--ae6-text-main)]'
              ]"
              :aria-label="`Navigate to ${tab.id} section`"
              :aria-current="activeTab === tab.id ? 'page' : undefined"
            >
              <div v-if="activeTab === tab.id" class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <component :is="tab.icon" :size="22" :class="activeTab === tab.id ? '' : 'group-hover:scale-110 transition-transform'" />
              <span class="text-[10px] uppercase tracking-[0.3em] font-bold relative z-10">{{ tab.label }}</span>
            </button>
          </nav>

          <div class="mt-auto space-y-6 pt-8 border-t border-[var(--ae6-border)]">
            <div class="glass-card !bg-[var(--ae6-bg)] border border-[var(--ae6-border)] p-6 rounded-[2rem] group cursor-pointer hover:border-[var(--ae6-primary)]/30 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-[var(--ae6-surface)] overflow-hidden ring-2 ring-[var(--ae6-border)] transition-transform group-hover:scale-110">
                  <img src="https://i.pravatar.cc/150?u=me" alt="Me" />
                </div>
                <div class="text-[var(--ae6-text-main)]">
                  <div class="text-[10px] font-bold uppercase tracking-widest leading-none">Alex Sterling</div>
                  <div class="text-[8px] text-[var(--ae6-text-muted)] uppercase tracking-widest mt-1">Agency Head</div>
                </div>
                <LogOut @click="currentView = 'landing'" class="ml-auto text-[var(--ae6-text-muted)] hover:text-red-500 transition-colors cursor-pointer" :size="18" />
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto bg-[var(--ae6-bg)] p-12 custom-scrollbar relative">
          <header class="flex justify-between items-center mb-16 relative z-10">
            <div>
              <h2 class="text-5xl font-bold tracking-tighter mb-3 uppercase text-[var(--ae6-text-main)] kinetic-text">{{ activeTab }}</h2>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-[var(--ae6-primary)]"></div>
                <span class="text-[10px] text-[var(--ae6-text-muted)] uppercase tracking-[0.4em] font-bold">System Operational</span>
              </div>
            </div>
            <div class="flex gap-4">
              <button @click="toggleTheme" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-4 rounded-2xl text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-all active:scale-90 shadow-sm">
                <Sun v-if="isDark" :size="20" />
                <Moon v-else :size="20" />
              </button>
              <button class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-4 rounded-2xl text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-all active:scale-90 shadow-sm">
                <Bell :size="20" />
              </button>
              <button class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-4 rounded-2xl text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-all active:scale-90 shadow-sm">
                <Settings :size="20" />
              </button>
            </div>
          </header>

          <Transition name="fade" mode="out-in">
            <!-- Tab Contents -->
            <div :key="activeTab">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="space-y-12 animate-in fade-in duration-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div v-for="(stat, idx) in stats" :key="idx" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-10 rounded-[2.5rem] interactive-card group shadow-lg">
                    <div class="flex justify-between items-start mb-8">
                      <div class="p-5 bg-[var(--ae6-primary)]/10 rounded-2xl text-[var(--ae6-primary)] group-hover:bg-[var(--ae6-primary)] group-hover:text-white transition-all duration-500">
                        <component :is="stat.icon" :size="28" />
                      </div>
                      <div class="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold">
                        <TrendingUp :size="12" /> +12%
                      </div>
                    </div>
                    <div class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-[0.4em] font-bold mb-3">{{ stat.label }}</div>
                    <div class="text-5xl font-bold tracking-tighter text-[var(--ae6-text-main)]">{{ stat.value }}</div>
                  </div>
                </div>

                <!-- Core Infrastructure Status -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div v-for="infra in [
                    { label: 'Enterprise Security', status: 'Active Protection', icon: '/assets/shield-neon.svg', color: 'text-blue-500' },
                    { label: 'AI Analysis', status: 'Optimized Intelligence', icon: '/assets/cpu-neon.svg', color: 'text-purple-500' },
                    { label: 'System Performance', status: 'Peak Performance', icon: '/assets/zap-neon.svg', color: 'text-yellow-500' }
                  ]" :key="infra.label" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-8 rounded-[2rem] flex items-center gap-6 group hover:border-[var(--ae6-primary)]/50 transition-all duration-500">
                    <div class="w-16 h-16 bg-[var(--ae6-bg-soft)] rounded-2xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-[var(--ae6-border)]">
                      <img :src="infra.icon" class="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] mb-1">{{ infra.label }}</div>
                      <div class="text-lg font-bold uppercase tracking-tight text-[var(--ae6-text-main)] flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        {{ infra.status }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <!-- Market Velocity Chart -->
                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 overflow-hidden relative shadow-xl group">
                    <div class="absolute inset-0 bg-[var(--ae6-bg)] transition-colors duration-700"></div>
                    <div class="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                      <TrendingUp :size="180" class="text-[var(--ae6-text-main)]" />
                    </div>
                    <div class="relative z-10">
                      <div class="flex justify-between items-center mb-12">
                        <div>
                          <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-2">Market Velocity</h3>
                          <p class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-widest font-bold">Real-time performance metrics</p>
                        </div>
                        <div class="flex gap-3">
                          <button v-for="t in ['24H', '7D', '1M']" :key="t"
                            :class="[
                              'px-6 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all',
                              t === '7D' ? 'bg-[var(--ae6-primary)] text-white shadow-lg' : 'bg-[var(--ae6-bg)] text-[var(--ae6-text-muted)] hover:bg-[var(--ae6-surface)]'
                            ]">
                            {{ t }}
                          </button>
                        </div>
                      </div>
                      <div class="h-64 flex items-end gap-2 px-4">
                        <div v-for="n in 12" :key="n"
                          class="flex-1 rounded-t-xl transition-all duration-1000 hover:brightness-125 cursor-pointer relative group/bar"
                          :style="{
                            height: `${Math.random() * 80 + 20}%`,
                            backgroundColor: ae6_kinetic(n/12)
                          }">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Real-time Task Feed -->
                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-12 rounded-[3rem] shadow-xl overflow-hidden relative">
                    <div class="flex justify-between items-center mb-10">
                      <div>
                        <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-2">Agency Task Feed</h3>
                        <p class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-widest font-bold">Automated Agent Operations</p>
                      </div>
                      <button @click="fetchTasks" class="p-3 rounded-xl bg-[var(--ae6-primary)]/10 text-[var(--ae6-primary)] hover:bg-[var(--ae6-primary)] hover:text-white transition-all">
                        <RefreshCw :size="18" />
                      </button>
                    </div>
                    <div class="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      <div v-for="task in tasks" :key="task.id" class="flex items-center gap-6 p-6 rounded-[2rem] bg-[var(--ae6-bg)] border border-[var(--ae6-border)] hover:border-[var(--ae6-primary)]/30 transition-all group">
                        <div class="p-4 rounded-2xl bg-[var(--ae6-surface)] shadow-sm text-[var(--ae6-primary)] group-hover:scale-110 transition-transform">
                          <component :is="task.task_type === 'viewing' ? Key : task.task_type === 'maintenance' ? Settings : FileText" :size="20" />
                        </div>
                        <div class="flex-1">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-primary)]">{{ task.task_type }}</span>
                            <span class="text-[8px] text-[var(--ae6-text-muted)] font-bold">{{ new Date(task.created_at).toLocaleTimeString() }}</span>
                          </div>
                          <p class="text-xs font-medium text-[var(--ae6-text-main)] leading-tight">{{ task.description }}</p>
                        </div>
                        <div class="px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest" :class="task.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'">
                          {{ task.status }}
                        </div>
                      </div>
                      <div v-if="tasks.length === 0" class="text-center py-20">
                        <Bot :size="48" class="mx-auto text-[var(--ae6-text-muted)]/20 mb-4" />
                        <p class="text-[10px] uppercase tracking-widest font-bold text-[var(--ae6-text-muted)]">No pending operational tasks.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Portfolio Tab -->
              <div v-if="activeTab === 'portfolio'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
                <div v-for="prop in properties" :key="prop.id" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[2.5rem] overflow-hidden interactive-card group">
                  <div class="h-72 relative overflow-hidden">
                    <img :src="prop.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div class="absolute inset-0 bg-gradient-to-t from-[var(--ae6-bg)]/80 via-transparent to-transparent"></div>
                    <div class="absolute top-6 right-6 px-4 py-2 rounded-full glass-card !bg-[var(--ae6-bg)]/90 text-[10px] font-bold uppercase tracking-[0.2em]" :class="prop.status === 'available' ? 'text-green-600' : 'text-[var(--ae6-primary)]'">
                      {{ prop.status }}
                    </div>
                  </div>
                  <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                      <div>
                        <h3 class="text-xl font-bold tracking-tight mb-2 uppercase text-[var(--ae6-text-main)]">{{ prop.name }}</h3>
                        <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <MapPin :size="12" class="text-[var(--ae6-primary)]" /> {{ prop.location }}
                        </p>
                      </div>
                      <div class="text-right">
                        <div class="text-[var(--ae6-primary)] font-bold text-2xl tracking-tighter">${{ prop.price }}</div>
                        <div class="text-[8px] text-[var(--ae6-text-muted)] uppercase tracking-widest font-bold">Per Night</div>
                      </div>
                    </div>
                    <div class="flex justify-between py-6 border-y border-[var(--ae6-border)] mb-8">
                      <div class="flex items-center gap-3">
                        <Users :size="16" class="text-[var(--ae6-text-muted)]" />
                        <span class="text-[10px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.guests }} Guests</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <BedDouble :size="16" class="text-[var(--ae6-text-muted)]" />
                        <span class="text-[10px] uppercase font-bold text-[var(--ae6-text-main)]">{{ prop.beds }} Beds</span>
                      </div>
                    </div>
                    <button class="w-full bg-[var(--ae6-primary)] text-white hover:brightness-110 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95">
                      Manage Asset
                    </button>
                  </div>
                </div>
              </div>

              <!-- Marketplace Tab -->
              <div v-if="activeTab === 'marketplace'" class="space-y-12 animate-in fade-in duration-700">
                <div class="flex gap-4 overflow-x-auto pb-6 custom-scrollbar no-scrollbar">
                  <button v-for="filter in ['All Assets', 'Beachfront', 'Mountain', 'Urban', 'Resorts']" :key="filter"
                    class="px-8 py-3 rounded-full border border-[var(--ae6-border)] bg-[var(--ae6-surface)] text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap hover:border-[var(--ae6-primary)] hover:text-[var(--ae6-primary)] transition-all shadow-sm active:scale-95 text-[var(--ae6-text-muted)]">
                    {{ filter }}
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div v-for="prop in properties" :key="prop.id"
                    @click="viewPropertyDetail(prop)"
                    class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[2.5rem] overflow-hidden interactive-card group cursor-pointer"
                  >
                    <div class="h-56 relative overflow-hidden">
                      <img :src="prop.image_url" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                      <div class="absolute inset-0 bg-[var(--ae6-primary)]/10 group-hover:bg-transparent transition-colors duration-700"></div>
                    </div>
                    <div class="p-8">
                      <h4 class="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-[var(--ae6-text-main)] group-hover:text-[var(--ae6-primary)] transition-colors">{{ prop.name }}</h4>
                      <button
                        @click.stop="viewPropertyDetail(prop)"
                        class="w-full border-2 border-[var(--ae6-primary)]/30 text-[var(--ae6-primary)] py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--ae6-primary)] hover:text-white transition-all shadow-lg hover:shadow-[var(--ae6-primary)]/20"
                      >
                        {{ t('viewAsset') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Intelligence Tab -->
              <div v-if="activeTab === 'intelligence'" class="space-y-12 animate-in fade-in duration-700">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div class="lg:col-span-2 glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 overflow-hidden relative group">
                    <div class="absolute top-0 right-0 p-12 opacity-5">
                      <TrendingUp :size="150" class="text-[var(--ae6-text-main)]" />
                    </div>
                    <div class="relative z-10">
                      <h3 class="text-3xl font-bold uppercase tracking-tighter mb-8 text-[var(--ae6-text-main)]">Predictive Market Velocity</h3>
                      <div class="h-80 flex items-end gap-3 px-4">
                        <div v-for="n in 24" :key="n"
                          class="flex-1 rounded-t-lg transition-all duration-1000 hover:brightness-125"
                          :style="{
                            height: `${Math.random() * 60 + 30}%`,
                            backgroundColor: ae6_kinetic(n/24)
                          }">
                        </div>
                      </div>
                      <div class="flex justify-between mt-8 text-[8px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">
                        <span>Q1 2025</span>
                        <span>Q2 2025</span>
                        <span>Q3 2025</span>
                        <span>Q4 2025</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-10">
                    <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[2.5rem] p-10 interactive-card">
                      <div class="flex items-center gap-6 mb-8">
                        <div class="p-4 bg-orange-500/10 text-orange-500 rounded-2xl">
                          <Sparkles :size="24" />
                        </div>
                        <div>
                          <h4 class="text-sm font-bold uppercase tracking-widest text-[var(--ae6-text-main)]">AI Forecast</h4>
                          <p class="text-[8px] font-bold uppercase tracking-widest text-orange-500">Bullish Sentiment</p>
                        </div>
                      </div>
                      <div class="text-4xl font-bold tracking-tighter text-[var(--ae6-text-main)]">+24.5%</div>
                      <p class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed mt-4">AE6 Analytics predicts a significant surge in luxury villa demand in the Phuket-Bang Tao corridor over the next 180 days.</p>
                    </div>

                    <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[2.5rem] p-10 interactive-card">
                      <div class="flex items-center gap-6 mb-8">
                        <div class="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
                          <Globe :size="24" />
                        </div>
                        <div>
                          <h4 class="text-sm font-bold uppercase tracking-widest text-[var(--ae6-text-main)]">Global Flow</h4>
                          <p class="text-[8px] font-bold uppercase tracking-widest text-purple-500">Capital Influx</p>
                        </div>
                      </div>
                      <div class="text-4xl font-bold tracking-tighter text-[var(--ae6-text-main)]">$1.2B</div>
                      <p class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed mt-4">Foreign direct investment in AE6-managed assets has reached a new quarterly peak, primarily driven by European syndicates.</p>
                    </div>
                  </div>
                </div>

                <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 overflow-hidden">
                  <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-12">Market Sentiment Heatmap</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <div v-for="area in ['Phuket', 'Bangkok', 'Koh Samui', 'Pattaya', 'Chiang Mai', 'Hua Hin']" :key="area" class="p-8 rounded-[2rem] bg-[var(--ae6-bg)] border border-[var(--ae6-border)] text-center group hover:border-[var(--ae6-primary)] transition-all">
                      <div class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)] mb-4">{{ area }}</div>
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--ae6-primary)] to-[var(--ae6-primary-hover)] mx-auto flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {{ Math.floor(Math.random() * 20 + 80) }}%
                      </div>
                      <div class="mt-4 text-[8px] font-bold uppercase tracking-widest text-green-500">High Growth</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Leads & CRM Tab -->
              <div v-if="activeTab === 'leads'" class="space-y-12 animate-in fade-in duration-700">
                <div class="flex justify-between items-center mb-12">
                  <div class="flex gap-4">
                    <button class="bg-[var(--ae6-primary)] text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                      Add New Lead
                    </button>
                    <button class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-primary)] hover:text-white transition-all text-[var(--ae6-text-muted)]">
                      Import CSV
                    </button>
                  </div>
                  <div class="relative">
                    <input type="text" placeholder="Search leads..." class="bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-2xl py-4 pl-12 pr-6 text-[10px] uppercase tracking-widest font-bold focus:border-[var(--ae6-primary)] outline-none w-80 transition-all text-[var(--ae6-text-main)]" />
                    <Users class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ae6-text-muted)]" :size="16" />
                  </div>
                </div>

                <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] overflow-hidden">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-[var(--ae6-border)] bg-[var(--ae6-bg)]/50">
                        <th class="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">Lead Identity</th>
                        <th class="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">Interest Level</th>
                        <th class="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">Preferred Type</th>
                        <th class="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">Engagement</th>
                        <th class="p-8 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)]">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--ae6-border)]">
                      <tr v-for="lead in [
                        { name: 'Xavier DuPont', email: 'xavier@global.com', score: 92, type: 'Ultra-Luxury Villa', status: 'Hot' },
                        { name: 'Mei Lin', email: 'mei@asia-invest.cn', score: 85, type: 'Beachfront Condo', status: 'Warm' },
                        { name: 'James Sterling', email: 'j.sterling@london-re.uk', score: 78, type: 'Penthouse', status: 'Warm' },
                        { name: 'Sofia Rossi', email: 's.rossi@milano.it', score: 95, type: 'Private Island', status: 'Hot' },
                        { name: 'Hiroshi Tanaka', email: 'tanaka@tokyo-dev.jp', score: 64, type: 'Commercial Node', status: 'Cold' }
                      ]" :key="lead.name" class="hover:bg-[var(--ae6-bg)]/30 transition-colors group">
                        <td class="p-8">
                          <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--ae6-primary)]/20 to-[var(--ae6-primary-hover)]/20 flex items-center justify-center text-[var(--ae6-primary)] font-bold text-xs">
                              {{ lead.name.split(' ').map(n => n[0]).join('') }}
                            </div>
                            <div>
                              <div class="text-sm font-bold text-[var(--ae6-text-main)] mb-1">{{ lead.name }}</div>
                              <div class="text-[8px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">{{ lead.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="p-8">
                          <div class="flex items-center gap-3">
                            <div class="flex-1 h-1.5 bg-[var(--ae6-border)] rounded-full overflow-hidden max-w-[100px]">
                              <div class="h-full bg-[var(--ae6-primary)] rounded-full" :style="{ width: `${lead.score}%` }"></div>
                            </div>
                            <span class="text-[10px] font-bold text-[var(--ae6-text-main)]">{{ lead.score }}%</span>
                          </div>
                        </td>
                        <td class="p-8">
                          <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-main)]">{{ lead.type }}</span>
                        </td>
                        <td class="p-8">
                          <span :class="[
                            'px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest',
                            lead.status === 'Hot' ? 'bg-orange-500/10 text-orange-500' : lead.status === 'Warm' ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--ae6-text-muted)]/10 text-[var(--ae6-text-muted)]'
                          ]">{{ lead.status }}</span>
                        </td>
                        <td class="p-8">
                          <button class="p-3 rounded-xl hover:bg-[var(--ae6-primary)] hover:text-white transition-all text-[var(--ae6-text-muted)]">
                            <MessageSquare :size="18" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Operations Tab -->
              <div v-if="activeTab === 'ops'" class="space-y-12 animate-in fade-in duration-700">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div v-for="stat in [
                    { label: 'Uptime', value: '99.9%', icon: ShieldCheck, color: 'text-green-500' },
                    { label: 'Active Tasks', value: tasks.length, icon: Calendar, color: 'text-blue-500' },
                    { label: 'Efficiency', value: '94%', icon: Zap, color: 'text-orange-500' },
                    { label: 'Node Health', value: 'Optimal', icon: Database, color: 'text-purple-500' }
                  ]" :key="stat.label" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-8 rounded-3xl interactive-card">
                    <div class="flex items-center gap-4 mb-4">
                      <component :is="stat.icon" :size="20" :class="stat.color" />
                      <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">{{ stat.label }}</span>
                    </div>
                    <div class="text-3xl font-bold tracking-tighter text-[var(--ae6-text-main)]">{{ stat.value }}</div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div class="lg:col-span-2 glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 shadow-xl">
                    <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-12">Master Task Cluster</h3>
                    <div class="space-y-6">
                      <div v-for="task in tasks" :key="task.id" class="flex items-center gap-8 p-8 rounded-[2.5rem] bg-[var(--ae6-bg)] border border-[var(--ae6-border)] group hover:border-[var(--ae6-primary)]/30 transition-all">
                        <div class="p-5 bg-[var(--ae6-bg-soft)] rounded-2xl text-[var(--ae6-primary)] shadow-lg group-hover:rotate-6 transition-transform">
                          <component :is="task.task_type === 'viewing' ? Key : task.task_type === 'maintenance' ? Settings : FileText" :size="24" />
                        </div>
                        <div class="flex-1">
                          <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold uppercase tracking-widest text-[var(--ae6-primary)]">{{ task.task_type }}</span>
                            <span class="text-[10px] font-bold text-[var(--ae6-text-muted)]">{{ new Date(task.created_at).toLocaleString() }}</span>
                          </div>
                          <p class="text-sm font-medium text-[var(--ae6-text-main)] mb-4">{{ task.description }}</p>
                          <div class="flex gap-4">
                            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">
                              <User :size="12" /> Assigned: AE6-AI-01
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">
                              <MapPin :size="12" /> Local Node
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col gap-3">
                          <button class="px-6 py-2 rounded-xl bg-[var(--ae6-primary)] text-white text-[8px] font-bold uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">Resolve</button>
                          <button class="px-6 py-2 rounded-xl border border-[var(--ae6-border)] text-[var(--ae6-text-muted)] text-[8px] font-bold uppercase tracking-widest hover:bg-[var(--ae6-bg-soft)] transition-all">Defer</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 relative overflow-hidden shadow-xl">
                    <h3 class="text-xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-10">Resource Allocation</h3>
                    <div class="space-y-10">
                      <div v-for="resource in [
                        { name: 'AI Processing', val: 78, color: 'bg-blue-500' },
                        { name: 'Manual Labor', val: 42, color: 'bg-orange-500' },
                        { name: 'Cloud Storage', val: 65, color: 'bg-purple-500' },
                        { name: 'API Throughput', val: 89, color: 'bg-green-500' }
                      ]" :key="resource.name" class="space-y-4">
                        <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span class="text-[var(--ae6-text-muted)]">{{ resource.name }}</span>
                          <span class="text-[var(--ae6-text-main)]">{{ resource.val }}%</span>
                        </div>
                        <div class="h-2 bg-[var(--ae6-border)] rounded-full overflow-hidden shadow-inner">
                          <div class="h-full rounded-full transition-all duration-1000" :class="resource.color" :style="{ width: `${resource.val}%` }"></div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-16 p-8 bg-[var(--ae6-primary)]/5 rounded-[2rem] border border-[var(--ae6-primary)]/10">
                      <div class="flex items-center gap-4 mb-4">
                        <Bot class="text-[var(--ae6-primary)]" :size="20" />
                        <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-primary)]">System Insight</span>
                      </div>
                      <p class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed">AE6 Core suggests optimizing AI processing nodes to handle the increased task load from the Phuket sector.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Finance Tab -->
              <div v-if="activeTab === 'finance'" class="space-y-12 animate-in fade-in duration-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div v-for="stat in [
                    { label: 'Total Revenue', value: '$12.4M', trend: '+18.2%', icon: CreditCard },
                    { label: 'Avg. Yield', value: '8.4%', trend: '+0.5%', icon: TrendingUp },
                    { label: 'Asset Value', value: '$420M', trend: '+12.4%', icon: BarChart3 }
                  ]" :key="stat.label" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-10 rounded-[2.5rem] interactive-card shadow-lg">
                    <div class="flex justify-between items-start mb-8">
                      <div class="p-5 bg-[var(--ae6-primary)]/10 rounded-2xl text-[var(--ae6-primary)] flex items-center justify-center">
                        <img v-if="typeof stat.icon === 'string'" :src="stat.icon" class="w-7 h-7 brightness-0 invert-[var(--ae6-icon-invert)] opacity-80" />
                        <component v-else :is="stat.icon" :size="28" />
                      </div>
                      <div class="text-green-500 text-[10px] font-bold uppercase tracking-widest">{{ stat.trend }}</div>
                    </div>
                    <div class="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] mb-3">{{ stat.label }}</div>
                    <div class="text-5xl font-bold tracking-tighter text-[var(--ae6-text-main)]">{{ stat.value }}</div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 overflow-hidden relative group shadow-xl">
                    <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-12">Revenue Distribution</h3>
                    <div class="h-80 flex items-center justify-center">
                      <div class="relative w-64 h-64">
                        <div class="absolute inset-0 border-[20px] border-[var(--ae6-primary)] rounded-full opacity-20"></div>
                        <div class="absolute inset-0 border-[20px] border-t-transparent border-l-transparent border-[var(--ae6-primary)] rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] rotate-45"></div>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                          <span class="text-4xl font-bold text-[var(--ae6-text-main)] tracking-tighter">72%</span>
                          <span class="text-[8px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">Occupancy</span>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-8 mt-12">
                      <div v-for="source in [
                        { name: 'Villa Rentals', val: '45%', color: 'bg-[var(--ae6-primary)]' },
                        { name: 'Management Fees', val: '22%', color: 'bg-blue-400' },
                        { name: 'Asset Sales', val: '18%', color: 'bg-purple-400' },
                        { name: 'Consulting', val: '15%', color: 'bg-[var(--ae6-text-muted)]' }
                      ]" :key="source.name" class="flex items-center gap-4">
                        <div class="w-3 h-3 rounded-full" :class="source.color"></div>
                        <div class="flex-1">
                          <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span class="text-[var(--ae6-text-muted)]">{{ source.name }}</span>
                            <span class="text-[var(--ae6-text-main)]">{{ source.val }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 shadow-xl">
                    <h3 class="text-2xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)] mb-12">Payout Schedule</h3>
                    <div class="space-y-6">
                      <div v-for="payout in [
                        { id: 'PAY-001', date: 'Dec 31, 2025', amount: '$42,500', status: 'Pending' },
                        { id: 'PAY-002', date: 'Jan 15, 2026', amount: '$18,200', status: 'Scheduled' },
                        { id: 'PAY-003', date: 'Feb 01, 2026', amount: '$64,100', status: 'Scheduled' }
                      ]" :key="payout.id" class="p-8 rounded-[2rem] bg-[var(--ae6-bg)] border border-[var(--ae6-border)] flex justify-between items-center group hover:border-[var(--ae6-primary)]/30 transition-all">
                        <div>
                          <div class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-primary)] mb-1">{{ payout.id }}</div>
                          <div class="text-sm font-bold text-[var(--ae6-text-main)]">{{ payout.date }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-xl font-bold text-[var(--ae6-text-main)] tracking-tighter mb-1">{{ payout.amount }}</div>
                          <div class="text-[8px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)]">{{ payout.status }}</div>
                        </div>
                      </div>
                      <button class="w-full py-6 rounded-2xl border-2 border-dashed border-[var(--ae6-border)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ae6-text-muted)] hover:border-[var(--ae6-primary)] hover:text-[var(--ae6-primary)] transition-all">
                        Generate Detailed Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Settings Tab -->
              <div v-if="activeTab === 'settings'" class="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
                <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 relative overflow-hidden shadow-xl">
                  <div class="flex items-center gap-8 mb-16">
                    <div class="w-20 h-20 bg-[var(--ae6-primary)]/10 rounded-[2rem] flex items-center justify-center shadow-xl">
                      <Settings2 class="text-[var(--ae6-primary)]" :size="40" />
                    </div>
                    <div>
                      <h3 class="text-3xl font-bold text-[var(--ae6-text-main)] uppercase tracking-tighter">Agency Configuration</h3>
                      <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em]">System ID: AZ-921-TH-BANGTAO</p>
                    </div>
                  </div>

                  <div class="space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div v-for="field in [
                        { label: 'Agency Name', val: 'AE6 Alpha', type: 'text' },
                        { label: 'Primary Node URL', val: 'https://core.ae6.ai', type: 'text' },
                        { label: 'Contact Email', val: 'ops@ae6.ai', type: 'email' },
                        { label: 'Support Hotline', val: '+66 2 123 4567', type: 'tel' }
                      ]" :key="field.label" class="space-y-4">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--ae6-text-muted)] ml-2">{{ field.label }}</label>
                        <input :type="field.type" :value="field.val" class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] outline-none text-sm font-medium text-[var(--ae6-text-main)] transition-all" />
                      </div>
                    </div>

                    <div class="pt-8 border-t border-[var(--ae6-border)]">
                      <h4 class="text-xs font-bold uppercase tracking-[0.3em] text-[var(--ae6-text-main)] mb-8">Security & Protocol</h4>
                      <div class="space-y-6">
                        <div v-for="toggle in [
                          { label: 'Autonomous Intelligence Layer', desc: 'Allow AI agent to execute smart contracts autonomously.', enabled: true },
                          { label: 'Global Network Sync', desc: 'Sync data across all global AE6 network points in real-time.', enabled: true },
                          { label: 'Enterprise-Grade Encryption (AES-256)', desc: 'Force high-level encryption for all client communications.', enabled: true }
                        ]" :key="toggle.label" class="flex items-center justify-between p-8 rounded-[2rem] bg-[var(--ae6-bg)] border border-[var(--ae6-border)] group hover:border-[var(--ae6-primary)]/30 transition-all">
                          <div class="max-w-md">
                            <div class="text-sm font-bold text-[var(--ae6-text-main)] mb-1">{{ toggle.label }}</div>
                            <div class="text-[10px] text-[var(--ae6-text-muted)] font-medium leading-relaxed">{{ toggle.desc }}</div>
                          </div>
                          <div class="w-14 h-8 bg-[var(--ae6-primary)] rounded-full relative cursor-pointer shadow-lg shadow-blue-500/20">
                            <div class="absolute right-1 top-1 w-6 h-6 bg-white rounded-full transition-all"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-6 pt-8">
                      <button class="flex-1 bg-[var(--ae6-primary)] text-white py-6 rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-95 transition-all">
                        Save System Configuration
                      </button>
                      <button class="px-10 border border-red-500/20 text-red-500 py-6 rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 text-[var(--ae6-text-main)] overflow-hidden relative group shadow-2xl">
                  <div class="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full"></div>
                  <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                      <h4 class="text-2xl font-bold uppercase tracking-tighter mb-4 text-[var(--ae6-text-main)]">System Termination</h4>
                      <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em] max-w-md">Permanently terminate the AE6 network link and purge all local datasets. This action is irreversible.</p>
                    </div>
                    <button class="px-10 py-5 bg-red-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl hover:bg-red-600 transition-all active:scale-95">
                      Terminate Link
                    </button>
                  </div>
                </div>
              </div>

              <!-- Inventory Management Tab -->
              <div v-if="activeTab === 'inventory'" class="space-y-12 animate-in fade-in duration-700">
                <!-- Management Sub-navigation -->
                <div class="flex gap-12 border-b border-[var(--ae6-border)] pb-6">
                  <button
                    v-for="sub in ['upload', 'analytics', 'integrations']"
                    :key="sub"
                    @click="manageSubTab = sub as any"
                    :class="[
                      'text-[10px] uppercase tracking-[0.4em] font-bold transition-all relative pb-6',
                      manageSubTab === sub ? 'text-[var(--ae6-primary)]' : 'text-[var(--ae6-text-muted)] hover:text-[var(--ae6-text-main)]'
                    ]"
                  >
                    {{ sub }}
                    <div v-if="manageSubTab === sub" class="absolute bottom-[-1px] left-0 w-full h-1 bg-[var(--ae6-primary)] rounded-full shadow-[0_0_10px_var(--ae6-primary)]"></div>
                  </button>
                </div>

                <!-- 1. Property Upload (Multi-step Form) -->
                <div v-if="manageSubTab === 'upload'" class="max-w-4xl mx-auto glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
                  <!-- Form Header / Stepper -->
                  <div class="bg-[var(--ae6-text-muted)]/5 dark:bg-[var(--ae6-text-muted)]/40 p-10 border-b border-[var(--ae6-border)] flex justify-between items-center">
                    <div class="flex gap-6">
                      <div v-for="s in 3" :key="s" class="flex items-center gap-4">
                        <div :class="[
                          'w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-bold transition-all duration-500 shadow-lg',
                          uploadStep >= s ? 'bg-[var(--ae6-primary)] text-white shadow-[var(--ae6-primary)]/20 rotate-3' : 'bg-[var(--ae6-border)] text-[var(--ae6-text-muted)]'
                        ]">
                          <CheckCircle2 v-if="uploadStep > s" :size="16" />
                          <span v-else>{{ s }}</span>
                        </div>
                        <span v-if="s < 3" :class="['w-10 h-0.5 rounded-full transition-colors duration-500', uploadStep > s ? 'bg-[var(--ae6-primary)]' : 'bg-[var(--ae6-border)]']"></span>
                      </div>
                    </div>
                    <div class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)]">
                      Phase <span class="text-[var(--ae6-primary)]">{{ uploadStep }}</span> / 03: {{ uploadStep === 1 ? 'Asset Structure' : uploadStep === 2 ? 'Optimization' : 'Verification' }}
                    </div>
                  </div>

                  <div class="p-12">
                    <!-- Step 1: Details -->
                    <div v-if="uploadStep === 1" class="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div class="grid grid-cols-2 gap-10">
                        <div class="space-y-3">
                          <label class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] ml-1">Property Title</label>
                          <input v-model="propertyForm.name" type="text" placeholder="AE6 Sky Estate" class="w-full bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] focus:bg-[var(--ae6-bg-soft)] outline-none text-[var(--ae6-text-main)] transition-all placeholder:text-[var(--ae6-text-muted)]/40" />
                        </div>
                        <div class="space-y-3">
                          <label class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] ml-1">Geographical Node</label>
                          <input v-model="propertyForm.location" type="text" placeholder="Phuket, TH" class="w-full bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] focus:bg-[var(--ae6-bg-soft)] outline-none text-[var(--ae6-text-main)] transition-all placeholder:text-[var(--ae6-text-muted)]/40" />
                        </div>
                      </div>
                      <div class="grid grid-cols-3 gap-10">
                        <div class="space-y-3">
                          <label class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] ml-1">Valuation ($)</label>
                          <input v-model="propertyForm.price" type="number" placeholder="5,000,000" class="w-full bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] focus:bg-[var(--ae6-bg-soft)] outline-none text-[var(--ae6-text-main)] transition-all placeholder:text-[var(--ae6-text-muted)]/40" />
                        </div>
                        <div class="space-y-3">
                          <label class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] ml-1">Spatial Area (Sqft)</label>
                          <input v-model="propertyForm.sqft" type="number" placeholder="12,500" class="w-full bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] focus:bg-[var(--ae6-bg-soft)] outline-none text-[var(--ae6-text-main)] transition-all placeholder:text-[var(--ae6-text-muted)]/40" />
                        </div>
                        <div class="space-y-3">
                          <label class="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--ae6-text-muted)] ml-1">Classification</label>
                          <select v-model="propertyForm.type" class="w-full bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-2xl py-5 px-8 focus:border-[var(--ae6-primary)] focus:bg-[var(--ae6-bg-soft)] outline-none text-[var(--ae6-text-main)] transition-all appearance-none cursor-pointer">
                            <option>Villa</option>
                            <option>Penthouse</option>
                            <option>Resort</option>
                            <option>Island</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <!-- Step 2: Media -->
                    <div v-if="uploadStep === 2" class="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div
                        @click="simulateUpload"
                        class="border-2 border-dashed border-[var(--ae6-border)] rounded-[3rem] p-20 text-center group cursor-pointer hover:border-[var(--ae6-primary)] hover:bg-[var(--ae6-primary)]/5 transition-all duration-500 interactive-card"
                      >
                        <div class="w-24 h-24 bg-[var(--ae6-primary)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-[var(--ae6-primary)] group-hover:text-white transition-all duration-500">
                          <Upload v-if="!isUploading" class="text-[var(--ae6-primary)] group-hover:text-white" :size="36" />
                          <RefreshCw v-else class="text-[var(--ae6-primary)] animate-spin" :size="36" />
                        </div>
                        <h4 class="text-xl font-bold text-[var(--ae6-text-main)] mb-3 uppercase tracking-tight">Upload Asset Portfolio</h4>
                        <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-widest mb-10 max-w-xs mx-auto">High-fidelity processing for 8K visuals, RAW photography, and 3D data</p>

                        <div v-if="isUploading" class="max-w-md mx-auto">
                          <div class="h-2 w-full bg-[var(--ae6-border)] rounded-full overflow-hidden mb-4 shadow-inner">
                            <div class="h-full bg-[var(--ae6-primary)] transition-all duration-300 shadow-[0_0_15px_var(--ae6-primary)]" :style="{ width: `${uploadProgress}%` }"></div>
                          </div>
                          <span class="text-[10px] font-bold text-[var(--ae6-primary)] uppercase tracking-[0.3em]">{{ uploadProgress }}% Optimizing...</span>
                        </div>
                      </div>

                      <div v-if="uploadedFiles.length > 0" class="space-y-6">
                        <h5 class="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-text-muted)] ml-2">Digital Inventory ({{ uploadedFiles.length }})</h5>
                        <div class="grid grid-cols-2 gap-6">
                          <div v-for="(file, idx) in uploadedFiles" :key="idx" class="flex items-center gap-6 p-6 bg-[var(--ae6-bg)]/30 border border-[var(--ae6-border)] rounded-3xl group interactive-card">
                            <div class="p-4 bg-[var(--ae6-bg-soft)] rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                              <ImageIcon v-if="file.type.includes('image')" :size="20" class="text-[var(--ae6-primary)]" />
                              <Video v-else :size="20" class="text-[var(--ae6-primary)]" />
                            </div>
                            <div class="flex-1">
                              <div class="text-[10px] font-bold text-[var(--ae6-text-main)] truncate uppercase tracking-widest mb-1">{{ file.name }}</div>
                              <div class="text-[8px] text-[var(--ae6-text-muted)] uppercase font-bold tracking-[0.2em]">{{ file.size }}</div>
                            </div>
                            <button @click="uploadedFiles.splice(idx, 1)" class="p-3 text-[var(--ae6-text-muted)] hover:text-red-500 transition-colors">
                              <Trash2 :size="16" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Step 3: Review -->
                    <div v-if="uploadStep === 3" class="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div class="bg-[var(--ae6-bg)]/30 rounded-[3rem] p-10 space-y-8 border border-[var(--ae6-border)] relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-[var(--ae6-primary)]/5 rounded-full"></div>
                        <div class="flex justify-between items-center pb-8 border-b border-[var(--ae6-border)]">
                          <div>
                            <div class="text-[8px] uppercase tracking-[0.5em] text-[var(--ae6-primary)] font-bold mb-2">Executive Summary</div>
                            <h4 class="text-3xl font-bold text-[var(--ae6-text-main)] uppercase tracking-tighter">{{ propertyForm.name || 'Asset Draft 01' }}</h4>
                          </div>
                          <span class="px-6 py-3 bg-[var(--ae6-primary)]/10 text-[var(--ae6-primary)] rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em]">{{ propertyForm.type }}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-y-10">
                          <div v-for="info in [
                            { label: 'Coordinates', val: propertyForm.location || 'Undisclosed' },
                            { label: 'Market Value', val: `$${propertyForm.price || '0'}` },
                            { label: 'Spatial Specs', val: `${propertyForm.bedrooms}B / ${propertyForm.bathrooms}B / ${propertyForm.sqft}ft²` },
                            { label: 'Asset Density', val: `${uploadedFiles.length} Visual Layers` }
                          ]" :key="info.label">
                            <div class="text-[8px] uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] font-bold mb-2">{{ info.label }}</div>
                            <div class="text-sm font-bold text-[var(--ae6-text-main)] uppercase tracking-widest">{{ info.val }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-6 p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem]">
                        <div class="w-12 h-12 bg-[var(--ae6-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--ae6-primary)]">
                          <ShieldCheck :size="24" />
                        </div>
                        <p class="text-[10px] text-[var(--ae6-text-muted)] font-bold uppercase tracking-widest leading-relaxed">System Verification: Enterprise protocol review required prior to portfolio deployment.</p>
                      </div>
                    </div>

                    <!-- Step 4: Success -->
                    <div v-if="uploadStep === 4" class="text-center py-20 space-y-10 animate-in zoom-in duration-700">
                      <div class="w-32 h-32 bg-green-500/10 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/10 rotate-6">
                        <CheckCircle2 :size="64" />
                      </div>
                      <h3 class="text-4xl font-bold text-[var(--ae6-text-main)] uppercase tracking-tighter">Asset Initialized</h3>
                      <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-loose">Portfolio reference #AE6-{{ Math.floor(Math.random() * 9000 + 1000) }} has been synchronized with the AE6 Global Network.</p>
                      <div class="flex justify-center gap-6 pt-10">
                        <button @click="resetForm" class="px-10 py-5 bg-[var(--ae6-text-main)] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-primary)] transition-all shadow-xl active:scale-95">New Asset</button>
                        <button @click="activeTab = 'portfolio'" class="px-10 py-5 glass-card text-[var(--ae6-text-main)] rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-bg)] transition-all shadow-xl active:scale-95">View Portfolio</button>
                      </div>
                    </div>
                  </div>

                  <!-- Form Footer Actions -->
                  <div v-if="uploadStep < 4" class="p-10 border-t border-[var(--ae6-border)] bg-[var(--ae6-text-muted)]/5 dark:bg-[var(--ae6-text-muted)]/40 flex justify-between">
                    <button
                      @click="prevStep"
                      :disabled="uploadStep === 1"
                      class="flex items-center gap-3 px-8 py-4 text-[var(--ae6-text-muted)] font-bold uppercase text-[10px] tracking-[0.4em] disabled:opacity-20 hover:text-[var(--ae6-text-main)] transition-all"
                    >
                      <ChevronLeft :size="18" /> Abort
                    </button>
                    <button
                      v-if="uploadStep < 3"
                      @click="nextStep"
                      class="flex items-center gap-3 px-12 py-5 bg-[var(--ae6-primary)] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl shadow-blue-500/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Continue <ChevronRight :size="18" />
                    </button>
                    <button
                      v-else
                      @click="submitProperty"
                      class="flex items-center gap-3 px-12 py-5 bg-green-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl shadow-green-500/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Deploy <CheckCircle2 :size="18" />
                    </button>
                  </div>
                </div>

                <!-- 2. Analytics View -->
                <div v-if="manageSubTab === 'analytics'" class="space-y-12 animate-in fade-in duration-700">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div v-for="stat in analyticsStats" :key="stat.label" class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-10 rounded-[2.5rem] interactive-card group">
                      <div class="flex justify-between items-start mb-6">
                        <div class="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--ae6-text-muted)]">{{ stat.label }}</div>
                        <div :class="['flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold', stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500']">
                          <TrendingUp v-if="stat.trend.startsWith('+')" :size="12" />
                          {{ stat.trend }}
                        </div>
                      </div>
                      <div class="text-4xl font-bold text-[var(--ae6-text-main)] tracking-tighter">{{ stat.value }}</div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div class="lg:col-span-2 glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 overflow-hidden relative group shadow-xl">
                      <div class="flex justify-between items-center mb-12">
                        <div>
                          <h4 class="text-2xl font-bold text-[var(--ae6-text-main)] uppercase tracking-[0.2em] mb-2">Market Exposure</h4>
                          <p class="text-[var(--ae6-text-muted)] text-[10px] uppercase tracking-widest font-bold">Geographical velocity distribution</p>
                        </div>
                        <div class="flex gap-3">
                          <button class="px-6 py-2 bg-[var(--ae6-primary)] text-white rounded-xl text-[8px] font-bold uppercase tracking-widest shadow-lg hover:brightness-110 transition-all">L30D</button>
                        </div>
                      </div>
                      <div class="h-80 flex items-end gap-2 px-4 border-b border-[var(--ae6-border)] pb-6">
                        <div v-for="n in 31" :key="n" class="flex-1 flex flex-col gap-1 justify-end group/bar cursor-pointer">
                          <div class="w-full bg-[var(--ae6-primary)]/10 rounded-t-sm group-hover/bar:bg-[var(--ae6-primary)]/20 transition-all" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
                          <div class="w-full bg-[var(--ae6-primary)] rounded-t-sm group-hover/bar:brightness-110 transition-all shadow-[0_0_10px_var(--ae6-primary)]/20" :style="{ height: `${Math.random() * 40 + 10}%` }"></div>
                        </div>
                      </div>
                      <div class="flex justify-between mt-6 text-[8px] font-bold text-[var(--ae6-text-muted)] uppercase tracking-[0.4em]">
                        <span>Phase Alpha</span>
                        <span>Phase Beta</span>
                        <span>Phase Gamma</span>
                      </div>
                    </div>

                    <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 shadow-xl">
                      <h4 class="text-2xl font-bold text-[var(--ae6-text-main)] uppercase tracking-[0.2em] mb-12">Channel Velocity</h4>
                      <div class="space-y-10">
                        <div v-for="channel in [
                          { name: 'AE6 Portal', val: 78, color: 'var(--ae6-primary)' },
                          { name: 'Direct Node', val: 54, color: 'var(--ae6-primary)' },
                          { name: 'Global MLS', val: 32, color: 'var(--ae6-text-muted)' },
                          { name: 'Neural Ads', val: 18, color: '#3B82F6' }
                        ]" :key="channel.name" class="space-y-4">
                          <div class="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em]">
                            <span class="text-[var(--ae6-text-muted)]">{{ channel.name }}</span>
                            <span class="text-[var(--ae6-text-main)]">{{ channel.val }}%</span>
                          </div>
                          <div class="h-2 w-full bg-[var(--ae6-border)] rounded-full overflow-hidden shadow-inner">
                            <div class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.05)]" :style="{ width: `${channel.val}%`, backgroundColor: `var(--${channel.color.includes('--') ? channel.color.replace('var(--', '').replace(')', '') : 'ae6-primary'})` || channel.color }"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. Integrations View -->
                <div v-if="manageSubTab === 'integrations'" class="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
                  <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 relative overflow-hidden group shadow-xl">
                    <div class="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                      <RefreshCw :size="120" />
                    </div>
                    <div class="flex items-center gap-8 mb-16 relative z-10">
                      <div class="w-20 h-20 bg-[var(--ae6-primary)]/10 rounded-[2rem] flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                        <RefreshCw class="text-[var(--ae6-primary)]" :size="40" />
                      </div>
                      <div>
                        <h4 class="text-3xl font-bold text-[var(--ae6-text-main)] uppercase tracking-tighter mb-2">Synthesis Hub</h4>
                        <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em]">Neural distribution across global architecture</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                      <div v-for="platform in [
                        { name: 'MLS Network', status: 'Connected', icon: Database, desc: 'Real-time synchronization with local and international MLS nodes.' },
                        { name: 'Global Portals', status: 'Active', icon: Globe, desc: 'Push updates to Zillow, Realtor.com, and Rightmove networks.' },
                        { name: 'CRM Bridge', status: 'Pending', icon: Users, desc: 'Link inquiries directly to AE6 Intelligence or external CRM.' },
                        { name: 'Neural API', status: 'Standby', icon: Link, desc: 'Custom webhook endpoints for developer integration.' }
                      ]" :key="platform.name" class="p-10 bg-[var(--ae6-bg)]/50 border border-[var(--ae6-border)] rounded-[2.5rem] interactive-card group/item">
                        <div class="flex justify-between items-start mb-8">
                          <div class="p-5 bg-[var(--ae6-bg-soft)] rounded-2xl text-[var(--ae6-primary)] group-hover/item:bg-[var(--ae6-primary)] group-hover/item:text-white transition-all duration-500 shadow-lg">
                            <component :is="platform.icon" :size="24" />
                          </div>
                          <span :class="[
                            'text-[8px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-sm',
                            platform.status === 'Connected' || platform.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-[var(--ae6-border)] text-[var(--ae6-text-muted)]'
                          ]">{{ platform.status }}</span>
                        </div>
                        <h5 class="text-xl font-bold text-[var(--ae6-text-main)] uppercase tracking-tight mb-4">{{ platform.name }}</h5>
                        <p class="text-[10px] text-[var(--ae6-text-muted)] font-bold uppercase tracking-widest leading-relaxed mb-8">{{ platform.desc }}</p>
                        <button class="w-full py-4 bg-[var(--ae6-bg-soft)] rounded-xl text-[8px] font-bold uppercase tracking-[0.4em] text-[var(--ae6-text-muted)] hover:bg-[var(--ae6-primary)] hover:text-white transition-all shadow-md">Configure Node</button>
                      </div>
                    </div>
                  </div>

                  <div class="bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] p-12 text-[var(--ae6-text-main)] shadow-2xl relative overflow-hidden group">
                    <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-[var(--ae6-primary)]/5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                    <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                      <div class="space-y-6">
                        <h4 class="text-3xl font-bold uppercase tracking-tighter text-[var(--ae6-text-main)]">Bulk Data Exchange</h4>
                        <p class="text-[var(--ae6-text-muted)] text-[10px] font-bold uppercase tracking-[0.3em] max-w-md leading-loose">Import or export entire portfolio clusters via structured datasets for manual auditing or external synthesis.</p>
                        <div class="flex gap-6 pt-4">
                          <button class="flex items-center gap-3 px-8 py-4 bg-[var(--ae6-primary)] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:brightness-110 transition-all shadow-xl active:scale-95">
                            <Upload :size="16" /> Import Dataset
                          </button>
                          <button class="flex items-center gap-3 px-8 py-4 border border-[var(--ae6-border)] text-[var(--ae6-text-main)] rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-[var(--ae6-bg)] transition-all active:scale-95">
                            <FileDown :size="16" /> Export Cluster
                          </button>
                        </div>
                      </div>
                      <div class="p-10 bg-[var(--ae6-bg-soft)] rounded-[3rem] shadow-xl border border-[var(--ae6-border)] group-hover:rotate-6 transition-transform duration-700">
                        <FileText :size="80" class="text-[var(--ae6-primary)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI Agent Tab -->
              <div v-if="activeTab === 'agent'" class="max-w-5xl mx-auto h-[75vh] flex flex-col glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-700">
                <!-- Ambient Glow inside Chat -->
                <div class="absolute -top-24 -right-24 w-80 h-80 bg-[var(--ae6-primary)]/5 rounded-full pointer-events-none"></div>
                <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--ae6-primary)]/5 rounded-full pointer-events-none"></div>

                <div class="p-10 border-b border-[var(--ae6-border)] bg-[var(--ae6-bg-soft)]/95 flex items-center justify-between relative z-10">
                  <div class="flex items-center gap-6">
                    <div class="relative group">
                      <div class="w-16 h-16 bg-gradient-to-br from-[var(--ae6-primary)] to-[var(--ae6-primary-hover)] rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                        <Bot class="text-white" :size="32" />
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[var(--ae6-border)] rounded-full"></div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)]">AE6 Agent</h3>
                      <div class="flex items-center gap-3 mt-1">
                        <span class="text-[10px] text-[var(--ae6-primary)] font-bold uppercase tracking-[0.3em]">Agent Active</span>
                        <div class="w-1.5 h-1.5 rounded-full bg-[var(--ae6-border)]"></div>
                        <span class="text-[10px] text-[var(--ae6-text-muted)] font-bold uppercase tracking-[0.3em]">Neural Engine v4.2</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="px-6 py-3 rounded-2xl glass-card !bg-[var(--ae6-bg-soft)]/20 text-[10px] font-bold text-[var(--ae6-text-main)] uppercase tracking-[0.3em] border border-[var(--ae6-border)]">
                      NODE: AE6-921
                    </div>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-transparent relative z-10" id="chat-container">
                  <div v-for="(msg, idx) in messages" :key="idx"
                    :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']"
                  >
                    <div :class="[
                      'max-w-[80%] p-8 rounded-[2.5rem] text-sm shadow-xl transition-all duration-500 interactive-card',
                      msg.role === 'user'
                        ? 'bg-[var(--ae6-text-main)] text-white rounded-tr-none border border-white/10 shadow-[var(--ae6-border)]'
                        : 'glass-card text-[var(--ae6-text-main)] rounded-tl-none !bg-[var(--ae6-bg-soft)]/90 border border-[var(--ae6-border)]'
                    ]">
                      <div class="flex items-center gap-3 mb-3 opacity-40">
                        <User v-if="msg.role === 'user'" :size="14" />
                        <Bot v-else :size="14" />
                        <span class="text-[10px] font-bold uppercase tracking-[0.4em]">{{ msg.role }}</span>
                      </div>
                      <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
                    </div>
                  </div>
                  <div v-if="isLoadingAgent" class="flex justify-start">
                    <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-8 rounded-[2.5rem] rounded-tl-none flex gap-3 shadow-xl">
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce"></div>
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce delay-100"></div>
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>

                <div class="p-10 border-t border-[var(--ae6-border)] bg-[var(--ae6-bg-soft)]/95 relative z-10">
                  <div class="relative flex items-center group">
                    <input
                      v-model="agentPrompt"
                      @keyup.enter="handleAgentCommand"
                      type="text"
                      placeholder="Instruct the AE6 Agent..."
                      class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[2rem] py-6 pl-10 pr-24 focus:outline-none focus:border-[var(--ae6-primary)]/50 focus:bg-[var(--ae6-bg-soft)] transition-all text-[var(--ae6-text-main)] placeholder:text-[var(--ae6-text-muted)]/40 shadow-inner"
                    />
                    <button
                      @click="handleAgentCommand"
                      :disabled="isLoadingAgent"
                      class="absolute right-4 p-5 bg-[var(--ae6-primary)] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                    >
                      <Send :size="24" />
                    </button>
                  </div>
                  <div class="mt-6 flex gap-6 px-6 overflow-x-auto no-scrollbar pb-2">
                    <button v-for="prompt in ['Summarize portfolio', 'Analyze market trends', 'Synthesize Report']" :key="prompt"
                      @click="agentPrompt = prompt"
                      class="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors flex items-center gap-2"
                    >
                      <Sparkles :size="12" /> {{ prompt }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Relax Mode Tab -->
              <div v-if="activeTab === 'relax'" class="max-w-5xl mx-auto h-[75vh] flex flex-col glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-700">
                <div class="absolute -top-24 -right-24 w-80 h-80 bg-[var(--ae6-primary)]/5 rounded-full pointer-events-none"></div>
                <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--ae6-primary)]/5 rounded-full pointer-events-none"></div>

                <div class="p-10 border-b border-[var(--ae6-border)] bg-[var(--ae6-bg)]/95 flex items-center justify-between relative z-10">
                  <div class="flex items-center gap-6">
                    <div class="relative group">
                      <div class="w-16 h-16 bg-gradient-to-br from-[var(--ae6-primary)] to-[var(--ae6-primary-hover)] rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-500">
                        <Coffee class="text-white" :size="32" />
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-400 border-4 border-[var(--ae6-border)] rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold uppercase tracking-[0.2em] text-[var(--ae6-text-main)]">{{ t('relaxMode') }}</h3>
                      <div class="flex items-center gap-3 mt-1">
                        <span class="text-[10px] text-[var(--ae6-primary)] font-bold uppercase tracking-[0.3em]">{{ t('agentActive') }}</span>
                        <div class="w-1.5 h-1.5 rounded-full bg-[var(--ae6-border)]"></div>
                        <span class="text-[10px] text-[var(--ae6-text-muted)] font-bold uppercase tracking-[0.3em]">{{ t('systemReady') }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="px-6 py-3 rounded-2xl glass-card !bg-[var(--ae6-bg-soft)]/20 text-[10px] font-bold text-[var(--ae6-text-main)] uppercase tracking-[0.3em] border border-[var(--ae6-border)]">
                      MODE: AUTOPILOT
                    </div>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-transparent relative z-10" id="relax-messages">
                  <div v-for="(msg, idx) in relaxMessages" :key="idx"
                    :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']"
                  >
                    <div :class="[
                      'max-w-[80%] p-8 rounded-[2.5rem] text-sm shadow-xl transition-all duration-500 interactive-card',
                      msg.role === 'user'
                        ? 'bg-[var(--ae6-text-main)] text-white rounded-tr-none border border-white/10'
                        : 'glass-card text-[var(--ae6-text-main)] rounded-tl-none !bg-[var(--ae6-bg)]/90 border border-[var(--ae6-border)]'
                    ]">
                      <div class="flex items-center gap-3 mb-3 opacity-40">
                        <User v-if="msg.role === 'user'" :size="14" />
                        <Bot v-else :size="14" />
                        <span class="text-[10px] font-bold uppercase tracking-[0.4em]">{{ msg.agent || msg.role }}</span>
                        <span v-if="msg.status" class="ml-auto text-[8px] px-2 py-0.5 bg-[var(--ae6-primary)]/10 text-[var(--ae6-primary)] rounded-full">{{ msg.status }}</span>
                      </div>
                      <div class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</div>
                    </div>
                  </div>
                  <div v-if="isRelaxLoading" class="flex justify-start">
                    <div class="glass-card !bg-[var(--ae6-surface)] border border-[var(--ae6-border)] p-8 rounded-[2.5rem] rounded-tl-none flex gap-3 shadow-xl">
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce"></div>
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce delay-100"></div>
                      <div class="w-2.5 h-2.5 bg-[var(--ae6-primary)] rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>

                <div class="p-10 border-t border-[var(--ae6-border)] bg-[var(--ae6-bg)]/95 relative z-10">
                  <div class="relative flex items-center group">
                    <input
                      v-model="relaxInput"
                      @keyup.enter="executeRelaxCommand"
                      type="text"
                      :placeholder="t('typeCommand')"
                      class="w-full bg-[var(--ae6-bg)] border border-[var(--ae6-border)] rounded-[2rem] py-6 pl-10 pr-24 focus:outline-none focus:border-[var(--ae6-primary)]/50 focus:bg-[var(--ae6-bg-soft)] transition-all text-[var(--ae6-text-main)] placeholder:text-[var(--ae6-text-muted)]/40 shadow-inner"
                    />
                    <button
                      @click="executeRelaxCommand"
                      :disabled="isRelaxLoading"
                      class="absolute right-4 p-5 bg-[var(--ae6-primary)] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                      <Send :size="24" />
                    </button>
                  </div>
                  <div class="mt-6 flex gap-6 px-6 overflow-x-auto no-scrollbar pb-2">
                    <button v-for="prompt in [t('morningBriefing'), 'Analyze Portfolio', 'Social Sync']" :key="prompt"
                      @click="relaxInput = prompt"
                      class="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ae6-text-muted)] hover:text-[var(--ae6-primary)] transition-colors flex items-center gap-2"
                    >
                      <Sparkles :size="12" /> {{ prompt }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </main>
      </div>
    </Transition>
  </div>
</template>

<style>
/* AE6 Intelligence Optimized Styles */
:root {
  --ae6-glass-bg: rgba(255, 255, 255, 0.7);
  --ae6-glass-border: rgba(255, 255, 255, 0.2);
}

.dark {
  --ae6-glass-bg: rgba(15, 23, 42, 0.7);
  --ae6-glass-border: rgba(255, 255, 255, 0.1);
}

.interactive-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.interactive-card img {
  filter: saturate(1.1) contrast(1.05);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .interactive-card img {
  filter: saturate(0.8) contrast(1.1) brightness(0.9) hue-rotate(-10deg);
}

.interactive-card:hover img {
  filter: saturate(1.2) contrast(1.1) scale(1.1);
}

.glass-card {
  background: var(--ae6-glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--ae6-glass-border);
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

.kinetic-text {
  background: linear-gradient(135deg, var(--ae6-primary) 0%, var(--ae6-primary-hover) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--ae6-border);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--ae6-primary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Kinetic Typography for Showcase */
.kinetic-text {
  background: linear-gradient(to right, var(--ae6-text-main), var(--ae6-primary), var(--ae6-text-main));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 4s linear infinite;
}

@keyframes shine {
  to { background-position: 200% center; }
}

/* Floating Animations */
.float-slow {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

/* Signal Pulse for Real-time Location */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.98); }
}
</style>

