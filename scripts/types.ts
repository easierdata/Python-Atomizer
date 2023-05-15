export interface ImportStatement {
    type: 'Import' | 'ImportFrom';
    names: string[];
    module?: string;
}