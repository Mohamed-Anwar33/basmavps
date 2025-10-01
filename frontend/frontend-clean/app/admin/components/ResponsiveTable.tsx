'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, List, Avatar, Tag, Space, Button, Drawer } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ResponsiveTableProps {
  columns: ColumnsType<any>;
  dataSource: any[];
  loading?: boolean;
  rowKey: string;
  pagination?: any;
  scroll?: { x?: number; y?: number };
  onRowClick?: (record: any) => void;
  mobileCardRender?: (record: any) => React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  dataSource,
  loading = false,
  rowKey,
  pagination,
  scroll,
  onRowClick,
  mobileCardRender,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRecordClick = (record: any) => {
    if (isMobile) {
      setSelectedRecord(record);
      setDrawerVisible(true);
    } else if (onRowClick) {
      onRowClick(record);
    }
  };

  const renderMobileCard = (record: any) => {
    if (mobileCardRender) {
      return mobileCardRender(record);
    }

    // Default mobile card layout
    const titleColumn = columns.find(col => col.key === 'title' || ('dataIndex' in col && col.dataIndex === 'title'));
    const statusColumn = columns.find(col => col.key === 'status' || ('dataIndex' in col && col.dataIndex === 'status'));
    const actionsColumn = columns.find(col => col.key === 'actions');

    return (
      <Card 
        size="small" 
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleRecordClick(record)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <Avatar size={40} icon={<UserOutlined />} />
              <div>
                <div className="font-medium text-gray-900">
                  {titleColumn?.render && titleColumn ? titleColumn.render(record[('dataIndex' in titleColumn ? titleColumn.dataIndex : '') as string], record, 0) : (titleColumn && 'dataIndex' in titleColumn ? record[titleColumn.dataIndex as string] : 'عنصر')}
                </div>
                <div className="text-sm text-gray-500">
                  #{record[rowKey]?.slice(-6)}
                </div>
              </div>
            </div>
            
            {/* Display key information */}
            <div className="space-y-1">
              {columns.slice(0, 3).map((col, index) => {
                if (col.key === 'actions' || col.key === 'title') return null;
                const dataIndex = 'dataIndex' in col ? col.dataIndex : '';
                const value = record[dataIndex as string];
                if (!value) return null;
                
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-500">{col.title as string}:</span>
                    <span className="text-gray-900">
                      {col.render ? col.render(value, record, index) : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {statusColumn && (
            <div className="ml-3">
              {statusColumn?.render ? (
                <div>{statusColumn.render(record[('dataIndex' in statusColumn ? statusColumn.dataIndex : '') as string], record, 0) as React.ReactNode}</div>
              ) : (
                <Tag>{statusColumn && 'dataIndex' in statusColumn ? record[statusColumn.dataIndex as string] : 'غير محدد'}</Tag>
              )}
            </div>
          )}
        </div>
        
        {actionsColumn && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-end">
              {actionsColumn?.render ? (
                <div>{actionsColumn.render(null, record, 0) as React.ReactNode}</div>
              ) : null}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderMobileView = () => (
    <>
      <div className="space-y-3">
        {dataSource.map((record) => (
          <div key={record[rowKey]}>
            {renderMobileCard(record)}
          </div>
        ))}
      </div>
      
      {pagination && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              size="small" 
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange?.(pagination.current - 1)}
            >
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              {pagination.current} من {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button 
              size="small"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange?.(pagination.current + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      <Drawer
        title="تفاصيل العنصر"
        placement="bottom"
        height="70vh"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="mobile-detail-drawer"
      >
        {selectedRecord && (
          <div className="space-y-4">
            {columns.map((col, index) => {
              if (col.key === 'actions') return null;
              const dataIndex = 'dataIndex' in col ? col.dataIndex : '';
              const value = selectedRecord[dataIndex as string];
              if (!value) return null;
              
              return (
                <div key={index} className="border-b border-gray-100 pb-3">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {col.title as string}
                  </div>
                  <div className="text-gray-900">
                    {col.render ? col.render(value, selectedRecord, index) : value}
                  </div>
                </div>
              );
            })}
            
            {/* Actions */}
            {columns.find(col => col.key === 'actions') && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-3">الإجراءات</div>
                <div className="flex flex-wrap gap-2">
                  <div>{columns.find(col => col.key === 'actions')?.render?.(null, selectedRecord, 0) as React.ReactNode}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );

  const renderDesktopView = () => (
    <div className="admin-table-container">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        scroll={scroll}
        className={className}
        size="middle"
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          style: { cursor: onRowClick ? 'pointer' : 'default' }
        })}
      />
    </div>
  );

  return (
    <div className="responsive-table-wrapper">
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

export default ResponsiveTable;
