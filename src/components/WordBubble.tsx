import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WordBubbleProps {
  data: Array<{ text: string; size: number }>;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  text: string;
  size: number;
  scaledSize: number;
  x: number;
  y: number;
}

export default function WordBubble({ data }: WordBubbleProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const updateChart = () => {
      const container = svgRef.current!.parentElement!;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Set SVG dimensions
      d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      // Scale the sizes to be more prominent
      const sizeScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.size) || 0, d3.max(data, d => d.size) || 100])
        .range([20, Math.min(width, height) / 8]);

      const scaledData: BubbleNode[] = data.map(d => ({
        text: d.text,
        size: d.size,
        scaledSize: sizeScale(d.size),
        x: width / 2 + Math.random() * 40 - 20,
        y: height / 2 + Math.random() * 40 - 20,
      }));

      // Create the simulation
      const simulation = d3.forceSimulation<BubbleNode>()
        .nodes(scaledData)
        .force('charge', d3.forceManyBody<BubbleNode>().strength(d => d.scaledSize))
        .force('center', d3.forceCenter<BubbleNode>(width / 2, height / 2))
        .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.scaledSize * 1.2))
        .stop();

      // Run the simulation
      for (let i = 0; i < 300; ++i) simulation.tick();

      const svg = d3.select(svgRef.current);
      
      // Create a color scale
      const color = d3.scaleSequential()
        .domain([0, data.length])
        .interpolator(d3.interpolateHcl('#6d5dfc', '#8abdff'));

      // Add bubbles
      const bubbles = svg.selectAll<SVGGElement, BubbleNode>('g')
        .data(scaledData)
        .enter()
        .append('g')
        .attr('class', 'bubble')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      bubbles.append('circle')
        .attr('r', d => d.scaledSize)
        .style('fill', (_, i) => color(i))
        .style('filter', 'url(#neuromorphic)');

      // Add neuromorphic filter
      const defs = svg.append('defs');
      const filter = defs.append('filter')
        .attr('id', 'neuromorphic')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 2)
        .attr('result', 'blur');

      filter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 3)
        .attr('dy', 3)
        .attr('result', 'offsetBlur');

      filter.append('feSpecularLighting')
        .attr('in', 'blur')
        .attr('surfaceScale', 4)
        .attr('specularConstant', 0.75)
        .attr('specularExponent', 20)
        .attr('lighting-color', '#white')
        .attr('result', 'specular')
        .append('fePointLight')
        .attr('x', -5000)
        .attr('y', -10000)
        .attr('z', 20000);

      filter.append('feComposite')
        .attr('in', 'specular')
        .attr('in2', 'SourceAlpha')
        .attr('operator', 'in')
        .attr('result', 'specular');

      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'offsetBlur');
      merge.append('feMergeNode').attr('in', 'specular');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Add text with dynamic sizing
      bubbles.append('text')
        .text(d => d.text)
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .style('fill', 'var(--greyDark)')
        .style('font-weight', '500')
        .style('font-size', d => `${Math.max(12, d.scaledSize / 2)}px`);

      // Add hover interactions
      bubbles
        .on('mouseover', function(event: MouseEvent, d: BubbleNode) {
          const bubble = d3.select(this as SVGGElement);
          
          bubble.select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize * 1.1);

          bubble.select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(14, d.scaledSize / 1.8)}px`)
            .style('font-weight', '600');
        })
        .on('mouseout', function(event: MouseEvent, d: BubbleNode) {
          const bubble = d3.select(this as SVGGElement);
          
          bubble.select<SVGCircleElement>('circle')
            .transition()
            .duration(300)
            .attr('r', d.scaledSize);

          bubble.select<SVGTextElement>('text')
            .transition()
            .duration(300)
            .style('font-size', `${Math.max(12, d.scaledSize / 2)}px`)
            .style('font-weight', '500');
        });
    };

    // Initial render
    updateChart();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateChart);
    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
    />
  );
}
