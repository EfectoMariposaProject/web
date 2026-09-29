'use client';

import { useState } from 'react';
import { GitBranch, Sparkles, ArrowRight } from 'lucide-react';

export interface TreeNode {
  id: string;
  title: string;
  impact: 'ALTO' | 'MEDIO' | 'CRÍTICO';
  status: string;
  children?: TreeNode[];
}

export function ButterflyTree() {
  const [selectedNode, setSelectedNode] = useState<string>('node-1');

  const nodes: TreeNode[] = [
    {
      id: 'node-1',
      title: 'Carta misteriosa descubierta en el recibidor',
      impact: 'ALTO',
      status: 'Acontecimiento Detonante (Día 1)',
      children: [
        {
          id: 'node-2',
          title: 'Consecuencia A: Laura busca el remitente en el desván',
          impact: 'MEDIO',
          status: 'Ramificación Principal',
        },
        {
          id: 'node-3',
          title: 'Consecuencia B: Alguien nota la carta faltante y actúa',
          impact: 'CRÍTICO',
          status: 'Conflicto Inminente',
        },
      ],
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-amber-600" /> Grafo Nodal de Causalidad (Efecto Mariposa)
        </h3>
        <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
          ● Mapeo Nodal Activo
        </span>
      </div>

      {/* Visual Tree Layout */}
      <div className="space-y-6 py-2">
        {nodes.map((rootNode) => (
          <div key={rootNode.id} className="space-y-4">
            {/* Root Node */}
            <div
              onClick={() => setSelectedNode(rootNode.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                selectedNode === rootNode.id
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> {rootNode.status}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400">
                  IMPACTO: {rootNode.impact}
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-slate-900">{rootNode.title}</h4>
            </div>

            {/* Child Branches */}
            <div className="pl-6 border-l-2 border-amber-400 space-y-3 ml-4">
              {rootNode.children?.map((child) => (
                <div
                  key={child.id}
                  onClick={() => setSelectedNode(child.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    selectedNode === child.id
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-amber-600" /> {child.status}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        child.impact === 'CRÍTICO'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {child.impact}
                    </span>
                  </div>
                  <p className="text-xs font-serif font-semibold text-slate-800">{child.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
