'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Users,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  Heart,
  HeartHandshake,
  Info,
  CheckCircle2,
  ArrowUpRight,
  User,
  Eye,
  BookOpen,
  GraduationCap,
  Calculator,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Play,
  Check,
} from 'lucide-react'
import {
  SHAJARAH_WARATSAH_NODES,
  SHAJARAH_CONNECTIONS,
  SHAJARAH_UNIONS,
  type WaritsNode,
  type ConnectionEdge,
  type MarriageUnion,
} from '@/data/shajarah-waratsah-data'
import { PohonWarisanDetailModal } from './PohonWarisanDetailModal'
import {
  PohonWarisanSimulasiPanel,
  PRESET_CASES,
  type SimulasiTirkahInput,
  type PresetCase,
} from './PohonWarisanSimulasiPanel'
import { FaraidhEngine } from '@/lib/faraidh/engine'
import { SEED_RULES } from '@/data/seed-rules'
import type {
  InputKasus,
  InputAhliWaris,
  HasilKalkulasi,
  HasilPerAhliWaris,
} from '@/lib/faraidh/types'

type FilterMode =
  | 'semua'
  | 'enam_abadi'
  | 'furudh'
  | 'ashabah'
  | 'usul_furu'
  | 'hawasyi'

const FILTER_TABS: { id: FilterMode; label: string; arab: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'semua', label: 'Semua Ahli Waris', arab: 'الجميع', icon: Users },
  { id: 'enam_abadi', label: '6 Tak Pernah Gugur', arab: 'الستة', icon: ShieldCheck },
  { id: 'furudh', label: 'Ashabul Furudh', arab: 'الفروض', icon: Scale },
  { id: 'ashabah', label: 'Ashabah (Sisa)', arab: 'العصبة', icon: Sparkles },
  { id: 'usul_furu', label: 'Usul & Furu\'', arab: 'الأصول والفروع', icon: Layers },
  { id: 'hawasyi', label: 'Hawasyi', arab: 'الحواشي', icon: Users },
]

