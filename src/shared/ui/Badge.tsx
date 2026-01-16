import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-sm px-sm py-xs text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-background-accent text-text-secondary',
                latest: 'bg-status-latest text-white',
                ongoing: 'bg-status-ongoing text-white',
                abc: 'bg-status-abc text-text-primary',
                count: 'bg-transparent text-text-muted',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
