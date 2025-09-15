import React from 'react';
import { ActionSection, ActionSectionProps } from './sections/ActionSection';

type MobileFixedActionsProps = ActionSectionProps;

const MobileFixedActions: React.FC<MobileFixedActionsProps> = (props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <ActionSection {...props} />
    </div>
  );
};

export { MobileFixedActions };
export type { MobileFixedActionsProps };
