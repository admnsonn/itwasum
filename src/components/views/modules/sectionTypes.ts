export type SectionDescriptor =
  | {
      kind: 'kpi-row';
      items: {
        id: string;
        label: string;
        value: string | number;
        change?: { direction: 'up' | 'down' | 'flat'; label: string };
        footer?: string;
      }[];
    }
  | {
      kind: 'filter-bar';
      fields: { key: string; label: string; options: { value: string; label: string }[] }[];
    }
  | {
      kind: 'table';
      title?: string;
      columns: { key: string; header: string }[];
      rows: Record<string, string | number>[];
      rowKey: string;
    }
  | {
      kind: 'trend';
      title?: string;
      data: { periode: string; nilai: number; target?: number }[];
      series?: { dataKey: string; label: string; color: string }[];
    }
  | {
      kind: 'distribution';
      title?: string;
      variant: 'donut' | 'horizontal';
      items: { id: string; label: string; value: number; color?: string; displayValue?: string }[];
    }
  | {
      kind: 'matrix';
      title?: string;
      items: { id: string; x: number; y: number; label: string; riskLevel?: 'kritis' | 'tinggi' | 'sedang' | 'rendah' }[];
    }
  | {
      kind: 'heatmap';
      title?: string;
      rows: string[];
      cols: string[];
      cells: { rowId: string; colId: string; value: number; label?: string }[];
    }
  | {
      kind: 'timeline';
      title?: string;
      items: { id: string; title: string; description?: string; timestamp: string; tone?: 'default' | 'success' | 'warning' | 'danger' }[];
    }
  | {
      kind: 'workflow';
      title?: string;
      variant: 'steps' | 'approval';
      steps: string[] | { id: string; label: string; actor?: string; status?: 'menunggu' | 'disetujui' | 'ditolak' | 'terlewati'; timestamp?: string }[];
      currentStep?: number;
    }
  | {
      kind: 'narrative';
      title?: string;
      body: string;
      bullets?: string[];
    }
  | {
      kind: 'detail-slideover';
      triggerLabel: string;
      title: string;
      body: string;
      facts?: { label: string; value: string }[];
    }
  | {
      kind: 'awaiting-integration';
      sumber: string;
      tahap?: string;
      kontrak?: string;
    };
