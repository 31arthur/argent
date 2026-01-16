/**
 * Indian Bank Metadata
 * Presentation-layer concern for bank logos and display information
 */

export interface BankMetadata {
    id: string;
    name: string; // Translation key
    logo?: string; // Path to logo or emoji
    color?: string; // Brand color for UI
}

export const INDIAN_BANKS: BankMetadata[] = [
    {
        id: 'sbi',
        name: 'banks:banks.sbi',
        logo: '🏦',
        color: '#1C4B9B',
    },
    {
        id: 'hdfc',
        name: 'banks:banks.hdfc',
        logo: '🏦',
        color: '#004C8F',
    },
    {
        id: 'icici',
        name: 'banks:banks.icici',
        logo: '🏦',
        color: '#F37021',
    },
    {
        id: 'axis',
        name: 'banks:banks.axis',
        logo: '🏦',
        color: '#97144D',
    },
    {
        id: 'bob',
        name: 'banks:banks.bob',
        logo: '🏦',
        color: '#FF6B00',
    },
    {
        id: 'pnb',
        name: 'banks:banks.pnb',
        logo: '🏦',
        color: '#0066B3',
    },
    {
        id: 'canara',
        name: 'banks:banks.canara',
        logo: '🏦',
        color: '#E31E24',
    },
    {
        id: 'union',
        name: 'banks:banks.union',
        logo: '🏦',
        color: '#004B87',
    },
    {
        id: 'kotak',
        name: 'banks:banks.kotak',
        logo: '🏦',
        color: '#ED1C24',
    },
    {
        id: 'indusind',
        name: 'banks:banks.indusind',
        logo: '🏦',
        color: '#00539F',
    },
    {
        id: 'yes',
        name: 'banks:banks.yes',
        logo: '🏦',
        color: '#003DA5',
    },
    {
        id: 'idbi',
        name: 'banks:banks.idbi',
        logo: '🏦',
        color: '#006838',
    },
    {
        id: 'other',
        name: 'banks:banks.other',
        logo: '🏦',
        color: '#666666',
    },
];
