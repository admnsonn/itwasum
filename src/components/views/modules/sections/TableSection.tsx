import React from 'react';
import { Card, Pagination, Table, usePagination } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionRenderContext } from '.';
import type { SectionDescriptor } from '../sectionTypes';

type Props = {
  descriptor: Extract<SectionDescriptor, { kind: 'table' }>;
  ctx: SectionRenderContext;
};

export const TableSection: React.FC<Props> = ({ descriptor, ctx }) => {
  const { page, pageSize, setPage, pageItems } = usePagination(descriptor.rows, 8);
  const clickable = Boolean(ctx.onRowSelect);
  const columns = descriptor.columns.map((c, colIdx) => ({
    key: c.key,
    header: c.header,
    className: clickable ? 'cursor-pointer' : undefined,
    render: (row: Record<string, string | number>) => {
      const text = String(row[c.key] ?? '—');
      if (clickable && colIdx === 0) {
        return (
          <button
            type="button"
            className="text-left font-semibold text-[var(--sd-primary)] hover:underline"
            onClick={() => ctx.onRowSelect?.(row)}
          >
            {text}
          </button>
        );
      }
      return text;
    },
  }));

  return (
    <FadeInUp>
      <Card>
        <Table
          title={descriptor.title}
          columns={columns}
          data={pageItems}
          rowKey={(row) => String(row[descriptor.rowKey])}
          emptyLabel="Tidak ada baris yang sesuai filter"
        />
        {descriptor.rows.length > pageSize && (
          <Pagination
            currentPage={page}
            totalItems={descriptor.rows.length}
            pageSize={pageSize}
            onPageChange={setPage}
            align="end"
          />
        )}
      </Card>
    </FadeInUp>
  );
};
