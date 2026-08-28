import type { ReactNode } from 'react';

export function PageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-end justify-between gap-4 pb-[10px] bo-rule-heavy">
            <div>
                <div className="mb-2 bo-eyebrow">{eyebrow}</div>
                <h1 className="text-[26px] leading-none font-black tracking-[-0.02em]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}
