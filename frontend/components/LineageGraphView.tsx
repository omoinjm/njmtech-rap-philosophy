'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CATEGORY_COLORS, ERA_LABELS } from '@/lib/constants'
import type { Era, LineageGraph, LineageNode, PhilosophicalCategory } from '@/lib/types'
import { ArtistSidePanel } from './ArtistSidePanel'

const ERA_Y: Record<Era, number> = {
  old_school: 0,
  bridge: 220,
  new_school: 440,
}

const CATEGORY_X: Record<PhilosophicalCategory, number> = {
  epistemology_mysticism: 0,
  street_stoicism: 280,
  social_ethics: 560,
  revolutionary_geopolitics: 840,
}

type ArtistNodeData = {
  label: string
  era: Era
  category: PhilosophicalCategory
}

function ArtistFlowNode({ data }: NodeProps<Node<ArtistNodeData>>) {
  const color = CATEGORY_COLORS[data.category]
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-chamber-gold !border-0 !w-2 !h-2" />
      <div
        className="min-w-[140px] border-2 bg-chamber-surface px-3 py-2 shadow-lg"
        style={{ borderColor: color }}
      >
        <p className="font-heading text-sm font-semibold text-white">{data.label}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
          {ERA_LABELS[data.era]}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-chamber-gold !border-0 !w-2 !h-2" />
    </>
  )
}

const nodeTypes = { artist: memo(ArtistFlowNode) }

function buildGraph(data: LineageGraph): { nodes: Node[]; edges: Edge[]; nodeMap: Map<string, LineageNode> } {
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))
  const categoryCounts: Record<string, number> = {}

  const nodes: Node[] = data.nodes.map((n) => {
    const catKey = n.primary_category
    categoryCounts[catKey] = (categoryCounts[catKey] ?? 0) + 1
    const offset = (categoryCounts[catKey] - 1) * 60

    return {
      id: n.id,
      type: 'artist',
      position: {
        x: CATEGORY_X[n.primary_category] + offset,
        y: ERA_Y[n.era] + (offset % 40),
      },
      data: {
        label: n.name,
        era: n.era,
        category: n.primary_category,
      },
    }
  })

  const edges: Edge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.target,
    target: e.source,
    label: e.label ?? undefined,
    labelStyle: { fill: '#888', fontSize: 10 },
    labelBgStyle: { fill: '#0A0A0A', fillOpacity: 0.8 },
    style: { stroke: '#C9A84C', strokeWidth: 1 + e.strength * 0.2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#C9A84C' },
    animated: e.strength >= 8,
  }))

  return { nodes, edges, nodeMap }
}

export function LineageGraphView({ graph }: { graph: LineageGraph }) {
  const [eraFilter, setEraFilter] = useState<Era | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<PhilosophicalCategory | 'all'>('all')
  const [selected, setSelected] = useState<LineageNode | null>(null)

  const { nodes, edges, nodeMap } = useMemo(() => buildGraph(graph), [graph])

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const d = n.data as ArtistNodeData
      if (eraFilter !== 'all' && d.era !== eraFilter) return false
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
      return true
    })
  }, [nodes, eraFilter, categoryFilter])

  const visibleIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  const filteredEdges = useMemo(
    () => edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [edges, visibleIds],
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelected(nodeMap.get(node.id) ?? null)
    },
    [nodeMap],
  )

  return (
    <div className="relative h-[calc(100vh-120px)]">
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        <select
          value={eraFilter}
          onChange={(e) => setEraFilter(e.target.value as Era | 'all')}
          className="border border-chamber-border bg-chamber-surface px-3 py-2 text-xs uppercase tracking-wider text-gray-300"
        >
          <option value="all">All Eras</option>
          <option value="old_school">Old School</option>
          <option value="bridge">Bridge</option>
          <option value="new_school">New School</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PhilosophicalCategory | 'all')}
          className="border border-chamber-border bg-chamber-surface px-3 py-2 text-xs uppercase tracking-wider text-gray-300"
        >
          <option value="all">All Categories</option>
          <option value="epistemology_mysticism">Epistemology & Mysticism</option>
          <option value="street_stoicism">Street Stoicism</option>
          <option value="social_ethics">Social Ethics</option>
          <option value="revolutionary_geopolitics">Revolutionary Geopolitics</option>
        </select>
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background color="#2a2a2a" gap={20} />
        <Controls className="!border-chamber-border !bg-chamber-surface !shadow-none [&>button]:!border-chamber-border [&>button]:!bg-chamber-surface [&>button]:!text-gray-300" />
        <MiniMap
          nodeColor={(n) => CATEGORY_COLORS[(n.data as ArtistNodeData).category]}
          maskColor="rgba(10,10,10,0.8)"
          className="!border-chamber-border !bg-chamber-surface"
        />
      </ReactFlow>

      <ArtistSidePanel artist={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
