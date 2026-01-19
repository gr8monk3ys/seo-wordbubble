import { memo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { forceSimulation, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum } from 'd3-force'
import { min, max } from 'd3-array'
import 'd3-transition'
import type { KeywordData, SearchIntent, Difficulty } from '@/types/keywords'
import { INTENT_COLORS, DIFFICULTY_OPACITY } from '@/lib/constants'

interface WordBubbleProps {
  data: KeywordData[]
}

export interface WordBubbleRef {
  getSvgElement: () => SVGSVGElement | null
}

interface BubbleNode extends SimulationNodeDatum {
  text: string
  size: number
  scaledSize: number
  searchIntent: SearchIntent
  difficulty: Difficulty
  variations: string[]
  x: number
  y: number
}

const FILTER_ID = 'neuromorphic-filter'

function ensureFilterExists(svg: ReturnType<typeof select<SVGSVGElement, unknown>>): void {
  if (svg.select(`#${FILTER_ID}`).empty()) {
    const defs = svg.append('defs')
    const filter = defs
      .append('filter')
      .attr('id', FILTER_ID)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur')

    filter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 3)
      .attr('dy', 3)
      .attr('result', 'offsetBlur')

    filter
      .append('feSpecularLighting')
      .attr('in', 'blur')
      .attr('surfaceScale', 4)
      .attr('specularConstant', 0.75)
      .attr('specularExponent', 20)
      .attr('lighting-color', 'white')
      .attr('result', 'specular')
      .append('fePointLight')
      .attr('x', -5000)
      .attr('y', -10000)
      .attr('z', 20000)

    filter
      .append('feComposite')
      .attr('in', 'specular')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'in')
      .attr('result', 'specular')

    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'offsetBlur')
    merge.append('feMergeNode').attr('in', 'specular')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')
  }
}

function updateTooltipContent(tooltip: HTMLDivElement, d: BubbleNode): void {
  // Clear existing content safely
  while (tooltip.firstChild) {
    tooltip.removeChild(tooltip.firstChild)
  }

  // Create title
  const title = document.createElement('div')
  title.className = 'font-semibold'
  title.textContent = d.text
  tooltip.appendChild(title)

  // Create intent line
  const intent = document.createElement('div')
  intent.className = 'text-sm opacity-80'
  intent.textContent = `Intent: ${d.searchIntent}`
  tooltip.appendChild(intent)

  // Create difficulty line
  const difficulty = document.createElement('div')
  difficulty.className = 'text-sm opacity-80'
  difficulty.textContent = `Difficulty: ${d.difficulty}`
  tooltip.appendChild(difficulty)

  // Create variations line
  const variations = document.createElement('div')
  variations.className = 'text-sm opacity-80 mt-1'
  const variationsText = d.variations.length > 0
    ? d.variations.join(', ')
    : 'No variations'
  variations.textContent = `Variations: ${variationsText}`
  tooltip.appendChild(variations)
}

