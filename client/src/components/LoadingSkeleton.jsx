import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      width: '100%',
      maxWidth: '220px'
    }}>
      <div className="skeleton" style={{ height: '320px', borderRadius: '12px', width: '100%' }} />
      <div className="skeleton" style={{ height: '1.2rem', width: '75%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '0.9rem', width: '50%', borderRadius: '4px' }} />
    </div>
  );
};

export const MovieDetailSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div className="skeleton" style={{ height: '350px', borderRadius: '15px' }} />
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="skeleton" style={{ flex: '1 1 300px', height: '400px', borderRadius: '12px' }} />
        <div style={{ flex: '2 2 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '2.5rem', width: '60%', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '1.2rem', width: '30%', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '100px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem 0' }}>
      <div className="skeleton" style={{ height: '2.5rem', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '2rem', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '2rem', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '2rem', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '2rem', borderRadius: '6px' }} />
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div style={{ height: '300px', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem' }} className="glass">
      <div className="skeleton" style={{ height: '40%', width: '14%', borderRadius: '6px 6px 0 0' }} />
      <div className="skeleton" style={{ height: '70%', width: '14%', borderRadius: '6px 6px 0 0' }} />
      <div className="skeleton" style={{ height: '25%', width: '14%', borderRadius: '6px 6px 0 0' }} />
      <div className="skeleton" style={{ height: '90%', width: '14%', borderRadius: '6px 6px 0 0' }} />
      <div className="skeleton" style={{ height: '55%', width: '14%', borderRadius: '6px 6px 0 0' }} />
      <div className="skeleton" style={{ height: '80%', width: '14%', borderRadius: '6px 6px 0 0' }} />
    </div>
  );
};
