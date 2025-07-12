'use client';

import { Box } from '@chakra-ui/react';
import {
  ResponsiveSankey,
  type SankeyLayerId,
  type SankeyNodeDatum,
} from '@nivo/sankey';
import type { Flow } from '@/models/type';

type Props = {
  flows: Flow[];
};
type Data = {
  nodes: DataNode[];
  links: DataLink[];
};
type DataNode = {
  id: string;
  direction: string;
  value: number;
};
type DataLink = {
  source: string;
  target: string;
  value: number;
};

export function BoardChart({ flows }: Props) {
  const data: Data = {
    nodes: flows.map((item) => ({
      id: item.name,
      direction: item.direction,
      value: item.value,
    })),
    links: flows
      .map((item) => {
        if (item.name === '総収入') {
          return null;
        }
        if (item.direction === 'income') {
          return {
            source: item.name,
            target: item.parent,
            value: item.value,
          };
        }
        if (item.direction === 'expense') {
          return {
            source: item.parent,
            target: item.name,
            value: item.value,
          };
        }
      })
      .filter((item): item is DataLink => item !== null),
  };

  return (
    <Box w={'full'} overflowX={'auto'}>
      <Box w={'940px'} h={'600px'} className="sankey-chart">
        <ResponsiveSankey
          data={data}
          colors={(node) =>
            node.direction === 'income' ? '#00BCD4' : '#E91E63'
          }
          label={(node) => `${node.id}: ${node.value.toLocaleString()}`}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          layers={[
            'links',
            'nodes',
            CustomLabelsLayer as unknown as SankeyLayerId,
          ]}
          nodeSpacing={40}
          isInteractive={false}
          sort={(a, b) => a.index - b.index}
        />
      </Box>
    </Box>
  );
}

const CustomLabelsLayer = ({
  nodes,
}: {
  nodes: SankeyNodeDatum<DataNode, DataLink>[];
}) => {
  return (
    <>
      {nodes.map((node) => {
        const nodeWidth = node.x1 - node.x0;
        const nodeHeight = node.y1 - node.y0;
        // ラベル背景のサイズ計算
        const textPadding = 10;
        const approxCharWidth = 7;
        const labelWidth =
          node.label.length * approxCharWidth + textPadding * 2;
        const labelHeight = 30;
        // ノードの右側または左側にラベルを配置するためのオフセット計算
        let labelX: number;
        let labelY: number;
        if (node.id === '総収入') {
          labelX = node.x0 + (nodeWidth - labelWidth) / 2;
          labelY = node.y0 + nodeHeight / 2 - labelHeight / 2;
        } else {
          labelX =
            node.direction === 'income'
              ? node.x1 + 5
              : node.x0 - labelWidth - 5;
          labelY = node.y0 + nodeHeight / 2 - labelHeight / 2;
        }
        return (
          <g key={node.id}>
            {/* ラベルの背景 */}
            <rect
              x={labelX}
              y={labelY}
              width={labelWidth}
              height={labelHeight}
              fill="#ffffffdd"
              rx={4}
              ry={4}
            />
            {/* テキスト */}
            <text
              x={labelX + labelWidth / 2}
              y={labelY + labelHeight / 2 - 2}
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                fill: '#333',
                textAnchor: 'middle',
              }}
            >
              {node.id}
            </text>
            <text
              x={labelX + labelWidth / 2}
              y={labelY + labelHeight / 2 + 11}
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                fill: '#333',
                textAnchor: 'middle',
              }}
            >
              {node.value.toLocaleString()}
            </text>
          </g>
        );
      })}
    </>
  );
};
