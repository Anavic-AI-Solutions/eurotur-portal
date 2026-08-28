import type { ReactNode } from 'react';

/**
 * Port of the SectionHeading pattern from pages/portal/search-admin.tsx —
 * the portal's own precedent for a CRM-density admin screen.
 */
export function SectionHeading({
    label,
    hint,
}: {
    label: string;
    hint?: ReactNode;
}) {
    return (
        <div className="mt-[38px] mb-[18px] flex items-baseline justify-between gap-4 pb-[10px] bo-rule-heavy">
            <span className="text-[19px] font-black tracking-[-0.01em]">
                {label} <span className="text-primary">—</span>
            </span>

            {hint && <span className="bo-label">{hint}</span>}
        </div>
    );
}