export const WordBubble = memo(forwardRef<WordBubbleRef, WordBubbleProps>(function WordBubble({ data }, ref) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    getSvgElement: () => svgRef.current,
  }))

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const updateChart = (): void => {
      const svgElement = svgRef.current
      const container = svgElement?.parentElement
      if (!svgElement || !container) return

      const width = container.clientWidth
      const height = container.clientHeight

      const svg = select(svgElement)

      // Clear bubbles but preserve filter
      svg.selectAll('g.bubble').remove()

      // Set SVG dimensions
      svg.attr('width', width).attr('height', height)

      // Ensure filter exists
      ensureFilterExists(svg)

      // Scale the sizes
      const sizeScale = scaleLinear()
        .domain([min(data, d => d.size) || 0, max(data, d => d.size) || 100])
        .range([20, Math.min(width, height) / 8])

      const scaledData: BubbleNode[] = data.map((d) => ({
        text: d.text,
        size: d.size,
        scaledSize: sizeScale(d.size),
        searchIntent: d.searchIntent,
        difficulty: d.difficulty,
        variations: d.variations,
        x: width / 2 + Math.random() * 40 - 20,
        y: height / 2 + Math.random() * 40 - 20,
      }))

      // Create and run simulation
      const simulation = forceSimulation<BubbleNode>()
        .nodes(scaledData)
        .force('charge', forceManyBody<BubbleNode>().strength(d => d.scaledSize))
        .force('center', forceCenter<BubbleNode>(width / 2, height / 2))
        .force('collision', forceCollide<BubbleNode>().radius(d => d.scaledSize * 1.2))
        .stop()

      for (let i = 0; i < 300; ++i) simulation.tick()

      // Add bubbles
      const bubbles = svg
        .selectAll<SVGGElement, BubbleNode>('g.bubble')
        .data(scaledData)
        .enter()
        .append('g')
        .attr('class', 'bubble')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('tabindex', '0')
        .attr('role', 'button')
        .attr('aria-label', d => `${d.text}: ${d.searchIntent} intent, ${d.difficulty} difficulty`)
        .style('cursor', 'pointer')

      bubbles.append('circle')
        .attr('r', d => d.scaledSize)
        .style('fill', d => INTENT_COLORS[d.searchIntent])
        .style('opacity', d => DIFFICULTY_OPACITY[d.difficulty])
        .style('filter', `url(#${FILTER_ID})`)
        .style('stroke', d => d.difficulty === 'high' ? '#333' : 'none')
        .style('stroke-width', d => d.difficulty === 'high' ? 2 : 0)
        .style('stroke-dasharray', d => d.difficulty === 'high' ? '4,2' : 'none')

      bubbles
        .append('text')
        .text((d) => d.text)
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .style('fill', 'var(--greyDark)')
        .style('font-weight', '500')
        .style('font-size', d => `${Math.max(12, d.scaledSize / 2)}px`)
        .style('pointer-events', 'none')

      // Hover interactions
      bubbles
        .on('mouseover', function(event: MouseEvent, d: BubbleNode) {
          const bubble = select(this as SVGGElement)

          bubble
            .select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize * 1.1)

          bubble
            .select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(14, d.scaledSize / 1.8)}px`)
            .style('font-weight', '600')

          // Show tooltip
          if (tooltipRef.current) {
            updateTooltipContent(tooltipRef.current, d)
            tooltipRef.current.style.opacity = '1'
            tooltipRef.current.style.left = `${event.pageX + 10}px`
            tooltipRef.current.style.top = `${event.pageY + 10}px`
          }
        })
        .on('mousemove', function(event: MouseEvent) {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX + 10}px`
            tooltipRef.current.style.top = `${event.pageY + 10}px`
          }
        })
        .on('mouseout', function(_event: MouseEvent, d: BubbleNode) {
          const bubble = select(this as SVGGElement)

          bubble
            .select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize)

          bubble
            .select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(12, d.scaledSize / 2)}px`)
            .style('font-weight', '500')

          // Hide tooltip
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0'
          }
        })
        .on('focus', function(event: FocusEvent, d: BubbleNode) {
          const bubble = select(this as SVGGElement)
          const element = event.target as SVGGElement
          const rect = element.getBoundingClientRect()

          bubble.select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize * 1.1)

          bubble.select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(14, d.scaledSize / 1.8)}px`)
            .style('font-weight', '600')

          // Show tooltip near element
          if (tooltipRef.current) {
            updateTooltipContent(tooltipRef.current, d)
            tooltipRef.current.style.opacity = '1'
            tooltipRef.current.style.left = `${rect.right + 10}px`
            tooltipRef.current.style.top = `${rect.top}px`
          }
        })
        .on('blur', function(_event: FocusEvent, d: BubbleNode) {
          const bubble = select(this as SVGGElement)

          bubble.select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize)

          bubble.select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(12, d.scaledSize / 2)}px`)
            .style('font-weight', '500')

          // Hide tooltip
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0'
          }
        })
    }

    updateChart()

    const resizeObserver = new ResizeObserver(updateChart)
    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [data])

  const keywordCount = data.length
  const ariaLabel = `Word bubble visualization showing ${keywordCount} SEO keywords. ${data
    .slice(0, 5)
    .map((d) => d.text)
    .join(', ')}${keywordCount > 5 ? ` and ${keywordCount - 5} more` : ''}`

  return (
    <>
      <svg
        ref={svgRef}
        role="img"
        aria-label={ariaLabel}
        className="w-full h-full"
      />
      <div
        ref={tooltipRef}
        className="fixed z-50 px-3 py-2 rounded-lg bg-white shadow-lg border border-gray-200 opacity-0 pointer-events-none transition-opacity duration-200"
        style={{ maxWidth: '250px' }}
      />
    </>
  )
}))
