import React, { Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary.jsx';
import BuddyFallback from './BuddyFallback.jsx';

const Avatar3D = React.lazy(() => import('../Avatar3D.jsx'));

export default function BuddyPreview({ action = 'idle', large = false }) {
  return (
    <div className="buddyRow" style={{ marginTop: large ? 6 : 10 }}>
      <div className={`buddyFrame ${large ? 'buddyFrameLarge' : ''}`.trim()}>
        <ErrorBoundary fallback={<BuddyFallback />}>
          <Suspense fallback={<BuddyFallback />}>
            <Avatar3D action={action} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