export function PohonWarisanCanvas() {
  // State
  const [filterMode, setFilterMode] = useState<FilterMode>('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [jenazahGender, setJenazahGender] = useState<'L' | 'P'>('L')
  const [selectedNode, setSelectedNode] = useState<WaritsNode | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Zoom and Pan Transform State
  const [scale, setScale] = useState(0.82)
  const [pan, setPan] = useState({ x: 30, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // ─── SIMULASI & GAME BELAJAR STATE ───────────────────────────
  const [isLearnMode, setIsLearnMode] = useState<boolean>(false)
  const [isSimulasiPanelOpen, setIsSimulasiPanelOpen] = useState<boolean>(false)
  const [selectedHeirs, setSelectedHeirs] = useState<Record<string, number>>({})
  const [tirkahInput, setTirkahInput] = useState<SimulasiTirkahInput>({
    harta_kotor: 120000000,
    biaya_tajhiz: 0,
    hutang_terikat: 0,
    hutang_biasa: 0,
    wasiat: 0,
  })

  const handleUpdateHeirQty = useCallback((nodeId: string, qty: number) => {
    setSelectedHeirs(prev => {
      const next = { ...prev }
      if (qty <= 0) {
        delete next[nodeId]
      } else {
        next[nodeId] = qty
      }
      return next
    })
  }, [])

  const handleResetHeirs = useCallback(() => {
    setSelectedHeirs({})
  }, [])

  const handleApplyPreset = useCallback((preset: PresetCase) => {
    setJenazahGender(preset.jenazahGender)
    setSelectedHeirs(preset.heirs)
    setTirkahInput(prev => ({ ...prev, harta_kotor: preset.tirkah }))
    setIsLearnMode(true)
    setIsSimulasiPanelOpen(true)
  }, [])

  const engine = useMemo(() => new FaraidhEngine(SEED_RULES), [])

  const calculationResult = useMemo<HasilKalkulasi | null>(() => {
    if (!isLearnMode) return null

    const inputAhliWarisList: InputAhliWaris[] = []

    Object.entries(selectedHeirs).forEach(([nodeId, qty]) => {
      if (qty <= 0) return

      let engineCode = nodeId
      if (nodeId === 'pasangan') {
        engineCode = jenazahGender === 'L' ? 'istri' : 'suami'
      } else if (nodeId === 'saudara_seibu') {
        engineCode = 'saudara_lk_seibu'
      }

      inputAhliWarisList.push({
        kode: engineCode,
        jumlah_orang: qty,
        halangan: 'tidak_ada',
      })
    })

    const inputKasus: InputKasus = {
      harta_kotor: tirkahInput.harta_kotor,
      biaya_tajhiz: tirkahInput.biaya_tajhiz,
      hutang_terikat: tirkahInput.hutang_terikat,
      hutang_biasa: tirkahInput.hutang_biasa,
      wasiat: tirkahInput.wasiat,
      ahli_waris_list: inputAhliWarisList,
    }

    try {
      return engine.hitung(inputKasus)
    } catch (err) {
      console.error('Faraidh calculation error:', err)
      return null
    }
  }, [engine, isLearnMode, selectedHeirs, jenazahGender, tirkahInput])

  const heirResultMap = useMemo(() => {
    const map = new Map<string, HasilPerAhliWaris>()
    if (!calculationResult) return map

    calculationResult.hasil.forEach((heir: HasilPerAhliWaris) => {
      map.set(heir.kode, heir)
      if (heir.kode === 'istri' || heir.kode === 'suami') {
        map.set('pasangan', heir)
      }
      if (heir.kode === 'saudara_lk_seibu' || heir.kode === 'saudari_seibu') {
        map.set('saudara_seibu', heir)
      }
    })
    return map
  }, [calculationResult])

  const totalSelectedHeirCount = useMemo(() => {
    return Object.values(selectedHeirs).reduce((a, b) => a + b, 0)
  }, [selectedHeirs])

  const containerRef = useRef<HTMLDivElement>(null)

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.12, 1.8))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.12, 0.4))
  const handleResetZoom = useCallback(() => {
    setScale(0.82)
    setPan({ x: 30, y: 20 })
  }, [])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.warits-card') || (e.target as HTMLElement).closest('.union-node')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch pan & pinch-to-zoom handlers for Mobile devices
  const touchStartDistRef = useRef<number | null>(null)
  const initialScaleRef = useRef<number>(scale)

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.warits-card') || (e.target as HTMLElement).closest('.union-node')) return
    if (e.touches.length === 1) {
      setIsDragging(true)
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
      touchStartDistRef.current = null
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStartDistRef.current = dist
      initialScaleRef.current = scale
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0]
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      })
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchStartDistRef.current
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.4), 1.8)
      setScale(newScale)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    touchStartDistRef.current = null
  }

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.4), 1.8))
  }

  // Filter logic
  const isNodeActive = useCallback((node: WaritsNode): boolean => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        node.nama_arab.toLowerCase().includes(q) ||
        node.nama_latin.toLowerCase().includes(q) ||
        node.nama_id.toLowerCase().includes(q) ||
        node.kategori_label.toLowerCase().includes(q)
      if (!matchSearch) return false
    }

    switch (filterMode) {
      case 'enam_abadi':
        return node.tidak_pernah_gugur
      case 'furudh':
        return (
          node.kategori === 'pasangan' ||
          node.kategori === 'usul' ||
          node.id === 'anak_pr' ||
          node.id === 'cucu_pr' ||
          node.id === 'saudari_kandung' ||
          node.id === 'saudari_seayah' ||
          node.id === 'saudara_seibu'
        )
      case 'ashabah':
        return (
          node.ashabah_info !== undefined ||
          node.id === 'anak_lk' ||
          node.id === 'cucu_lk' ||
          node.id === 'ayah' ||
          node.id === 'kakek' ||
          node.id === 'saudara_lk_kandung' ||
          node.id === 'saudara_lk_seayah' ||
          node.id === 'paman_kandung' ||
          node.id === 'paman_seayah' ||
          node.id === 'keponakan_lk_kandung' ||
          node.id === 'keponakan_lk_seayah' ||
          node.id === 'sepupu_lk_paman_kandung' ||
          node.id === 'sepupu_lk_paman_seayah'
        )
      case 'usul_furu':
        return node.kategori === 'focal' || node.kategori === 'pasangan' || node.kategori === 'usul' || node.kategori === 'furu'
      case 'hawasyi':
        return node.kategori === 'hawasyi_ikhwah' || node.kategori === 'hawasyi_amam'
      default:
        return true
    }
  }, [searchQuery, filterMode])

  const nodeMap = useMemo(() => {
    const map = new Map<string, WaritsNode>()
    SHAJARAH_WARATSAH_NODES.forEach(n => map.set(n.id, n))
    return map
  }, [])

  const getNodePorsiList = (node: WaritsNode, gender: 'L' | 'P') => {
    if (node.id === 'mayyit') {
      return [{ label: 'Muwarrits (Pewaris)', type: 'special' }]
    }
    if (node.id === 'pasangan') {
      if (gender === 'L') {
        return [
          { label: '1/4', type: 'fardh' },
          { label: '1/8', type: 'fardh' },
        ]
      } else {
        return [
          { label: '1/2', type: 'fardh' },
          { label: '1/4', type: 'fardh' },
        ]
      }
    }
    if (node.id === 'ayah' || node.id === 'kakek') {
      return [
        { label: '1/6', type: 'fardh' },
        { label: 'Ashabah', type: 'ashabah' },
        { label: '1/6 + Sisa', type: 'special' },
      ]
    }
    if (node.id === 'ibu') {
      return [
        { label: '1/3', type: 'fardh' },
        { label: '1/6', type: 'fardh' },
        { label: '1/3 Sisa', type: 'special' },
      ]
    }
    if (node.id === 'anak_pr' || node.id === 'saudari_kandung') {
      return [
        { label: '1/2', type: 'fardh' },
        { label: '2/3', type: 'fardh' },
        { label: 'Ashabah', type: 'ashabah' },
      ]
    }
    if (node.id === 'cucu_pr' || node.id === 'saudari_seayah') {
      return [
        { label: '1/2', type: 'fardh' },
        { label: '2/3', type: 'fardh' },
        { label: '1/6', type: 'fardh' },
        { label: 'Ashabah', type: 'ashabah' },
      ]
    }
    if (node.id === 'saudara_seibu') {
      return [
        { label: '1/6 (Tunggal)', type: 'fardh' },
        { label: '1/3 (Jamak)', type: 'fardh' },
      ]
    }
    if (node.id === 'nenek_ibu' || node.id === 'nenek_ayah') {
      return [{ label: '1/6 (Fardh)', type: 'fardh' }]
    }
    if (
      node.id === 'anak_lk' ||
      node.id === 'cucu_lk' ||
      node.id === 'saudara_lk_kandung' ||
      node.id === 'saudara_lk_seayah' ||
      node.id === 'paman_kandung' ||
      node.id === 'paman_seayah' ||
      node.id === 'keponakan_lk_kandung' ||
      node.id === 'keponakan_lk_seayah' ||
      node.id === 'sepupu_lk_paman_kandung' ||
      node.id === 'sepupu_lk_paman_seayah'
    ) {
      return [{ label: 'Ashabah (Sisa)', type: 'ashabah' }]
    }
    return node.porsi_ringkas.map(p => ({ label: p, type: 'fardh' as const }))
  }

  // Card dimensions
  const CARD_WIDTH = 250
  const CARD_HEIGHT = 165

  // Role Badge Styling identical to Silsilah PersonNode
  const getBadgeStyle = (node: WaritsNode) => {
    switch (node.kategori) {
      case 'focal':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          border: '#FCD34D',
          label: 'Tokoh Utama (POV / Mayyit)',
        }
      case 'pasangan':
        return {
          bg: '#FEF9C3',
          color: '#854D0E',
          border: '#FDE047',
          label: jenazahGender === 'L' ? 'Istri / Pasangan' : 'Suami / Pasangan',
        }
      case 'usul':
        if (node.id === 'ayah' || node.id === 'ibu') {
          return {
            bg: '#EFF6FF',
            color: '#1E40AF',
            border: '#BFDBFE',
            label: node.kategori_label,
          }
        }
        return {
          bg: '#EEF2FF',
          color: '#3730A3',
          border: '#C7D2FE',
          label: node.kategori_label,
        }
      case 'furu':
        if (node.id === 'anak_lk' || node.id === 'anak_pr') {
          return {
            bg: '#D1FAE5',
            color: '#065F46',
            border: '#6EE7B7',
            label: node.kategori_label,
          }
        }
        return {
          bg: '#E0F2FE',
          color: '#075985',
          border: '#7DD3FC',
          label: node.kategori_label,
        }
      case 'hawasyi_ikhwah':
        return {
          bg: '#F0F9FF',
          color: '#0369A1',
          border: '#BAE6FD',
          label: node.kategori_label,
        }
      case 'hawasyi_amam':
        return {
          bg: '#F0FDF4',
          color: '#166534',
          border: '#BBF7D0',
          label: node.kategori_label,
        }
      default:
        return {
          bg: '#F3F4F6',
          color: '#374151',
          border: '#D1D5DB',
          label: node.kategori_label,
        }
    }
  }

  // Render marriage union branch lines (originating from each Marriage Love Hub down to children)
  const renderUnionLines = () => {
    return SHAJARAH_UNIONS.map(union => {
      const sp1 = nodeMap.get(union.spouse1)
      const sp2 = nodeMap.get(union.spouse2)
      if (!sp1 || !sp2) return null

      const unionCenterX = (sp1.canvas_pos.x + CARD_WIDTH + sp2.canvas_pos.x) / 2
      const unionCenterY = sp1.canvas_pos.y + CARD_HEIGHT / 2
      const unionBottomY = unionCenterY + 16

      const childNodes = union.children
        .map(cid => nodeMap.get(cid))
        .filter((n): n is WaritsNode => n !== undefined)

      if (childNodes.length === 0) return null

      const isSpouseActive = isNodeActive(sp1) || isNodeActive(sp2)
      const isUnionHovered =
        hoveredNodeId === union.spouse1 ||
        hoveredNodeId === union.spouse2 ||
        union.children.includes(hoveredNodeId || '')

      const firstChildY = childNodes[0].canvas_pos.y
      // Dedicated lower lane for marriage children (Sekandung)
      const baseGap = (sp1.canvas_pos.y + CARD_HEIGHT + firstChildY) / 2
      const midY =
        union.id === 'union_ayah_ibu'
          ? 540
          : union.id === 'union_kakek_nenek_ayah'
          ? 275
          : union.id === 'union_mayyit_pasangan'
          ? 800
          : baseGap

      const childXs = childNodes.map(c => c.canvas_pos.x + CARD_WIDTH / 2)
      const minX = Math.min(unionCenterX, ...childXs)
      const maxX = Math.max(unionCenterX, ...childXs)

      const paths: string[] = []

      // 1. Vertical stem from bottom of Love Hub down to midY
      paths.push(`M ${unionCenterX} ${unionBottomY} V ${midY}`)

      // 2. Horizontal bus bar at midY
      paths.push(`M ${minX} ${midY} H ${maxX}`)

      // 3. Drop down to each child top center
      childNodes.forEach(c => {
        const cx = c.canvas_pos.x + CARD_WIDTH / 2
        const cy = c.canvas_pos.y
        paths.push(`M ${cx} ${midY} V ${cy}`)
      })

      return (
        <g key={`union_tree_${union.id}`}>
          {isUnionHovered &&
            paths.map((d, idx) => (
              <path
                key={`hl_${idx}`}
                d={d}
                fill="none"
                stroke="#2563eb"
                strokeWidth={5}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
            ))}
          {paths.map((d, idx) => (
            <path
              key={`p_${idx}`}
              d={d}
              fill="none"
              stroke={isUnionHovered ? '#2563eb' : isSpouseActive ? '#64748b' : '#cbd5e1'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200"
            />
          ))}
        </g>
      )
    })
  }

  // Render clean orthogonal connector lines without crossing behind cards
  const renderConnectors = () => {
    return SHAJARAH_CONNECTIONS.map(edge => {
      const fromNode = nodeMap.get(edge.from)
      const toNode = nodeMap.get(edge.to)
      if (!fromNode || !toNode) return null

      const fromActive = isNodeActive(fromNode)
      const toActive = isNodeActive(toNode)
      const isHighlighted = (hoveredNodeId === edge.from || hoveredNodeId === edge.to)

      const fromX = fromNode.canvas_pos.x + CARD_WIDTH / 2
      const fromY = fromNode.canvas_pos.y + CARD_HEIGHT / 2
      const toX = toNode.canvas_pos.x + CARD_WIDTH / 2
      const toY = toNode.canvas_pos.y + CARD_HEIGHT / 2

      // Line style differentiation for Seayah, Seibu & Marriage
      const isSeayah = edge.id.includes('seayah')
      const isSeibu = edge.id.includes('seibu')
      const isMarriage = edge.type === 'marriage'

      let pathD = ''

      if (isMarriage) {
        // Horizontal marriage bridge
        const startX = fromNode.canvas_pos.x + CARD_WIDTH
        const startY = fromNode.canvas_pos.y + CARD_HEIGHT / 2
        const endX = toNode.canvas_pos.x
        const endY = toNode.canvas_pos.y + CARD_HEIGHT / 2
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`
      } else if (fromNode.canvas_pos.y < toNode.canvas_pos.y) {
        // Downward connection (Upper generation -> Lower generation)
        const startX = fromX
        const startY = fromNode.canvas_pos.y + CARD_HEIGHT
        const endX = toX
        const endY = toNode.canvas_pos.y
        if (Math.abs(startX - endX) < 5) {
          pathD = `M ${startX} ${startY} L ${endX} ${endY}`
        } else {
          // Distinct upper track for Jalur Seayah so it never merges with Sekandung line
          const defaultMidY = (startY + endY) / 2
          const midY =
            isSeayah && fromNode.id === 'ayah'
              ? 495
              : isSeayah && fromNode.id === 'kakek'
              ? 248
              : isSeibu
              ? 495
              : fromNode.id === 'anak_lk'
              ? 1060
              : defaultMidY
          pathD = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`
        }
      } else if (fromNode.canvas_pos.y > toNode.canvas_pos.y) {
        // Upward connection (Lower generation -> Upper generation)
        const startX = fromX
        const startY = fromNode.canvas_pos.y
        const endX = toX
        const endY = toNode.canvas_pos.y + CARD_HEIGHT
        if (Math.abs(startX - endX) < 5) {
          pathD = `M ${startX} ${startY} L ${endX} ${endY}`
        } else {
          const midY = (startY + endY) / 2
          pathD = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`
        }
      } else {
        // Same row horizontal connection
        const startX = fromNode.canvas_pos.x + (toX > fromX ? CARD_WIDTH : 0)
        const startY = fromY
        const endX = toNode.canvas_pos.x + (toX > fromX ? 0 : CARD_WIDTH)
        const endY = toY
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`
      }

      const lineColor = isHighlighted
        ? '#2563eb'
        : isMarriage
        ? '#f43f5e'
        : isSeayah
        ? fromActive && toActive ? '#6366f1' : '#c7d2fe'
        : isSeibu
        ? fromActive && toActive ? '#a855f7' : '#e9d5ff'
        : fromActive && toActive ? '#64748b' : '#cbd5e1'

      const lineDash = isMarriage
        ? '4 3'
        : isSeayah || isSeibu
        ? '6 3'
        : undefined

      return (
        <g key={edge.id}>
          {isHighlighted && (
            <path
              d={pathD}
              fill="none"
              stroke="#2563eb"
              strokeWidth={5}
              strokeOpacity={0.4}
              strokeLinecap="round"
            />
          )}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth={isMarriage ? 2.5 : 2}
            strokeDasharray={lineDash}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-200"
          />
        </g>
      )
    })
  }

  const pasanganNode = nodeMap.get('pasangan')

  return (
    <div className={`relative w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : 'flex-1 min-h-0'
    }`}>
      
      {/* ═══ SUB-TOOLBAR (TEPAT DI BAWAH NAVBAR UTAMA) ══════════════ */}
      <div className="border-b border-slate-200 bg-white px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0 z-30 shadow-xs">
        
        {/* Left Side: Learn Mode Toggle, Switcher Mayyit & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Main Simulation / Game Mode Toggle Button */}
          <button
            onClick={() => {
              const nextMode = !isLearnMode
              setIsLearnMode(nextMode)
              if (nextMode) {
                setIsSimulasiPanelOpen(true)
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
              isLearnMode
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/25 ring-2 ring-emerald-400/40'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/25'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isLearnMode ? 'Mode Simulasi Aktif' : 'Mulai Simulasi Belajar'}</span>
            {isLearnMode && <Check className="w-3.5 h-3.5 ml-0.5 text-emerald-200" />}
          </button>

          {/* Switcher Mayyit (L/P) */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setJenazahGender('L')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                jenazahGender === 'L'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>♂ Jenazah: Suami (L)</span>
            </button>
            <button
              onClick={() => setJenazahGender('P')}
              className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                jenazahGender === 'P'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>♀ Jenazah: Istri (P)</span>
            </button>
          </div>

          {/* Learn Mode Action: Open Side Panel & Reset (Desktop only, mobile uses floating bottom pill) */}
          {isLearnMode ? (
            <div className="hidden sm:flex items-center gap-1.5 animate-in fade-in duration-200">
              <button
                onClick={() => setIsSimulasiPanelOpen(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                  isSimulasiPanelOpen
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Tabel &amp; Kalkulasi</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {totalSelectedHeirCount}
                </span>
              </button>

              <button
                onClick={handleResetHeirs}
                title="Reset Ahli Waris Terpilih"
                className="px-2.5 py-1.5 rounded-xl font-semibold text-xs border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            /* Standard Filter Chips */
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {FILTER_TABS.map(tab => {
                const active = filterMode === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterMode(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: Search Box & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative w-36 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ahli waris..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="Perkecil Kanvas"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-semibold text-slate-700 min-w-[36px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="Perbesar Kanvas"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-colors border-l border-slate-200 ml-0.5"
              title="Reset Tampilan Kanvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ═══ FULL-SCREEN CANVAS WORKSPACE ═══════════════════════════ */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full flex-1 h-full min-h-0 bg-slate-50/70 overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* World Transform Container */}
        <div
          className="absolute origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            width: 2800,
            height: 1350,
          }}
        >
          {/* SVG Connector Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {renderConnectors()}
            {renderUnionLines()}
          </svg>

          {/* Marriage Union Nodes Layer (Love Icon) */}
          {SHAJARAH_UNIONS.map(union => {
            const sp1 = nodeMap.get(union.spouse1)
            const sp2 = nodeMap.get(union.spouse2)
            if (!sp1 || !sp2) return null

            const ux = (sp1.canvas_pos.x + CARD_WIDTH + sp2.canvas_pos.x) / 2 - 16
            const uy = sp1.canvas_pos.y + CARD_HEIGHT / 2 - 16

            return (
              <div
                key={union.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (union.id === 'union_mayyit_pasangan' && pasanganNode) {
                    setSelectedNode(pasanganNode)
                  } else {
                    setSelectedNode(sp1)
                  }
                }}
                className="union-node group absolute z-20 hover:scale-125 transition-transform duration-150 cursor-pointer"
                style={{
                  left: ux,
                  top: uy,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#FFF1F2',
                  border: '2px solid #E11D48',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={`${union.label} (Sabab/Pernikahan Sahih). Klik untuk info.`}
              >
                <HeartHandshake className="w-4 h-4 text-rose-600 transition-transform group-hover:scale-110" />
              </div>
            )
          })}

          {/* Cards Layer (PersonNode style with Live Simulation Engine Integration) */}
          {SHAJARAH_WARATSAH_NODES.map(node => {
            const active = isNodeActive(node)
            const isHovered = hoveredNodeId === node.id
            const isFocal = node.id === 'mayyit'
            const isPasangan = node.id === 'pasangan'
            const badge = getBadgeStyle(node)

            // Simulation state for this card
            const isHeirSelected = Boolean(selectedHeirs[node.id] && selectedHeirs[node.id] > 0)
            const heirQty = selectedHeirs[node.id] || 0
            const heirResult = heirResultMap.get(node.id)
            const isMahjub = Boolean(heirResult && heirResult.status === 'gugur_hijab')
            const isAshabah = Boolean(heirResult && heirResult.status.startsWith('ashabah'))

            const displayNamaArab = isPasangan
              ? jenazahGender === 'L' ? 'الزَّوْجَة' : 'الزَّوْج'
              : node.nama_arab
            const displayNamaId = isPasangan
              ? jenazahGender === 'L' ? 'Istri (Almh)' : 'Suami (Alm)'
              : isFocal
              ? jenazahGender === 'L' ? 'Mayyit (Pewaris L)' : 'Mayyitah (Pewaris P)'
              : node.nama_id

            const displayEmoji = isPasangan
              ? jenazahGender === 'L' ? '👰' : '🤵'
              : isFocal
              ? jenazahGender === 'L' ? '👨‍🎓' : '👩‍🎓'
              : node.emoji

            const nodeGender = isPasangan
              ? jenazahGender === 'L' ? 'P' : 'L'
              : isFocal
              ? jenazahGender
              : node.jenis_kelamin

            const porsiList = getNodePorsiList(node, jenazahGender)

            // Card Style computation based on mode
            let cardBackground = '#FFFFFF'
            let cardBorder = '1px solid #E2E8F0'
            let cardBoxShadow = '0 2px 6px rgba(0,0,0,0.04)'
            let cardOpacity = active ? 1 : 0.2

            if (isLearnMode) {
              if (isFocal) {
                cardBackground = 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 50%, #FDE68A 100%)'
                cardBorder = '2.5px solid #D97706'
                cardBoxShadow = '0 0 0 4px rgba(245, 158, 11, 0.25), 0 8px 24px -4px rgba(217, 119, 6, 0.25)'
                cardOpacity = 1
              } else if (isHeirSelected) {
                cardOpacity = 1
                if (isMahjub) {
                  cardBackground = '#FEF2F2'
                  cardBorder = '2px solid #EF4444'
                  cardBoxShadow = isHovered
                    ? '0 0 0 4px rgba(239, 68, 68, 0.25), 0 10px 24px -4px rgba(239, 68, 68, 0.2)'
                    : '0 0 0 3px rgba(239, 68, 68, 0.15), 0 4px 12px rgba(239, 68, 68, 0.1)'
                } else if (isAshabah) {
                  cardBackground = '#FFFDF5'
                  cardBorder = '2px solid #F59E0B'
                  cardBoxShadow = isHovered
                    ? '0 0 0 4px rgba(245, 158, 11, 0.25), 0 10px 24px -4px rgba(245, 158, 11, 0.2)'
                    : '0 0 0 3px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(245, 158, 11, 0.1)'
                } else {
                  cardBackground = '#F0F9FF'
                  cardBorder = '2px solid #2563EB'
                  cardBoxShadow = isHovered
                    ? '0 0 0 4px rgba(37, 99, 235, 0.25), 0 10px 24px -4px rgba(37, 99, 235, 0.2)'
                    : '0 0 0 3px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(37, 99, 235, 0.1)'
                }
              } else {
                // Unselected in learn mode (soft muted / ready to be clicked)
                cardOpacity = isHovered ? 0.95 : 0.42
                cardBackground = isHovered ? '#EFF6FF' : '#F8FAFC'
                cardBorder = isHovered ? '2px dashed #3B82F6' : '1.5px dashed #94A3B8'
                cardBoxShadow = isHovered ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
              }
            } else {
              // Normal exploration mode
              if (isFocal) {
                cardBackground = 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 50%, #FDE68A 100%)'
                cardBorder = isHovered ? '2.5px solid #2563EB' : '2.5px solid #D97706'
                cardBoxShadow = isHovered
                  ? '0 0 0 4.5px rgba(37, 99, 235, 0.22), 0 12px 28px -4px rgba(0,0,0,0.15)'
                  : '0 0 0 3.5px rgba(245, 158, 11, 0.22), 0 6px 18px rgba(217, 119, 6, 0.2)'
              } else {
                cardBackground = '#FFFFFF'
                cardBorder = isHovered ? '2px solid #2563EB' : '1px solid #E2E8F0'
                cardBoxShadow = isHovered
                  ? '0 0 0 3.5px rgba(37, 99, 235, 0.18), 0 10px 24px -4px rgba(0,0,0,0.12)'
                  : '0 2px 6px rgba(0,0,0,0.04)'
              }
            }

            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => {
                  if (isLearnMode) {
                    if (isFocal) {
                      setJenazahGender(prev => (prev === 'L' ? 'P' : 'L'))
                    } else if (isHeirSelected) {
                      handleUpdateHeirQty(node.id, 0)
                    } else {
                      handleUpdateHeirQty(node.id, 1)
                      // Only auto-open on desktop, keep mobile view clean for uninterrupted selection
                      if (typeof window !== 'undefined' && window.innerWidth >= 640 && !isSimulasiPanelOpen) {
                        setIsSimulasiPanelOpen(true)
                      }
                    }
                  } else {
                    setSelectedNode(node)
                  }
                }}
                className={`warits-card absolute z-10 transition-all duration-150 group ${
                  active ? '' : 'pointer-events-none'
                }`}
                style={{
                  left: node.canvas_pos.x,
                  top: node.canvas_pos.y,
                  width: CARD_WIDTH,
                  minHeight: CARD_HEIGHT,
                  padding: '9px 12px 9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  background: cardBackground,
                  border: cardBorder,
                  boxShadow: cardBoxShadow,
                  opacity: cardOpacity,
                  cursor: 'pointer',
                  position: 'absolute',
                }}
              >
                {/* Floating Action / Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full pb-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                    {isLearnMode ? (
                      isFocal ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold shadow-lg shadow-amber-600/30">
                          <User className="w-3 h-3" />
                          <span>Klik untuk Ganti Jenazah (L/P)</span>
                        </div>
                      ) : isHeirSelected ? (
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-full border border-slate-200 shadow-xl">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNode(node)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold shadow-xs transition-transform hover:scale-105"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Dalil</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateHeirQty(node.id, 0)
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-bold border border-rose-200 transition-transform hover:scale-105"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-lg shadow-emerald-600/30">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Klik untuk Tambah Ahli Waris</span>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedNode(node)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                      >
                        <Eye className="w-3 h-3 text-blue-100" />
                        <span>Lihat Syarat &amp; Dalil</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Connection Handles (4 sides) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 border border-white" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 border border-white" />
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 border border-white" />

                {/* 1. TOP ROW: Keterangan Kategori + Gender Icon / Simulation Stepper */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                      maxWidth: isLearnMode && isHeirSelected ? '130px' : '175px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {badge.label}
                  </span>

                  {/* Quantity Stepper in Learn Mode OR Gender Icon */}
                  {isLearnMode && isHeirSelected && !isFocal ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-300 shadow-2xs text-xs"
                    >
                      <button
                        onClick={() => handleUpdateHeirQty(node.id, Math.max(0, heirQty - 1))}
                        className="w-4 h-4 flex items-center justify-center font-bold text-slate-500 hover:text-rose-600 transition-colors"
                        title="Kurangi Jumlah"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-blue-700 text-xs min-w-[14px] text-center font-mono">
                        {heirQty}
                      </span>
                      <button
                        onClick={() => handleUpdateHeirQty(node.id, heirQty + 1)}
                        className="w-4 h-4 flex items-center justify-center font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                        title="Tambah Jumlah"
                      >
                        +
                      </button>
                    </div>
                  ) : nodeGender === 'L' ? (
                    <span
                      title="Laki-laki"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#2563EB',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      ♂
                    </span>
                  ) : (
                    <span
                      title="Perempuan"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: '4px',
                        background: 'rgba(244, 63, 94, 0.12)',
                        color: '#E11D48',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      ♀
                    </span>
                  )}
                </div>

                {/* 2. MIDDLE ICON: Visual Avatar Character Emoticon */}
                <div className="flex items-center justify-center my-1">
                  <span className="text-4xl select-none leading-none transition-transform duration-150 group-hover:scale-115 filter drop-shadow-xs">
                    {displayEmoji}
                  </span>
                </div>

                {/* 3. POSITION & NAME */}
                <div className="text-center px-1">
                  <p className="text-[12px] font-extrabold text-slate-800 leading-tight truncate">
                    {displayNamaId}
                  </p>
                  <p className="font-arabic text-[16px] font-bold text-emerald-850 leading-snug truncate mt-0.5" dir="rtl">
                    {displayNamaArab}
                  </p>
                </div>

                {/* 4. BOTTOM INFO: Live Calculation Badges in Learn Mode vs Static Badges in Exploration Mode */}
                <div className="border-t border-slate-100 pt-1.5 mt-0.5 flex flex-wrap items-center justify-center gap-1">
                  {isLearnMode ? (
                    isFocal ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        🌟 Pewaris (Al-Muwarrits)
                      </span>
                    ) : isHeirSelected ? (
                      isMahjub ? (
                        <div className="text-center w-full">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white border border-rose-700 shadow-xs inline-block animate-pulse">
                            ⛔ MAHJUB (TERHALANG)
                          </span>
                        </div>
                      ) : isAshabah ? (
                        <div className="flex items-center gap-1 flex-wrap justify-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                            ⭐ {heirResult?.status === 'ashabah_bin_nafsih' ? 'Ashabah Sisa' : heirResult?.status === 'ashabah_bil_ghair' ? 'Ashabah 2:1' : 'Ashabah Ma\'al'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Saham: {heirResult?.saham_total_kelompok ?? heirResult?.saham_asal ?? '-'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap justify-center">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-extrabold bg-blue-600 text-white shadow-xs">
                            Porsi: {heirResult?.pecahan || '-'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Saham: {heirResult?.saham_total_kelompok ?? heirResult?.saham_asal ?? '-'}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-dashed border-slate-300">
                        ➕ Klik untuk Jadikan Ahli Waris
                      </span>
                    )
                  ) : (
                    porsiList.map((p, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold leading-none border transition-colors ${
                          p.type === 'ashabah'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : p.type === 'special'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {p.label}
                      </span>
                    ))
                  )}
                </div>

              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal when node clicked */}
      <PohonWarisanDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        jenazahGender={jenazahGender}
      />

      {/* Floating Bottom Bar for Mobile View during Learning Mode */}
      {isLearnMode && !isSimulasiPanelOpen && (
        <div className="fixed bottom-4 left-3 right-3 sm:hidden z-30 animate-in slide-in-from-bottom duration-300">
          <div
            onClick={() => setIsSimulasiPanelOpen(true)}
            className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-2.5 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <Calculator className="w-5 h-5" />
                </div>
                {totalSelectedHeirCount > 0 && (
                  <span
                    key={totalSelectedHeirCount}
                    className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] ring-2 ring-slate-900 animate-bounce shadow-xs"
                  >
                    +{totalSelectedHeirCount}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {totalSelectedHeirCount === 0 ? 'Pilih Ahli Waris di Kanvas' : `${totalSelectedHeirCount} Ahli Waris Terpilih`}
                  </span>
                  {calculationResult?.asal_masalah ? (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700">
                      AM: {calculationResult.asal_masalah}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {totalSelectedHeirCount === 0
                    ? 'Ketuk card pada bagan untuk memilih'
                    : 'Ketuk untuk melihat tabel & kalkulasi'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsSimulasiPanelOpen(true)
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1 flex-shrink-0 active:scale-95 transition-transform"
            >
              <span>Lihat Hasil</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Simulation & Calculation Side Panel */}
      <PohonWarisanSimulasiPanel
        isOpen={isLearnMode && isSimulasiPanelOpen}
        onClose={() => setIsSimulasiPanelOpen(false)}
        jenazahGender={jenazahGender}
        selectedHeirs={selectedHeirs}
        onUpdateHeirQty={handleUpdateHeirQty}
        onResetHeirs={handleResetHeirs}
        onApplyPreset={handleApplyPreset}
        calculationResult={calculationResult}
        tirkahInput={tirkahInput}
        onUpdateTirkahInput={(newInput) => setTirkahInput(prev => ({ ...prev, ...newInput }))}
      />
    </div>
  )
}
