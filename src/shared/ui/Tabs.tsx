import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
}>({
    value: '',
    onValueChange: () => { },
});

const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
    const [value, setValue] = React.useState(defaultValue);

    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div className={cn('', className)}>{children}</div>
        </TabsContext.Provider>
    );
};

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'inline-flex h-10 items-center justify-center border-b border-border-default',
                className
            )}
        >
            {children}
        </div>
    );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
    const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
    const isActive = selectedValue === value;

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center px-lg py-sm text-sm uppercase tracking-wide transition-colors',
                'hover:text-text-primary',
                isActive
                    ? 'text-text-primary border-b-2 border-text-primary -mb-[1px]'
                    : 'text-text-secondary',
                className
            )}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
    const { value: selectedValue } = React.useContext(TabsContext);

    if (selectedValue !== value) return null;

    return <div className={cn('mt-lg', className)}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
